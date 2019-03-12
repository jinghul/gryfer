const express = require('express');
const app = express()

/* Utils */
const bodyParser = require('body-parser')
const config = require('../config.json')
const pg = require('pg'),
      session = require('express-session'),
      pgSession = require('connect-pg-simple')(session)

/* Routes */
const users = require('./routes/users')
const advertisements = require('./routes/advertisements')
const auth = require('./routes/auth')

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

var pgPool = new pg.Pool({
  user: config.username,
  database: config.database,
  password: config.password,
  host: config.app.host,
  port: config.app.port,
})

app.use(session({
  store: new pgSession({
    pool : pgPool,                // Connection pool
    tableName : 'user_sessions'   // Use another table-name than the default "session" one
  }),
  secret: config.app.secret,
  resave: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}))

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

// API
app.use('/users', users)
app.use('/ads', advertisements)

// Register + Sign in
// TODO: sign in auth
app.post('/register', auth)

app.listen(config.app_port, () => {
  console.log(`App running on port ${config.app_port}.`)
})

