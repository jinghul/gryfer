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
  pool.query('SELECT * FROM Advertisement ORDER BY uid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getAdvertisementById = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT * FROM Advertisement WHERE uid = $1', [id], (error, results) => {
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
    response.status(201).send(`Advertisement added with ID: ${results.rows[0].uid}`)
  })
}


const updateAdvertisement = (request, response) => {
  const id = parseInt(request.params.id)
  const { name, email } = request.body

  pool.query(
    'UPDATE Advertisement SET name = $1, email = $2 WHERE id = $3',
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`Advertisement modified with ID: ${id}`)
    }
  )
}


const deleteAdvertisement = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM Advertisement WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Advertisement deleted with ID: ${id}`)
  })
}

module.exports = {
  getAdvertisements,
  getAdvertisementById,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
}
