const config = require('../../config.json')
const express = require('express')
const pg = require('pg')

// DB connection
var pool = new pg.Pool({
  user: config.username,
  database: config.api,
  password: config.password,
  host: config.host,
  port: config.port,
})

var router = express.Router();

// GET all bids
router.get('/', (request, response) => {
  pool.query('SELECT * FROM bid ORDER BY uid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// CREATE bid (only passenger can create bid)
// body requires uid (of a passenger), aid of an advertisement, and bidPrice
// trigger should check to make sure constraints are satisfied
router.post('/', (request, response) => {
  const { uid, aid, bidPrice } = request.body
  pool.query(
    'INSERT INTO bid (uid, aid, bidPrice) VALUES ($1, $2, $3) RETURNING *',
    [uid, aid, bidPrice],
    (error, results) => {
      if (error) {
        throw error
      }
      console.log(results.rows[0])
      response.status(200).send('New bid created: ' + results.rows[0])
    })
})



module.exports = router
