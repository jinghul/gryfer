const config = require('../../config.json')
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
  const { toAddress, fromAddress, departureTime, maxPrice } = request.query
  let whereStrings = []
  let results = []
  let paramCounter = 1
  if (toAddress) {
    whereStrings.push('toAddress = $' + paramCounter.toString())
    results.push(toAddress)
    paramCounter++
  }
  if (fromAddress) {
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

  results.push(request.session.uid)

  let queryString = 'SELECT * FROM (SELECT * FROM Advertisements WHERE '
  for (let i = 0; i < whereStrings.length; i++) {
    queryString += whereStrings[i] + ' AND '
  }
  queryString = queryString.slice(0, -5) + ') AS allads'
  queryString = queryString.concat(' NATURAL LEFT JOIN (SELECT aid, bidPrice FROM Bids where uid = $' + paramCounter.toString() + ') AS userbids')
  queryString = queryString.concat(' NATURAL LEFT JOIN (SELECT aid, max(bidPrice) as currPrice FROM Bids GROUP BY aid) AS currprices')
  
  if (maxPrice) {
    paramCounter++
    queryString = queryString.concat(" WHERE coalesce(currPrice, minBidPrice) <= $" + paramCounter.toString())
    results.push(maxPrice)
  }

  queryString = queryString.concat(' ORDER BY CASE WHEN bidPrice IS NULL THEN 1 ELSE 0 END, coalesce(currPrice, minBidPrice)')
  
  console.log(queryString)
  console.log(results)

  pool.query(queryString, results, (error, results) => {
    if (error) {
      throw error
    }
    console.log(results.rows)
    response.status(200).json(results.rows)
  })
})

const getBestBidPrice = (aid)=>{
    pool.query('',[aid], (error, results) => {
        if (error) {
            throw error
        }
        return results.rows
    })
}

// Get all ads
router.get('/', (request, response) => {
  pool.query('SELECT * FROM Advertisements ORDER BY aid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// Get ad by id
router.get('/:aid', (request, response) => {
  const aid = parseInt(request.params.aid)

  pool.query('SELECT * FROM Advertisements WHERE aid = $1', [aid], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
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

  const { toAddress, fromAddress, time, minBidPrice } = request.body
  const uid = request.session.uid
  pool.query('INSERT INTO Advertisements (fromAddress, toAddress, departureTime, minBidPrice, uid) VALUES ($1, $2, $3, $4, $5) RETURNING *', [fromAddress, toAddress, time, minBidPrice, uid], (error, results) => {
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
