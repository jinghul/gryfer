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

// GET all saved destinations
router.get('/', (request, response) => {
  pool.query('SELECT * FROM SavedDestinations ORDER BY uid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
})


// Get a user's saved destinations
router.get('/user', (request, response) => {
  const uid = parseInt(request.session.uid)
  pool.query('SELECT * FROM SavedDestinations WHERE uid = $1 ORDER BY nickname ASC', [uid], (error, results) => {
    if (error) {
      console.log(error)
      throw error
    }
    response.status(200).json(results.rows)
  })
})

// CREATE saved destination 
// body requires uid, nickname of a destination, and address
router.post('/create', (request, response) => {
  const { nickname, address, lat, lng } = request.body
  const uid = request.session.uid;
  pool.query(
    'INSERT INTO SavedDestinations (uid, nickname, address, lat, lng) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [uid, nickname, address, lat, lng],
    (error, results) => {
      if (error) {
        response.status(400).send('Database rejection')
        console.log(error)
        return
      }
      console.log(results.rows[0])
      request.session.place_dict[nickname] = {'street':address,'lat':lat,'lng':lng}
      response.status(200).send('Destination saved: ' + results.rows[0])
    })
})

// UPDATE saved destination
router.put('/update/nickname', (request, response) => {
  const uid = request.session.uid;
  const { oldnickname, nickname, address} = request.body

  pool.query(
    'UPDATE SavedDestinations SET nickname = $1 WHERE uid = $2 and address = $3 and nickname = $4',
    [nickname, uid, address, oldnickname],
    (error, results) => {
      if (error) {
        response.status(400).send(error)
        console.log(error)
        return;
      }
      request.session.place_dict[nickname] = request.session.place_dict[oldnickname]
      request.session.place_dict[oldnickname] = null;
      response.status(200).send(`nickname modified for address: ${address}`)
    }
  )
})

// UPDATE saved destination
router.put('/update/address', (request, response) => {
  const uid = request.session.uid;
  const { oldaddress, nickname, address, lat, lng} = request.body

  pool.query(
    'UPDATE SavedDestinations SET address = $1, lat=$5,lng=$6 WHERE uid = $2 and address = $3 and nickname = $4',
    [address, uid, oldaddress, nickname, lat,lng],
    (error, results) => {
      if (error) {
        response.status(400).send(error);
        console.log(error)
        return
      }

      //update place_dict
      request.session.place_dict[nickname] = {'street':address,'lat':lat,'lng':lng}

      response.status(200).send(`address modified for address: ${address}`)
    }
  )
})

// DELETE nickname for user
router.delete('/delete', (request, response) => {
  const uid = request.session.uid;
  const {nickname} = request.body

  pool.query('DELETE FROM SavedDestinations WHERE uid = $1 and nickname = $2', [uid, nickname], (error, results) => {
    if (error) {
      response.status(400).send(error);
      console.log(error)
      return;
    }

    request.session.place_dict[nickname] = null;

    response.status(200).send(`SavedDestinations deleted with name: ${nickname}`)
  })
})

module.exports = router
