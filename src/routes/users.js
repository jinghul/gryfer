const config = require('../../config.json')
const express = require('express')
const pg = require('pg')

// DB connection
const pool = new pg.Pool({
  user: config.username,
  database: config.api,
  password: config.password,
  host: config.host,
  port: config.port,
})

var router = express.Router()
router.use((request, response, next) => {
  console.log(request.path)
  if (request.path.slice(0,7) != '/exists' && request.session.uid === undefined) {
    response.status(401).end()
  } else {
    next()
  }
})

// GET users
router.get('/', (request, response) => {
  pool.query('SELECT * FROM Users ORDER BY uid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// GET drivers
router.get('/drivers', (request, response) => {
  pool.query('SELECT * FROM Drivers ORDER by uid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// Get all ads
router.get('/ads/ongoing', (request, response) => {
  const uid = request.session.uid
  if (request.session.mode) {
    pool.query('SELECT * FROM advertisements NATURAL JOIN ((SELECT aid, 1 as filter FROM accepted join passengers on puid=passengers.uid WHERE duid=$1 AND aid NOT IN (SELECT aid from histories)) UNION (SELECT aid, 2 as filter from histories WHERE timeCompleted > now()::timestamp - interval \'1 day\' AND aid not in (SELECT aid from passengerratings))) as candidateRides NATURAL LEFT JOIN (SELECT aid, rating as rated from passengerratings) as rideRated NATURAL JOIN accepted join users on accepted.puid=users.uid join passengers on passengers.uid=puid WHERE departureTime <= now()::timestamp ORDER BY filter, departureTime ASC', [uid], (error, results) => {
      if (error) {
        throw error
      }
  
      response.status(200).json(results.rows[0])
    });
  } else {
    pool.query('SELECT * FROM advertisements NATURAL JOIN ((SELECT aid, 1 as filter FROM accepted join drivers on duid=drivers.uid WHERE puid=$1 AND aid NOT IN (SELECT aid from histories)) UNION (SELECT aid, 2 as filter from histories WHERE timeCompleted > now()::timestamp - interval \'1 day\' AND aid not in (SELECT aid from driverratings))) as candidateRides NATURAL LEFT JOIN (SELECT aid, rating as rated from driverratings) as rideRated NATURAL JOIN accepted join users on accepted.duid = users.uid join carprofiles on duid=carprofiles.uid NATURAL JOIN cars JOIN drivers on drivers.uid = duid WHERE departureTime <= now()::timestamp ORDER BY filter, departureTime ASC', [uid], (error, results) => {
      if (error) {
        throw error
      }
  
      response.status(200).json(results.rows[0])
    });
  }
})

// Get all ads
router.get('/ads/accepted', (request, response) => {
  const uid = request.session.uid
  let qid = 'puid';
  if (request.session.mode) {
    qid = 'duid'
  }

  pool.query('SELECT * FROM advertisements NATURAL JOIN (SELECT aid, price as listprice FROM accepted where ' + qid + '=$1 AND aid not in (SELECT aid from histories)) as acceptRides ORDER BY departureTime ASC', [uid], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})
router.get('/profile', (req, res) => {
  if (!req.session.uid) {
      res.redirect('../auth/signin')
  } else {
      pool.query('SELECT * FROM users NATURAL LEFT JOIN userprofiles NATURAL LEFT JOIN (drivers NATURAL LEFT JOIN carprofiles NATURAL LEFT JOIN cars NATURAL LEFT JOIN (SELECT duid as uid, sum(price) as moneyearned, count(*) as tripsdriven FROM (histories NATURAL JOIN accepted) where duid = $1 group by duid) as drides) as driverInfo NATURAL LEFT JOIN (passengers NATURAL LEFT JOIN (SELECT puid as uid, max(price) as expensiveride, count(*) as tripstaken FROM (Histories NATURAL JOIN Accepted) where puid = $1 group by puid) as prides) as passengerInfo WHERE uid=$1', [req.session.uid], (error, results) => {
          if (error) {
              throw error
          }
          let result = results.rows[0]
          console.log(result)
          res.render('profile', {
              title:'Profile',
              username: req.session.username,
              email: req.session.email,
              fname: req.session.fname,
              lname: req.session.lname,
              driver: req.session.mode,
              switchable: req.session.switchable,
              google_key: config.google_key,
              tripstaken: result.tripstaken,
              expensiveride: result.expensiveride,
              prating: result.prating,
              tripsdriven: result.tripsdriven,
              drating: result.drating,
              moneyearned: result.moneyearned,
              make: result.make,
              model: result.model,
              year: result.year,
              maxpassengers: result.maxpassengers,
              datejoined: result.datejoined
          })
      })
  }
})

router.get('/history', (req, res) => {
    res.render('history', {
        title:'History',
        username: req.session.username,
        email: req.session.email,
        fname: req.session.fname,
        lname: req.session.lname,
        driver: req.session.mode,
        switchable: req.session.switchable,
        google_key: config.google_key,
    })
})

router.get('/saved', (req, res) => {
  console.log('here')
  res.render('saved', {
      title:'Saved Destinations',
      username: req.session.username,
      email: req.session.email,
      fname: req.session.fname,
      lname: req.session.lname,
      driver: req.session.mode,
      switchable: req.session.switchable,
      google_key: config.google_key
  })
})

// Get all ads
router.get('/ads/bidding', (request, response) => {
  const uid = request.session.uid
  if (request.session.mode) {
    pool.query('SELECT * FROM (select * FROM Advertisements where uid=$1) as ads NATURAL LEFT JOIN (SELECT aid, max(bidPrice) as listprice FROM bids group by aid) as userbids WHERE aid not in ((SELECT aid FROM accepted) union (SELECT aid FROM histories)) and departureTime >= now()::timestamp ORDER BY departureTime ASC', [uid], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  } else {
    pool.query('SELECT * FROM advertisements NATURAL JOIN (SELECT aid, max(bidPrice) as listprice FROM bids WHERE uid=$1 group by aid) as userbids where aid not in ((SELECT aid FROM accepted) union (SELECT aid FROM histories)) and departureTime >= now()::timestamp ORDER BY departureTime ASC', [uid], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }
})

// GET passengers
router.get('/passengers', (request, response) => {
  pool.query('SELECT * FROM Passengers ORDER by uid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// Return personal profile only if logged in
router.get('/profile', (request, response) => {
  pool.query('SELECT * FROM (users NATURAL JOIN UserProfiles NATURAL JOIN Accounts) where uid = $1', [req.session.uid], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows[0])
  })
})

router.get('/rides', (request, response) => {
  pool.query('SELECT * FROM (users NATURAL JOIN UserProfiles NATURAL JOIN Accounts) where uid = $1', [req.session.uid], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows[0])
  })
})

// GET a user with id = id
router.get('/:id', (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT * FROM Users WHERE uid = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// Check if user with username exists
router.get('/exists/:username', (request, response) => {
  const username = request.params.username;
  pool.query('SELECT * FROM UserProfiles WHERE username = $1', [username], (error, results) => {
    if (error) {
      console.log(error)
      response.status(500).end()
    } else {
        response.status(200).json(results.rowCount != 0)
    }
  })
})

// UPDATE user id = id
router.post('/:id', (request, response) => {
  const id = parseInt(request.params.id)
  const { name, email } = request.body

  pool.query(
    'UPDATE Users SET name = $1, email = $2 WHERE uid = $3',
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
})

// DELETE user id = id
router.delete('/:id', (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM Users WHERE uid = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
})

module.exports = router
