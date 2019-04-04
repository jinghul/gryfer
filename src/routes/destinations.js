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

const router = express.Router();

// GET all saved destinations
router.get('/', (request, response) => {
  pool.query('SELECT * FROM SavedDestinations ORDER BY uid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// Get a user's saved destniations
router.get('/:id', (request, response) => {
  const uid = parseInt(request.params.id)
  pool.query('SELECT * FROM SavedDestinations WHERE uid = $1 ORDER BY nickname ASC', [uid], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// CREATE saved destination 
// body requires uid, nickname of a destination, and address
router.post('/create', (request, response) => {
  const { uid, nickname, address } = request.body
  pool.query(
    'INSERT INTO SavedDestinations (uid, nickname, address) VALUES ($1, $2, $3) RETURNING *',
    [uid, nickname, address],
    (error, results) => {
      if (error) {
        response.status(400).send('Database rejection')
        console.log(error);
        return;
      }
      console.log(results.rows[0])
      response.status(200).send('Destination saved: ' + results.rows[0])
    })
})

// UPDATE saved destination
router.post('/update/:id', (request, response) => {
  const uid = parseInt(request.params.id)
  const { oldNickname, nickname, address} = request.body

  pool.query(
    'UPDATE SavedDestinations SET nickname = $1 WHERE uid = $2 and address = $3 and nickname = $4',
    [nickname, uid, address, oldNickname],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`nickname modified for address: ${address}`)
    }
  )
})

// DELETE nickname for user
router.delete('/:id', (request, response) => {
  const uid = parseInt(request.params.id)
  const {nickname} = request.body

  pool.query('DELETE FROM SavedDestinations WHERE uid = $1 and nickname = $2', [uid, nickname], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`SavedDestinations deleted with name: ${nickname}`)
  })
})

module.exports = router
