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

const router = express.Router()
router.use((request, response, next) => {
  if (!request.session.uid) {
    response.status(401).end()
    return
  } else {
    next()
  }
})

router.get('/:aid', (request, response) => {
  const aid = parseInt(request.params.aid)

  pool.query('SELECT * FROM bids WHERE aid = $1', [aid], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// GET all bids
router.get('/', (request, response) => {
  pool.query('SELECT * FROM Bids ORDER BY uid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// GET all accepted bids
router.get('/accepted', (request, response) => {
  pool.query('SELECT * FROM accepted', (error, results) => {
    if (error) throw error
    return response.status(200).json(results.rows)
  })
})

// CREATE bid (only passenger can create bid)
// body requires uid (of a passenger), aid of an advertisement, and bidPrice
// trigger should check to make sure constraints are satisfied
router.post('/create', (request, response) => {
  const { aid, numPassengers, bidPrice } = request.body
  console.log(request.body)

  if (request.session.mode) {
    response.status(400).send('Drivers cannot bid on rides.')
  } else if (!bidPrice || !numPassengers || !aid) {
    response.status(400).send('Fields cannot be empty.')
    return
  }
  const uid = request.session.uid

  pool.query(
    'INSERT INTO Bids (uid, aid, numPassengers, bidPrice) VALUES ($1, $2, $3, $4) RETURNING *',
    [uid, aid, numPassengers, bidPrice],
    (error, results) => {
      if (error) {
        throw error
      }
      console.log(results.rows[0])
      response.status(200).json(results.rows[0])
    })
})

// ACCEPT a bid (only drivers can accept a bid)
router.post('/accept', async (request, response) => {

  const { aid } = request.body

  await pool.query('SELECT * FROM (SELECT aid, uid as duid FROM advertisements) as ads natural join (SELECT aid, uid as puid, bidPrice FROM bids) as b1 JOIN (SELECT aid, max(bidPrice) as price FROM bids) as b2 on b1.aid = b2.aid AND b1.bidPrice = b2.price', (error, results) => {
    const { puid, price, duid } = results.rows[0]

    if (duid != request.session.uid) {
      response.status(401).end();
      return
    }

    const acceptBid = async (puid, duid, aid, price) => {
      const client = await pool.connect()

      try {
        await client.query('BEGIN')
        
        await client.query('INSERT INTO Accepted (aid, puid, duid, price) VALUES ($1, $2, $3, $4) RETURNING *', [aid, puid, duid, price])
        
        await client.query('COMMIT')

        await client.release()
        await response.status(200).send('Bid accepted for advertisement: ' + [puid, duid, aid, price])
      } catch (e) {
        await client.query('ROLLBACK')
        response.status(500).send('Bid acceptance transaction failed.')
        throw e
      }
    }
    acceptBid(puid, duid, aid, price)
  })
})

module.exports = router
