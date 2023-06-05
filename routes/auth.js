const express = require('express')
const passport = require('passport');

const router = express.Router();
const CLIENT_URL = 'http://localhost:3000/google-login'

router.use('/auth', router);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: CLIENT_URL,
    failureRedirect: '/login/failed',
  })
);

module.exports = router;