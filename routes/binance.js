const express = require('express')
const router = express.Router();
const passport = require('passport');

router.post('/binance/integration', [passport.authenticate("jwt", { session: false })], async (req, res) => {
    const user = req.user
    user.binanceKeys.apiKey = req.body.apiKey;
    user.binanceKeys.secretKey = req.body.secretKey;
    // const { apiKey, secretKey } = req.body
    const savedUser = await user.save();
    res.json(savedUser);
});

router.delete('/binance/integration', [passport.authenticate("jwt", { session: false })], async (req, res) => {
    try {
        const user = req.user
        user.binanceKeys = undefined
        const savedUser = await user.save();
        res.json(savedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete Binance keys' });
    }
});

module.exports = router;