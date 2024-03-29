const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config/db')
const routes = require('./routes');
const express = require('express');
const passport = require('passport');
const cookieSession = require('cookie-session');
const cors = require('cors');
require('./config/passport');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.json());

const passportInitStrategies = require('./config/passport');
passportInitStrategies(passport)

app.use(
  cookieSession({ name: 'session', keys: ['binanceApp']})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  })
);

app.use('/', routes);

mongoose.connect(config.url)
  .then(() => {
    app.listen(PORT, () => {
      console.log('Database connection is Ready and Server is Listening on Port', PORT);
    })
  })
  .catch((err) => {
    console.log('A error has been occurred while connecting to database.', err);
  })