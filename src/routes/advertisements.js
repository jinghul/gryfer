const config = require('../../config.json')
const geolib = require('geolib');
const express = require('express')
const pg = require('pg')

// DB Connection
const pool = new pg.Pool({
  user: config.username,
  database: config.api,
  password: config.password,
  host: config.host,
  port: config.port,
})

const router = express.Router()
router.use((request, response, next) => {
  if (!request.session.uid) {
    response.status(401).end()
    return
  } else {
    next()
  }
})

// Search by toaddress, fromaddress, time, maxPrice, and/or numPassengers
router.get('/search', (request, response, next) => {
  console.log(request.query);
  const { departureTime, maxPrice, numPassengers  } = request.query

  let toAddress = request.query.toAddress;
  let fromAddress = request.query.fromAddress;
  let toLat = request.query.toLat;
  let toLng = request.query.toLng;
  let fromLat = request.query.fromLat;
  let fromLng = request.query.fromLng;
  let whereStrings = []
  let results = []
  let paramCounter = 1

  if (!toLat || !toLng || !fromLat || !fromLng) {
    var place_dict = request.session.place_dict;
    if (place_dict && place_dict[toAddress]) {
      toLat = place_dict[toAddress]['lat']
      toLng = place_dict[toAddress]['lng']
      toAddress = place_dict[toAddress]['street']
    }
    if (place_dict && place_dict[fromAddress]) {
      fromLat = place_dict[fromAddress]['lat']
      fromLng = place_dict[fromAddress]['lng']
      fromAddress = place_dict[fromAddress]['street']
    }
  }

  if (toAddress && (!toLat || !toLng)) {
    whereStrings.push('toAddress = $' + paramCounter.toString())
    results.push(toAddress)
    paramCounter++
  }
  if (fromAddress && (!fromLat || !fromLng)) {
    whereStrings.push('fromAddress = $' + paramCounter.toString())
    results.push(fromAddress)
    paramCounter++
  }
  if (numPassengers) {
    whereStrings.push('(SELECT maxPassengers FROM Cars WHERE cid=(SELECT cid FROM CarProfiles WHERE CarProfiles.uid=Advertisements.uid)) >= $' + paramCounter.toString())
    results.push(numPassengers)
    paramCounter++
  }
  if (departureTime) {
    whereStrings.push('(departureTime > now()::timestamp AND (departureTime BETWEEN $' + paramCounter.toString() + "::timestamp - interval '30 minute' AND $" + paramCounter.toString() +"::timestamp + interval '30 minute'))")
    results.push(departureTime)
    paramCounter++
  } 
  else {
    whereStrings.push('departureTime > now()::timestamp')
  }

  // results.push(request.session.uid)

  let queryString = 'SELECT *, coalesce(currPrice, minBidPrice) as listPrice FROM (SELECT * FROM Advertisements WHERE '
  for (let i = 0; i < whereStrings.length; i++) {
    queryString += whereStrings[i] + ' AND '
  }
  queryString = queryString.slice(0, -5) + ') AS allads'
  // queryString = queryString.concat(' NATURAL LEFT JOIN (SELECT aid, bidPrice FROM Bids where uid = $' + paramCounter.toString() + ') AS userbids')
  queryString = queryString.concat(' NATURAL LEFT JOIN (SELECT aid, max(bidPrice) as currPrice FROM Bids GROUP BY aid) AS currprices')
  
  queryString = queryString.concat(' WHERE aid NOT IN (SELECT aid FROM accepted)')

  if (maxPrice) {
    queryString = queryString.concat(" AND coalesce(currPrice, minBidPrice) <= $" + paramCounter.toString())
    results.push(maxPrice)
  }

  if (whereStrings.length > 1) {
    queryString = queryString.concat(' ORDER BY coalesce(currPrice, minBidPrice)')
  } else {
    queryString = queryString.concat(' ORDER BY departureTime ASC')
  }
  
  console.log(queryString)

  pool.query(queryString, results, (error, results) => {
    if (error) {
      throw error
    }

    let res = results.rows
    if (toLat && toLng) {
      let new_res = []
      for (var i = 0; i < res.length; i++) {
        if (res[i].tolat && res[i].tolng) {
          if (geolib.getDistance({latitude: res[i].tolat, longitude: res[i].tolng}, {latitude: toLat, longitude: toLng}) <= 1000) {
            new_res.push(res[i])
          }
        }
      }
      res = new_res
    }

    if (fromLat && fromLng) {
      let new_res = []
      for (var i = 0; i < res.length; i++) {
        if (res[i].fromlat && res[i].fromlng) {
          if (geolib.getDistance({latitude: res[i].fromlat, longitude: res[i].fromlng}, {latitude: fromLat, longitude: fromLng}) <= 1000) {
            new_res.push(res[i])
          }
        }
      }
      res = new_res
    }

    response.status(200).json(res)
  })
})

// Get all ads
router.get('/', (request, response) => {
  pool.query('SELECT * FROM Advertisements ORDER BY aid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// Get ad by id - for front end
// Driver info + current bids + # of bids + ad info
router.get('/:aid', (request, response) => {
  const aid = parseInt(request.params.aid)
  console.log(aid);
  pool.query("SELECT * FROM (Advertisements NATURAL LEFT JOIN ((SELECT aid, max(bidPrice) as currPrice FROM Bids GROUP BY aid) as b1 INNER JOIN (SELECT aid as aid2, uid as currLead, bidPrice FROM bids) as b2 on b1.aid = b2.aid2 AND b1.currPrice = b2.bidPrice) AS currprices NATURAL LEFT JOIN (SELECT aid, count(uid) as numBids from bids group by aid) as bidCounts NATURAL LEFT JOIN (SELECT aid, bidPrice as userBid FROM Bids where uid = $1) as userbids NATURAL LEFT JOIN users NATURAL LEFT JOIN drivers NATURAL LEFT JOIN (SELECT uid, coalesce(count(aid),0) as tripsdriven FROM (histories natural join (select uid, aid from advertisements) as simpads) GROUP by uid) as numTrips NATURAL LEFT JOIN CarProfiles NATURAL LEFT JOIN cars NATURAL LEFT JOIN (SELECT aid, 'CLOSED' as closed FROM accepted) as status) WHERE aid = $2", [request.session.uid, aid], (error, results) => {
    if (error) {
      console.log(error);
      response.status(400).end();
      return
    }

    result = results.rows[0]
    if (!result) {
      response.status(400).end();
      return;
    }

    if (result.closed !== undefined && result.currlead == request.session.uid) {
      result.winner = true
    }
    if (result.uid == request.session.uid) {
      result.owner = true
    }

    response.status(200).json(result);
  })
})

router.get('/id/:aid', (request, response) => {
  pool.query('SELECT * FROM Advertisements WHERE aid = $1', [request.params.aid], (error, results) => {
    if (error) {
      throw error
    }

    if (results.rows.length == 0) {
      response.status(404).end();
      return;
    }

    response.render('ad_bid', {
      title: 'Listing',
      username: request.session.username,
      email: request.session.email, 
      fname: request.session.fname, 
      lname: request.session.lname, 
      driver: request.session.mode, 
      switchable: request.session.switchable,
      google_key: config.google_key
    })
  })
})

// Get all ads for a user
router.get('/user/:uid', (request, response) => {
  const uid = parseInt(request.params.uid)

  pool.query('SELECT * FROM Advertisements WHERE uid = $1', [uid], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// Create add for a user
router.post('/', (request, response) => {
  if (!request.session.mode) {
    response.status(401).end()
    return
  }

  const { time, minBidPrice } = request.body
  const uid = request.session.uid

  let toAddress = request.body.toAddress;
  let fromAddress = request.body.fromAddress
  let tolat = request.body.tolat;
  let tolng = request.body.tolng;
  let fromlat = request.body.fromlat;
  let fromlng = request.body.fromlng;

  if (!tolat || !tolng || !fromlat || !fromlng) {
    var place_dict = request.session.place_dict;
    console.log(place_dict)
    if (place_dict && place_dict[toAddress]) {
      tolat = place_dict[toAddress]['lat']
      tolng = place_dict[toAddress]['lng']
      toAddress = place_dict[toAddress]['street']
    }
    if (place_dict && place_dict[fromAddress]) {
      fromlat = place_dict[fromAddress]['lat']
      fromlng = place_dict[fromAddress]['lng']
      fromAddress = place_dict[fromAddress]['street']
    }
  }

  pool.query('INSERT INTO Advertisements (fromAddress, fromLat, fromLng, toAddress, toLat, toLng, departureTime, minBidPrice, uid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [fromAddress, fromlat, fromlng, toAddress, tolat, tolng, time, minBidPrice, uid], (error, results) => {
    if (error) {
      throw error
    }
    console.log(results.rows)
    response.status(201).send(`Advertisements added with ID: ${results.rows[0].aid}`)
  })
})

// Update ad by id
router.put('/:aid', (request, response) => {
  const aid = parseInt(request.params.aid)
  const { toAddress, fromAddress, time, minBidPrice } = request.body

  pool.query(
    'UPDATE Advertisements SET toAddress = $1, fromAddress = $2, time = $3, minBidPrice = $4 WHERE aid = $5',
    [toAddress, fromAddress, time, minBidPrice, aid],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`Advertisements modified with AID: ${aid}`)
    }
  )
})

// Delete ad by id
router.delete('/delete/:aid', (request, response) => {
  const aid = parseInt(request.params.aid)
  pool.query('DELETE FROM Advertisements WHERE aid = $1', [aid], (error, results) => {
    if (error) {
      throw error
    }
    console.log(aid + ' deleted');  
    response.status(200).send(`Advertisements deleted with AID: ${aid}`)
  })
})

// Complete an ad (only drivers can accept a bid)
// Trigger will check the advertisement is accepted
router.post('/complete/:aid', (request, response) => {

    const aid = parseInt(request.params.aid)

    pool.query('INSERT INTO Histories (aid, timeCompleted) VALUES ($1, $2) RETURNING *', [aid, new Date()], (error, results) => {
        if (error) {
            throw error
        }
        console.log(results.rows)
        response.status(201).send(`Advertisements completed with ID: ${results.rows[0].aid}`)
    })

})

module.exports = router
