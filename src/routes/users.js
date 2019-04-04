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

var router = express.Router();
router.use((request, response, next) => {
  console.log(request.path);
  if (request.path.slice(0,7) != '/exists' && request.session.uid === undefined) {
    response.status(401).end();
  } else {
    next();
  }
})

// GET users
router.get('/', (request, response) => {
  pool.query('SELECT * FROM Users ORDER BY uid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// GET drivers
router.get('/drivers', (request, response) => {
  pool.query('SELECT * FROM Drivers ORDER by uid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// GET passengers
router.get('/passengers', (request, response) => {
  pool.query('SELECT * FROM Passengers ORDER by uid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// Return personal profile only if logged in
router.get('/profile', (request, response) => {
  pool.query('SELECT * FROM (users NATURAL JOIN UserProfile NATURAL JOIN Account) where uid = $1', [req.session.uid], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows[0])
  })
})

// GET a user with id = id
router.get('/:id', (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT * FROM Users WHERE uid = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// Check if user with username exists
router.get('/exists/:username', (request, response) => {
  const username = request.params.username;
  pool.query('SELECT * FROM UserProfile WHERE username = $1', [username], (error, results) => {
    if (error) {
      response.status(500).end();
    } else {
        response.status(200).json(results.rowCount != 0);
    }
  })
});

// CREATE user -- Should not be callable directly, use register
// Add to drivers table if driver = true, else add to passengers table
// If driver, need to put cid as well
router.post('/', (request, response) => {
  (async () => {
    response.status(401).end();
    return;

    const { firstName, lastName, email, pssword, driver, cid } = request.body

    const client = await pool.connect()

    try {
      await client.query('BEGIN')
      const { rows } = await client.query('INSERT INTO Users (fname, lname, email) VALUES ($1, $2, $3) RETURNING uid', [firstName, lastName, email])

      if (driver) {
        console.log("Creating a driver...")
        await client.query('INSERT INTO Drivers (uid, tripsDriven, cid) VALUES ($1, $2, $3)', [rows[0].uid, 0, cid])
      }
      else {
        console.log("Creating a passenger")
        await client.query('INSERT INTO Passengers (uid, tripsTaken) VALUES ($1, $2)', [rows[0].uid, 0])
      }

      await client.query('COMMIT')

    } catch(e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
      response.status(200).send('User successfully created.')
    }
  })().catch(e => {
    response.status(500).end();
    console.error(e.stack)
  })
})

// UPDATE user id = id
router.post('/:id', (request, response) => {
  const id = parseInt(request.params.id)
  const { name, email } = request.body

  pool.query(
    'UPDATE Users SET name = $1, email = $2 WHERE uid = $3',
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

  pool.query('DELETE FROM Users WHERE uid = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
})

module.exports = router
