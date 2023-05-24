const express = require('express')
const router = express.Router();
const passport = require('passport');
const axios = require('axios');
const CryptoJS = require('crypto-js');
const binanceAuth = require('../middlewares');

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.send("Welcome");
  }
);

router.post('/binance/integration', [passport.authenticate("jwt", { session: false })], async (req, res) => {
  try {
    const { user } = req
    const { apiKey, secretKey } = req.body;
    user.binanceKeys = { apiKey, secretKey }
    const savedUser = await user.save();
    res.json(savedUser);
  } catch (error) {
    console.log(error, error.message)
  }
});

router.get('/binance/depositHistory', [passport.authenticate("jwt", { session: false }), binanceAuth], async (req, res) => {
  const { start, end } = req.query
  try {
    let { binanceDefaultAxiosConfig: binanceAxiosConfig } = req;
    const { secretKey: apiSecret } = req.user.binanceKeys
    const timestamp = Date.now()
    const queryString = `&timestamp=${timestamp}&startTime=${start}&endTime=${end}`
    const signature = CryptoJS.HmacSHA256(queryString, apiSecret).toString();
    binanceAxiosConfig = { ...binanceAxiosConfig, method: 'get', url: `https://api.binance.com/sapi/v1/capital/deposit/hisrec?${queryString}&signature=${signature}&` }
    const response = await axios(binanceAxiosConfig);
    res.json(response.data)
  } catch (error) {
    res.status(500).send(error.response.data.msg)
  }
})

router.get('/binance/address', [passport.authenticate("jwt", { session: false }), binanceAuth], async (req, res) => {
  try {
    let { binanceDefaultAxiosConfig: binanceAxiosConfig } = req;
    const { coin, network } = req.query;
    const { secretKey: apiSecret } = req.user.binanceKeys
    const timestamp = Date.now()
    const queryString = `coin=${coin}&timestamp=${timestamp}&network=${network}`
    const signature = CryptoJS.HmacSHA256(queryString, apiSecret).toString();
    binanceAxiosConfig = { ...binanceAxiosConfig, method: 'get', url: `https://api.binance.com/sapi/v1/capital/deposit/address?${queryString}&signature=${signature}&` }
    const response = await axios(binanceAxiosConfig);
    res.json(response.data)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.get('/binance/getcoins', [passport.authenticate("jwt", { session: false }), binanceAuth], async (req, res) => {
  try {
    let { binanceDefaultAxiosConfig: binanceAxiosConfig } = req;
    const { secretKey: apiSecret } = req.user.binanceKeys
    const timestamp = Date.now()
    const queryString = `&timestamp=${timestamp}`
    const signature = CryptoJS.HmacSHA256(queryString, apiSecret).toString();
    binanceAxiosConfig = { ...binanceAxiosConfig, method: 'get', url: `https://api.binance.com/sapi/v1/capital/config/getall?&timestamp=${timestamp}&signature=${signature}`}
    const { data } = await axios(binanceAxiosConfig);
    const result = data
      .filter(item => item.withdrawAllEnable && item.networkList[0].name !== 'FIAT')
      .map(({ coin: ticker, name: label, networkList }) => ({
        ticker,
        label,
        networkList
      }))
      .filter(item => {
        const anyMemoRegex = item.networkList.some(network => {
          if (network.specialTips) {
            const lowerCase = network.specialTips.toLowerCase()
            return lowerCase.includes('MEMO') || lowerCase.includes('MSG')
          }
        });
        return !anyMemoRegex
      })
      .map(({ networkList, ...rest }) => ({
        ...rest,
        networkList: networkList.map(({ network, coin: ticker, name: label, }) => ({ network, ticker, label })),
      }))
    res.json(result)
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message)
  }
})

router.delete('/binance/integration', [passport.authenticate("jwt", { session: false }),], async (req, res) => {
  try {
    const user = req.user
    delete user.binanceKeys
    const savedUser = await user.save();
    res.json(savedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete Binance keys' });
  }
});

module.exports = router;