const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const pg = require('pg')
const db = require('./queries')
const User = require('./models/user.js')


// const conString = "postgres://" + config.username + ":" + config.password + "@localhost:5432/" + config.api

// var client = new pg.Client(conString)
// client.connect();

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

app.post('/signup', User.signup)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})

