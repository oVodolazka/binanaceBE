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

router.post('/users/register', (req, res) => {
    async function emailCheckExist() {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({ email: 'Email already exists' });
            } else {
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });

                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(newUser.password, salt);
                newUser.password = hash;
                const savedUser = await newUser.save();
                res.json(savedUser);
            }
        } catch (error) {
            console.log(error);
            res.status(500).send('Server error');
        }
    }
    emailCheckExist()
});

router.post('/users/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    async function emailNotFoundCheck() {
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
                    success: true,
                    token: 'Bearer ' + token
                });
            } else {
                return res.status(400).json({ error: 'Password incorrect' });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send('Server error');
        }
    }
    emailNotFoundCheck()
});

module.exports = router;

