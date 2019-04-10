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


// router.get('/completeAd')


// GET all histories
router.get('/', (request, response) => {
    pool.query('SELECT * FROM Histories', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
})


// GET the riding history for specific user
router.get('/passenger/:id', (request, response) => {
    const uid = parseInt(request.params.id)
    pool.query("SELECT * FROM Histories NATURAL JOIN Accepted where puid = $1 ORDER BY timeCompleted",[uid], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
})

// GET the driving history for specific user
router.get('/driver/:id', (request, response) => {
    const uid = parseInt(request.params.id)
    pool.query('SELECT * FROM Histories NATURAL JOIN Accepted where duid = $1 ORDER BY timeCompleted',[uid], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
})

// Get the detailed driving stats
router.get('/driver/stats/:id', (request, response) => {
    const uid = parseInt(request.params.id)
    pool.query('SELECT max(price) as mostExpensiveRide, count(*) as numrides FROM Histories NATURAL JOIN Accepted where duid = $1',[uid], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
})

// Get the detailed Riding stats
router.get('/passenger/stats/:id', (request, response) => {
    const uid = parseInt(request.params.id)
    pool.query('SELECT max(price) as mostExpensiveRide, count(*) as numrides FROM Histories NATURAL JOIN Accepted where puid = $1',[uid], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
})

// Get the number of rides given per month
router.get('/driver/months/:id', (request, response) => {
    const uid = parseInt(request.params.id)
    pool.query("SELECT DATE_PART('month', timeCompleted) as month, count(aid) as numRides  FROM Histories NATURAL JOIN Accepted where duid = $1 Group BY DATE_PART('month', timeCompleted)",[uid], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
})

// Get the number of rides taken per month
router.get('/passenger/months/:id', (request, response) => {
    const uid = parseInt(request.params.id)
    pool.query("SELECT DATE_PART('month', timeCompleted) as month, count(aid) as numRides  FROM Histories NATURAL JOIN Accepted where puid = $1 Group BY DATE_PART('month', timeCompleted)",[uid], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
})

module.exports = router
