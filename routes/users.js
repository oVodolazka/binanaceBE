const express = require('express')
const defaultRoute = express.Router();
defaultRoute.get('/users', (req, res) => {
    res.send(`What's up USERS?!`);
});

const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const User = require('../models/User');
const passport = require('passport');
const _ = require('lodash')

router.post('/users/register', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ email: 'Email already exists' });
        }
        else {
            const newUser = new User({
                email: req.body.email,
                password: req.body.password,
                name: req.body.name,
            });
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newUser.password, salt);
            newUser.password = hash;
            const savedUser = await newUser.save();
            const payload = {
                id: savedUser.id,
                name: savedUser.name
            };
            const token = await jwt.sign(payload, keys.secretOrKey, { expiresIn: 31556926 });
            res.json({
                token: 'Bearer ' + token
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
});

router.post('/users/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ error: 'Email not found' })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const payload = {
                id: user.id,
                name: user.name
            };
            const token = await jwt.sign(payload, keys.secretOrKey, { expiresIn: 31556926 });
            res.json({
                token: 'Bearer ' + token
            });
        } else {
            return res.status(400).json({ error: 'Password incorrect' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
});

router.get('/users/me', [passport.authenticate('jwt', { session: false })], async (req, res) => {
    const binanceKeysExist = !!(req.user.binanceKeys.apiKey && req.user.binanceKeys.secretKey)
    const newUser = _.pick(req.user, ['email', 'name']);
    res.json({ user: { ...newUser, binanceKeysExist } })
});

router.get('/login/success', async (req, res) => {
    const { name, email } = req.user._json
    const user = await User.findOne({ email })
    if (user) {
        const id = user._id.toString()
        const payload = {
            id,
            name
        };
        const token = await jwt.sign(payload, keys.secretOrKey, { expiresIn: 31556926 });
        res.status(200).json({
            token: 'Bearer ' + token
        })
    }
    else {
        const newUser = new User({
            email,
            name,
        });
        const savedUser = await newUser.save();
        const payload = {
            id: savedUser.id,
            name: savedUser.name
        };
        const token = await jwt.sign(payload, keys.secretOrKey, { expiresIn: 31556926 });
        res.status(200).json({
            token: 'Bearer ' + token
        });
    }
})

router.get('/login/failed', (res) => {
    res.status(401).json({
        success: false,
        message: 'failure',
    });
});

router.get('/logout', (req) => {
    req.logout();
});

module.exports = router;