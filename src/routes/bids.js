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

// GET all bids
router.get('/', (request, response) => {
  pool.query('SELECT * FROM Bids ORDER BY uid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

router.get('/:aid', (request, response) => {
  const aid = parseInt(request.params.aid)
  pool.query("SELECT * FROM (Advertisements NATURAL LEFT JOIN (SELECT aid, max(bidPrice) as currPrice FROM Bids GROUP BY aid) AS currprices NATURAL LEFT JOIN (SELECT aid, bidPrice as userBid FROM Bids where uid = $1) as userbids NATURAL LEFT JOIN drivers NATURAL LEFT JOIN (SELECT aid, 'CLOSED' as status FROM accepted)) WHERE aid = $2", [request.session.uid, aid], (error, results) => {
    if (error) {
      console.log(error);
      response.status(400).end();
      return
    }

    let title = results.fromAddress + " to " + results.toAddress
    response.render('ad_bid', {title: title, username: req.session.username, email: req.session.email, fname: req.session.fname, lname: req.session.lname, driver: req.session.mode, switchable: req.session.switchable})
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
  const { uid, aid, bidPrice } = request.body
  pool.query(
    'INSERT INTO Bids (uid, aid, bidPrice) VALUES ($1, $2, $3) RETURNING *',
    [uid, aid, bidPrice],
    (error, results) => {
      if (error) {
        throw error
      }
      console.log(results.rows[0])
      response.status(200).send('New bid created: ' + results.rows[0])
    })
})

// ACCEPT a bid (only drivers can accept a bid)
// Trigger will add the advertisement to history of driver and passenger
router.post('/accept', (request, response) => {
  const { puid, duid, aid, price } = request.body
  pool.query(
    'INSERT INTO accepted (aid, puid, duid, price) VALUES ($1, $2, $3, $4) RETURNING *',
    [aid, puid, duid, price],
    (error, results) => {
      if (error) throw error
      console.log(results.rows[0])
      return response.status(200).send('Bid for advertisement ' + aid + ' accepted.')
    })
})

module.exports = router
