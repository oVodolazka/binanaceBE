const defaultRoute = require('./defaultRoute')
const users = require('./users')
const express = require('express')
const binance = require('./binance')

const routes = express.Router();

routes.use(defaultRoute);
routes.use(users);
routes.use(binance)

module.exports = routes