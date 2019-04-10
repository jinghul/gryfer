const express = require('express')
const app = express()

/* Utils */
const path = require('path')
const config = require('../config.json')
const pg = require('pg'),
    session = require('express-session'),
    pgSession = require('connect-pg-simple')(session)

const pool = new pg.Pool({
    user: config.username,
    database: config.api,
    password: config.password,
    host: config.host,
    port: config.port,
})

app.use(session({
  store: new pgSession({
      pool: pool
  }),
  saveUninitialized: false,
  secret: config.app.secret,
  resave: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
}))

const exphbs = require('express-handlebars')
app.engine(
    'handlebars',
    exphbs({
        extname: 'handlebars',
        layoutDir: path.join(__dirname, "../views/layouts"),
        defaultLayout: 'main',
        helpers: path.join(__dirname, "views/helpers"),
        partialsDir: path.join(__dirname, "../views/partials"),
    })
)
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, "../views"))

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

/* Routes */
const users = require('./routes/users')
const advertisements = require('./routes/advertisements')
const auth = require('./routes/auth')
const bids = require('./routes/bids')
const destinations = require('./routes/destinations')
const ratings = require('./routes/ratings')
const histories = require('./routes/histories')

app.get('/', (req, res) => {
    res.redirect('/home')
})
app.get('/home', (req, res) => {
    res.render('home', {title: 'Gryfer', username: req.session.username, email: req.session.email, fname: req.session.fname, lname: req.session.lname, driver: req.session.mode, switchable: req.session.switchable})
})
app.get('/search', (req, res) => {
    if (!req.session.uid) {
        res.redirect('../auth/signin')
    } else {
        res.render('search', {
            layout: 'ads',
            title : 'Find Rides',
            username: req.session.username,
            email: req.session.email,
            fname: req.session.fname,
            lname: req.session.lname,
            driver: req.session.mode,
            switchable: req.session.switchable,
            google_key: config.google_key
        })
    }
})
app.get('/active', (req, res) => {
    if (!req.session.uid) {
        res.redirect('../auth/signin')
    } else {
        res.render('active_rides', {
            title : 'Active Rides',
            username: req.session.username,
            email: req.session.email,
            fname: req.session.fname,
            lname: req.session.lname,
            driver: req.session.mode,
            switchable: req.session.switchable,
            google_key: config.google_key
        })
    }
})
app.get('/make', (req, res) => {
    if (!req.session.uid) {
        res.redirect('../auth/signin')
    } else if (!req.session.mode) {
        res.redirect('../search')
    } else {
        res.render('make', {layout: 'ads',
            title:'Make Rides',
            username: req.session.username,
            email: req.session.email,
            fname: req.session.fname,
            lname: req.session.lname,
            driver: req.session.mode,
            switchable: req.session.switchable,
            google_key: config.google_key
        })
    }
})

// API
app.use('/users', users)
app.use('/ads', advertisements)
app.use('/auth', auth)
app.use('/bids', bids)
app.use('/destinations', destinations)
app.use('/ratings', ratings)
app.use('/history',histories)

app.use(express.static(path.join(__dirname, '../public/')))

app.listen(config.app.port, () => {
    console.log(`App running on port ${config.app.port}.`)
})
