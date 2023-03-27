const express = require('express')

const defaultRoute = express.Router();

defaultRoute.get('/', (req, res) => {
  res.send(`What's up doc ?!`);
});

module.exports = defaultRoute
