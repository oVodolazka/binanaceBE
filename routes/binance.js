const express = require('express')
const defaultRoute = express.Router();

defaultRoute.get('/binance', (res) => {
    res.send(`What's up rfr?!`);
});

const router = express.Router();
const passport = require('passport');

router.post('/binance/integration', [passport.authenticate("jwt", { session: false })], async (req, res) => {
    const user = await User.findOne({ email: req.user.email })
    user.binanceKeys.apiKey = req.body.apiKey;
    user.binanceKeys.secretKey = req.body.secretKey;
    const savedUser = await user.save();
    res.json(savedUser);
});

router.delete('/binance/integration', [passport.authenticate("jwt", { session: false })], async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email })
        user.binanceKeys = {}
        const savedUser = await user.save();
        res.json(savedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete Binance keys' });
    }
});

module.exports = router;