const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const config = require('./config/db')
const routes = require('./routes')

const PORT = 3001;

const passport = require('passport');
const users = require('./routes/users');
const app = express();

app.use(passport.initialize());
require('./config/passport')(passport);

app.use(bodyParser.json());
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

