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

// Search by toaddress, fromaddress, time,  and/or maxPrice
router.get('/search', (request, response, next) => {
  console.log(request.query);
  const { toAddress, toLat, toLng, fromAddress, fromLat, fromLng, departureTime, maxPrice } = request.query
  let whereStrings = []
  let results = []
  let paramCounter = 1
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
  if (departureTime) {
    whereStrings.push('(departureTime > now()::timestamp AND (departureTime BETWEEN $' + paramCounter.toString() + "::timestamp - interval '30 minute' AND $" + paramCounter.toString() +"::timestamp + interval '30 minute'))")
    results.push(departureTime)
    paramCounter++
  } else {
    whereStrings.push('departureTime > now()::timestamp')
  }

  // results.push(request.session.uid)

  let queryString = 'SELECT * FROM (SELECT * FROM Advertisements WHERE '
  for (let i = 0; i < whereStrings.length; i++) {
    queryString += whereStrings[i] + ' AND '
  }
  queryString = queryString.slice(0, -5) + ') AS allads'
  // queryString = queryString.concat(' NATURAL LEFT JOIN (SELECT aid, bidPrice FROM Bids where uid = $' + paramCounter.toString() + ') AS userbids')
  queryString = queryString.concat(' NATURAL LEFT JOIN (SELECT aid, max(bidPrice) as currPrice FROM Bids GROUP BY aid) AS currprices')
  
  if (maxPrice) {
    queryString = queryString.concat(" WHERE coalesce(currPrice, minBidPrice) <= $" + paramCounter.toString())
    results.push(maxPrice)
  }

  queryString = queryString.concat(' ORDER BY coalesce(currPrice, minBidPrice)')
  
  console.log(queryString)

  pool.query(queryString, results, (error, results) => {
    if (error) {
      throw error
    }

    let res = results.rows
    if (toLat && toLng) {
      let new_res = []
      for (var i = 0; i < res.length; i++) {
        if (geolib.getDistance({latitude: res[i].toLat, longitude: res[i].toLng}, {latitude: toLat, longitude: toLng}) <= 1000) {
          new_res += res[i]
        }
      }
      res = new_res
    }
    if (fromLat && fromLng) {
      let new_res = []
      for (var i = 0; i < res.length; i++) {
        if (geolib.getDistance({latitude: res[i].fromLat, longitude: res[i].fromLng}, {latitude: fromLat, longitude: fromLng}) <= 1000) {
          new_res += res[i]
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

  pool.query("SELECT * FROM (Advertisements NATURAL LEFT JOIN (SELECT aid, max(bidPrice) as currPrice FROM Bids GROUP BY aid) AS currprices NATURAL LEFT JOIN (SELECT aid, bidPrice as userBid FROM Bids where uid = $1) as userbids NATURAL LEFT JOIN drivers NATURAL LEFT JOIN (SELECT aid, 'CLOSED' as status FROM accepted)) WHERE aid = $2", [request.session.uid, aid], (error, results) => {
    if (error) {
      console.log(error);
      response.status(400).end();
      return
    }

    response.status(200).json(results.rows);
  })
})

// router.get('/:aid', (request, response) => {
//   const aid = parseInt(request.params.aid)

//   pool.query('SELECT * FROM Advertisements WHERE aid = $1', [aid], (error, results) => {
//     if (error) {
//       throw error
//     }
//     response.status(200).json(results.rows)
//   })
// })


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

  const { toAddress, toLat, toLng, fromAddress, fromLat, fromLng, time, minBidPrice } = request.body
  const uid = request.session.uid
  pool.query('INSERT INTO Advertisements (fromAddress, fromLat, fromLng, toAddress, toLat, toLng, departureTime, minBidPrice, uid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [fromAddress, fromLat, fromLng, toAddress, toLat, toLng, time, minBidPrice, uid], (error, results) => {
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
router.delete('/:aid', (request, response) => {
  const aid = parseInt(request.params.aid)

  pool.query('DELETE FROM Advertisements WHERE aid = $1', [aid], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Advertisements deleted with AID: ${aid}`)
  })
})

module.exports = router
