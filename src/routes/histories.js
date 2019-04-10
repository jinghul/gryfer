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

// GET all histories
router.get('/history', (request, response) => {
    pool.query('SELECT * FROM Histories', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
})


// GET the driving history for specific user
router.get('/history/:id', (request, response) => {
    const uid = parseInt(request.params.id)
    pool.query('SELECT * FROM Histories NATURAL JOIN Awhere uid = $1',[uid], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
})

// Create new rating for a passenger
router.post('/passengers', (request, response) => {
    const {byUid, forUid, aid, rating} = request.body
    pool.query(
        'INSERT INTO PassengerRatings (byUid, forUid, aid, rating) VALUES ($1, $2, $3, $4) RETURNING *',
        [byUid, forUid, aid, rating],
        (error, results) => {
            if (error) {
                response.status(400).send('Database rejection')
                throw error
            }
            console.log(results.rows[0])
            response.status(200).send('Rating saved: ' + results.rows[0])
        })
})

// Create new rating for a driver
router.post('/drivers', (request, response) => {
    const {byUid, forUid, aid, rating} = request.body
    console.log(byUid, forUid)
    pool.query(
        'INSERT INTO DriverRatings (byUid, forUid, aid, rating) VALUES ($1, $2, $3, $4) RETURNING *',
        [byUid, forUid, aid, rating],
        (error, results) => {
            if (error) {
                response.status(400).send('Database rejection')
                console.log( error)
                return
            }
            console.log(results.rows[0])
            response.status(200).send('Rating saved: ' + results.rows[0])
        })
})

module.exports = router
