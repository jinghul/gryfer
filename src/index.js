const express = require('express');
const app = express();

/* Utils */
const path = require('path');
const config = require('../config.json');
const pg = require('pg'),
    session = require('express-session'),
    pgSession = require('connect-pg-simple')(session);

var pool = new pg.Pool({
    user: config.username,
    database: config.api,
    password: config.password,
    host: config.host,
    port: config.port,
});

app.use(session({
  store: new pgSession({
      pool: pool
  }),
  saveUninitialized: false,
  secret: config.app.secret,
  resave: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
}))

const exphbs = require('express-handlebars');
app.engine(
    'handlebars',
    exphbs({
        extname: 'handlebars',
        layoutDir: path.join(__dirname, "../views/layouts"),
        defaultLayout: 'main',
        helpers: path.join(__dirname, "views/helpers"),
        partialsDir: path.join(__dirname, "../views/partials"),
    })
);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, "../views"));

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* Routes */
const users = require('./routes/users');
const advertisements = require('./routes/advertisements');
const auth = require('./routes/auth');

app.get('/', (req, res) => {
    res.redirect('/home')
})
app.get('/home', (req, res) => {
    res.render('home', {title: 'Gryfer'});
});
app.get('/auth', (req, res) => {
    res.render('auth', {title: 'Sign In'})
})
app.get('/search', (req, res) => {
    res.render('search', {layout: 'ads', title : 'Find Rides', username: req.session.username})
})
app.get('/make', (req, res) => {
    res.render('make', {layout: 'ads', title:'Make Rides'})
})

// API
app.use('/users', users);
app.use('/ads', advertisements);
app.use('/auth', auth);


app.use(express.static(path.join(__dirname, '../public/')));

app.listen(config.app.port, () => {
    console.log(`App running on port ${config.app.port}.`);
});
