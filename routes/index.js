const defaultRoute = require('./defaultRoute')
const users = require('./users')
const express = require('express')

const routes = express.Router();

routes.use(defaultRoute);
routes.use(users);

module.exports = routes