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
        response.status(400).json(error)
        return
      }
      response.status(200).json(results.rows[0])
    })
})

// ACCEPT a bid (only drivers can accept a bid)
router.post('/accept', async (request, response) => {

  const { aid } = request.body
  if (!request.session.mode) {
    response.status(401).send('Rider cannot accept ride.')
  }

  await pool.query('SELECT * FROM (SELECT aid, uid as duid FROM advertisements) as ads NATURAL JOIN (SELECT aid, uid as puid, bidPrice FROM bids) as b1 JOIN (SELECT aid as aid2, max(bidPrice) as price FROM bids group by aid2) as b2 on b1.aid = b2.aid2 AND b1.bidPrice = b2.price WHERE aid=$1',[aid], (error, results) => {
    if (error || results.rows.length == 0 || results.rows[0].price === undefined) {
      console.log(error)
      console.log(results.rows)
      response.status(400).end()
      return
    }
    
    let result = results.rows[0]
    const { puid, price, duid } = result;
    if (duid != request.session.uid) {
      response.status(401).end();
      return
    } else if (!puid || !price) {
      response.status(400).send('No bids to accept.').end();
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
