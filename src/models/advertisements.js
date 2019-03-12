const config = require('../../config.json')

const Pool = require('pg').Pool
const pool = new Pool({
  Advertisement: config.Advertisementname,
  host: 'localhost',
  database: config.api,
  password: config.password,
  port: 5432,
})

const getAdvertisements = (request, response) => {
  pool.query('SELECT * FROM Advertisement ORDER BY aid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getAdvertisementByAdId = (request, response) => {
  const aid = parseInt(request.params.aid)

  pool.query('SELECT * FROM Advertisement WHERE aid = $1', [aid], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getAdvertisementByUserId = (request, response) => {
  const uid = parseInt(request.params.uid)

  pool.query('SELECT * FROM Advertisement WHERE uid = $1', [uid], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}


const createAdvertisement = (request, response) => {
  const { toAddress, fromAddress, time, minBidPrice, uid } = request.body

  pool.query('INSERT INTO Advertisement (fromAddress, toAddress, time, minBidPrice, uid) VALUES ($1, $2, $3, $4, $5) RETURNING *', [fromAddress, toAddress, time, minBidPrice, uid], (error, results) => {
    if (error) {
      throw error
    }
    console.log(results.rows)
    response.status(201).send(`Advertisement added with ID: ${results.rows[0].aid}`)
  })
}


const updateAdvertisement = (request, response) => {
  const aid = parseInt(request.params.aid)
  const { toAddress, fromAddress, time, minBidPrice } = request.body

  pool.query(
    'UPDATE Advertisement SET toAddress = $1, fromAddress = $2, time = $3, minBidPrice = $4 WHERE aid = $5',
    [toAddress, fromAddress, time, minBidPrice, aid],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`Advertisement modified with AID: ${aid}`)
    }
  )
}


const deleteAdvertisement = (request, response) => {
  const aid = parseInt(request.params.aid)

  pool.query('DELETE FROM Advertisement WHERE aid = $1', [aid], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Advertisement deleted with AID: ${aid}`)
  })
}

module.exports = {
  getAdvertisements,
  getAdvertisementByUserId,
  getAdvertisementByAdId,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
}
