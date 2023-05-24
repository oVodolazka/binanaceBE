const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const config = require('./config/db')
const routes = require('./routes')
const cors = require('cors')

const PORT = 3001;

const passport = require('passport');
const app = express();

app.use(passport.initialize());
require('./config/passport')(passport)
// require('./middlewares/passportConfig')(passport);

app.use(bodyParser.json());
app.use(cors());
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