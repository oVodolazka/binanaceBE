const express = require('express');
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
const _ = require('lodash');
const multer = require('multer');
const Jimp = require("jimp");
const firebase = require("firebase/app");
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");

const firebaseConfig = {
    apiKey: "AIzaSyBXnohuiOwAt7lqSKUzsfdYXnoX7CT2WI8",
    authDomain: "productivity-paid.firebaseapp.com",
    projectId: "productivity-paid",
    storageBucket: "productivity-paid.appspot.com",
    messagingSenderId: "985010783240",
    appId: "1:985010783240:web:a223a2b697b8d56b463dbd",
};
firebase.initializeApp(firebaseConfig);
const firebaseStorage = getStorage();
const { db } = require('../models/User');
const fs = require('fs/promises');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    },
});

const upload = multer({ storage: storage });

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
                avatar: ''
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
    const user = req.user.toObject();
    const binanceKeysExist = !!(req.user.binanceKeys.apiKey && req.user.binanceKeys.secretKey)
    const newUser = _.pick(user, ['email', 'name', 'avatar', '_id']);
    res.json({ user: { ...newUser, binanceKeysExist } })
});

router.get('/login/success', async (req, res) => {
    const { name, email, picture } = req.user._json
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
            avatar: picture
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


router.put('/user-avatar', upload.single('file'), async (req, res) => {
    const { email, id } = req.body
    if (req.file) {
        const path = `images/${req.file.filename}`
        Jimp.read(path, async (err, img) => {
            if (err) throw err;
            const size = Math.min(img.getHeight(), img.getWidth());
            await new Promise((resolve, reject) => {
                img.crop(30, 0, size, size).write(path, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            const storageRef = ref(firebaseStorage, `files/${id}`);
            const fileData = await fs.readFile(path);
            const uploadTask = uploadBytesResumable(storageRef, fileData);
            uploadTask.on(
                "state_changed",
                null,
                (err) => console.log(err),
                async () => {
                    try {
                        const url = await getDownloadURL(uploadTask.snapshot.ref);
                        await db.collection('users').updateOne({ email }, { $set: { avatar: url } });
                        res.jsonp({ status: 200, url });
                    } catch (err) {
                        console.log(err);
                    }
                }
            );
        })
    }
    else {
        await db.collection('users').updateOne({ email }, { $set: { avatar: '' } });
        res.jsonp({ status: 200 });
    }
})

module.exports = router;