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

// GET users
router.get('/', (request, response) => {
  pool.query('SELECT * FROM users ORDER BY uid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// GET drivers
router.get('/drivers', (request, response) => {
  pool.query('SELECT * FROM drivers ORDER by uid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// GET passengers
router.get('/passengers', (request, response) => {
  pool.query('SELECT * FROM passengers ORDER by uid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// GET a user with id = id
router.get('/:id', (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT * FROM users WHERE uid = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// CREATE user
// Add to drivers table if driver = true, else add to passengers table
// If driver, need to put cid as well
router.post('/', (request, response) => {
  (async () => {
    const { firstName, lastName, email, pssword, driver, cid } = request.body

    const client = await pool.connect()

    try {
      await client.query('BEGIN')
      const { rows } = await client.query('INSERT INTO users (fname, lname, email) VALUES ($1, $2, $3) RETURNING uid', [firstName, lastName, email])

      if (driver) {
        console.log("Creating a driver...")
        await client.query('INSERT INTO drivers (uid, tripsDriven, cid) VALUES ($1, $2, $3)', [rows[0].uid, 0, cid])
      }
      else {
        console.log("Creating a passenger")
        await client.query('INSERT INTO passengers (uid, tripsTaken) VALUES ($1, $2)', [rows[0].uid, 0])
      }

      await client.query('COMMIT')

    } catch(e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
      response.status(200).send('User successfully created.')
    }
  })().catch(e => console.error(e.stack))
})

// UPDATE user id = id
router.post('/:id', (request, response) => {
  const id = parseInt(request.params.id)
  const { name, email } = request.body

  pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3',
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
})

// DELETE user id = id
router.delete('/:id', (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
})

module.exports = router
