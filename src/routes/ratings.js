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

// GET all ratings for all drivers
router.get('/drivers', (request, response) => {
    pool.query('SELECT * FROM DriverRatings ORDER BY forUid ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
})

// GET all ratings for all passengers
router.get('/passengers', (request, response) => {
    pool.query('SELECT * FROM PassengerRatings ORDER BY forUid ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
})

// GET all ratings for specific drivers
router.get('/drivers/:id', (request, response) => {
    const uid = parseInt(request.params.id)
    pool.query('SELECT * FROM DriverRatings where forUid = $1 ORDER BY byUid ASC',[uid], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
})

// GET all ratings for specific passengers
router.get('/passengers/:id', (request, response) => {
    const uid = parseInt(request.params.id)
    pool.query('SELECT * FROM PassengerRatings where forUid = $1 ORDER BY byUid ASC',[uid], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
})

// Create new rating for a passenger
router.post('/passengers', (request, response) => {
    const {byUid, forUid, aid, rating} = request.body

    const createPassengerRating = async (byUid, forUid, aid, rating) => {
        const client = await pool.connect()

        try {
          await client.query('BEGIN')
          
          await client.query('INSERT INTO PassengerRatings (byUid, forUid, aid, rating) VALUES ($1, $2, $3, $4) RETURNING *', [byUid, forUid, aid, rating])
          await client.query('SELECT * FROM update_rating_passenger($1, $2)', [forUid, rating])
          
          await client.query('COMMIT')

          await client.release()
          await response.status(200).send('PassengerRating inserted for: ' + [byUid, forUid, aid, rating])
        } catch (e) {
          await client.query('ROLLBACK')
          response.status(400).send('Insert passenger rating transaction failed.')
          throw e
        }
  }

  createPassengerRating(byUid, forUid, aid, rating)
})

// Create new rating for a driver
router.post('/drivers', (request, response) => {
    const {byUid, forUid, aid, rating} = request.body
    const createDriverRating = async (byUid, forUid, aid, rating) => {
        const client = await pool.connect()

        try {
          await client.query('BEGIN')
          
          await client.query('INSERT INTO DriverRatings (byUid, forUid, aid, rating) VALUES ($1, $2, $3, $4) RETURNING *', [byUid, forUid, aid, rating])
          await client.query('SELECT * FROM update_rating_driver($1, $2)', [forUid, rating])
          
          await client.query('COMMIT')
          await client.release()
          await response.status(200).send('Driver rating inserted for: ' + [byUid, forUid, aid, rating])
        } catch (e) {
          await client.query('ROLLBACK')
          response.status(400).send('Insert driver rating transaction failed.')
          throw e
        }
    }

    createDriverRating(byUid, forUid, aid, rating)
})

module.exports = router
