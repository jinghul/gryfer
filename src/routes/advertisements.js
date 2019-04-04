const config = require('../../config.json')
const express = require('express')
const pg = require('pg')

// DB Connection
const pool = new pg.Pool({
  Advertisement: config.Advertisementname,
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
router.get('/search', (request, response) => {
  const { toAddress, fromAddress, departureTime, maxPrice } = request.body
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
    whereStrings.push('departureTime = $' + paramCounter.toString())
    results.push(departureTime)
    paramCounter++
  }
  if (maxPrice) {
    whereStrings.push('minBidPrice <= $' + paramCounter.toString())
    console.log('minBidPrice <= $' + paramCounter.toString())
    results.push(maxPrice)
  }

  let queryString = 'SELECT * FROM Advertisement WHERE '
  for (let i = 0; i < whereStrings.length; i++) {
    queryString += whereStrings[i] + ' AND '
  }
  queryString = queryString.slice(0, -5)
  console.log(queryString)

  pool.query(queryString, results, (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

router.get('/', (request, response) => {
  pool.query('SELECT * FROM Advertisement ORDER BY aid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})
router.get('/:aid', (request, response) => {
  const aid = parseInt(request.params.aid)

  pool.query('SELECT * FROM Advertisement WHERE aid = $1', [aid], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

router.get('/user/:uid', (request, response) => {
  const uid = parseInt(request.params.uid)

  pool.query('SELECT * FROM Advertisement WHERE uid = $1', [uid], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})


router.post('/', (request, response) => {
  if (!request.session.mode) {
    response.status(401).end()
    return
  }

  const { toAddress, fromAddress, time, minBidPrice } = request.body
  const uid = request.session.uid
  pool.query('INSERT INTO Advertisement (fromAddress, toAddress, time, minBidPrice, uid) VALUES ($1, $2, $3, $4, $5) RETURNING *', [fromAddress, toAddress, time, minBidPrice, uid], (error, results) => {
    if (error) {
      throw error
    }
    console.log(results.rows)
    response.status(201).send(`Advertisement added with ID: ${results.rows[0].aid}`)
  })
})


router.put('/:aid', (request, response) => {
  const aid = parseInt(request.params.aid)
  const { toAddress, fromAddress, time, minBidPrice } = request.body

  pool.query(
    'UPDATE Advertisement SET toAddress = $1, fromAddress = $2, time = $3, minBidPrice = $4 WHERE aid = $5',
    [toAddress, fromAddress, time, minBidPrice, aid],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`Advertisement modified with AID: ${aid}`)
    }
  )
})


router.delete('/:aid', (request, response) => {
  const aid = parseInt(request.params.aid)

  pool.query('DELETE FROM Advertisement WHERE aid = $1', [aid], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Advertisement deleted with AID: ${aid}`)
  })
})

module.exports = router
