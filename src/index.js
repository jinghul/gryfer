const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const pg = require('pg')
const db = require('./queries')
const ads = require('./models/advertisements')
const User = require('./models/user.js')

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/users', db.getUsers)
app.get('/users/:id', db.getUserById)
app.post('/users', db.createUser)
app.put('/users/:id', db.updateUser)
app.delete('/users/:id', db.deleteUser)

app.post('/make_advertisement', ads.createAdvertisement)
app.get('/advertisements', ads.getAdvertisements)
app.get('/advertisements/:aid', ads.getAdvertisementByAdId)
app.get('/user_advertisements/:uid', ads.getAdvertisementByUserId)
app.put('/advertisements/:aid', ads.updateAdvertisement)
app.delete('/advertisements/:aid', ads.deleteAdvertisement)


app.post('/signup', User.signup)

app.post('/signin', User.signin)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})

