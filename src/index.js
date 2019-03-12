const express = require('express');
const app = express();

/* Utils */
const path = require('path');
const config = require('../config.json');
const pg = require('pg'),
    session = require('express-session'),
    pgSession = require('connect-pg-simple')(session);

var pgPool = new pg.Pool({
    user: config.username,
    database: config.api,
    password: config.password,
    host: config.host,
    port: config.port,
});

app.use(session({
  store: new pgSession({
      pool: pgPool
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

// API
app.use('/users', users);
app.use('/ads', advertisements);

// Register + Sign in
app.get('/auth', (req, res) => {
    res.render('auth', {title: 'Sign In'})
})
app.use('/auth', auth);

app.use(express.static(path.join(__dirname, '../assets/')));

app.listen(config.app.port, () => {
    console.log(`App running on port ${config.app.port}.`);
});
