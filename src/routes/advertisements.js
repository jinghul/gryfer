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

// TODO: Search queries e.g. by toaddress, fromaddress, time, price

const router = express.Router();
router.use((request, response, next) => {
  if (!request.session.uid) {
    response.status(401).end();
    return;
  } else {
    next();
  }
})

router.get('/:minBidPrice', (request, response) => {
  const minBidPrice = request.params.minBidPrice

  pool.query('SELECT * FROM Advertisement WHERE minBidPrice = $1', [minBidPrice], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

router.get('/:toAddress', (request, response) => {
  const toAddress = request.params.toAddress

  pool.query('SELECT * FROM Advertisement WHERE toAddress = $1', [toAddress], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

router.get('/:fromAddress', (request, response) => {
  const fromAddress = request.params.fromAddress

  pool.query('SELECT * FROM Advertisement WHERE fromAddress = $1', [fromAddress], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

router.get('/:time', (request, response) => {
  const time = request.params.time

  pool.query('SELECT * FROM Advertisement WHERE time = $1', [time], (error, results) => {
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
    response.status(401).end();
    return;
  }

  const { toAddress, fromAddress, time, minBidPrice } = request.body
  const uid = request.session.uid;
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
