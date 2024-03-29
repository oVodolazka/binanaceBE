const express = require('express')
const router = express.Router();
const passport = require('passport');
const axios = require('axios');
const CryptoJS = require('crypto-js');
const binanceAuth = require('../middlewares');
const _ = require('lodash')

router.post('/binance/integration', [passport.authenticate('jwt', { session: false })], async (req, res) => {
  try {
    const { user } = req
    const { apiKey, secretKey } = req.body;
    user.binanceKeys = { apiKey, secretKey }
    const savedUser = await user.save();
    res.json(savedUser);
  } catch (error) {
    console.log(error)
    res.status(500).send('Something went wrong')
  }
});

router.get('/binance/depositHistory', [passport.authenticate('jwt', { session: false }), binanceAuth], async (req, res) => {
  try {
    const { start, end } = req.query
    let { binanceDefaultAxiosConfig: binanceAxiosConfig } = req;
    const { secretKey: apiSecret } = req.user.binanceKeys
    const timestamp = Date.now()
    const queryString = `&timestamp=${timestamp}&startTime=${start}&endTime=${end}`
    const signature = CryptoJS.HmacSHA256(queryString, apiSecret).toString();
    binanceAxiosConfig = { ...binanceAxiosConfig, method: 'get', url: `https://api.binance.com/sapi/v1/capital/deposit/hisrec?${queryString}&signature=${signature}&` }
    const response = await axios(binanceAxiosConfig);
    const result = response.data.map(item => _.pick(item, ['id', 'coin', 'network', 'amount', 'insertTime']))
    result.map(item => {
      const date = new Date(item.insertTime)
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      item.insertTime = formattedDate
    })
    res.json(result)
  } catch (error) {
    console.log(error)
    const message = error && error.response && error.response.data && error.response.data.msg ? error.response.data.msg : 'Unknown error'
    res.status(500).send(message)
  }
})

router.get('/binance/withdrawHistory', [passport.authenticate('jwt', { session: false }), binanceAuth], async (req, res) => {
  try {
    let { binanceDefaultAxiosConfig: binanceAxiosConfig } = req;
    const { secretKey: apiSecret } = req.user.binanceKeys
    const timestamp = Date.now()
    const queryString = `recvWindow=6000&timestamp=${timestamp}`
    const signature = CryptoJS.HmacSHA256(queryString, apiSecret).toString();
    binanceAxiosConfig = { ...binanceAxiosConfig, method: 'get', url: `https://api.binance.com/sapi/v1/capital/withdraw/history?${queryString}&signature=${signature}` }
    const response = await axios(binanceAxiosConfig);
    const result = response.data.map(item => _.pick(item, ['id', 'coin', 'network', 'amount', 'completeTime', 'transactionFee']))
    res.json(result)
  } catch (error) {
    console.log(error)
    const message = error && error.response && error.response.data && error.response.data.msg ? error.response.data.msg : 'Unknown error'
    res.status(500).send(message)
  }
})

router.get('/binance/address', [passport.authenticate('jwt', { session: false }), binanceAuth], async (req, res) => {
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
    console.log(error)
    res.status(500).send(error.message)
  }
})

router.get('/binance/getcoins', [passport.authenticate('jwt', { session: false }), binanceAuth], async (req, res) => {
  try {
    let { binanceDefaultAxiosConfig: binanceAxiosConfig } = req;
    const { secretKey: apiSecret } = req.user.binanceKeys
    const timestamp = Date.now()
    const queryString = `&timestamp=${timestamp}`
    const signature = CryptoJS.HmacSHA256(queryString, apiSecret).toString();
    binanceAxiosConfig = { ...binanceAxiosConfig, method: 'get', url: `https://api.binance.com/sapi/v1/capital/config/getall?&timestamp=${timestamp}&signature=${signature}` }
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
    console.log(error)
    const message = error && error.response && error.response.data && error.response.data.msg ? error.response.data.msg : 'Unknown error'
    res.status(500).send(message)
  }
})

router.delete('/binance/integration', [passport.authenticate('jwt', { session: false }),], async (req, res) => {
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