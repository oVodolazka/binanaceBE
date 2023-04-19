const express = require('express')
const router = express.Router();
const passport = require('passport');
const axios = require('axios');
const crypto = require('crypto');
const CryptoJS = require('crypto-js');

router.post('/binance/integration', [passport.authenticate("jwt", { session: false })], async (req, res) => {
  const user = req.user
  const { apiKey, secretKey } = req.body;
  user.binanceKeys = { apiKey, secretKey }
  const savedUser = await user.save();
  res.json(savedUser);
});

router.get('/binance/depositHistory', [passport.authenticate("jwt", { session: false })], async (req, res) => {
  const { apiKey, secretKey: apiSecret } = req.user.binanceKeys
  try {
    const timestamp = Date.now();
    const queryString = `&timestamp=${timestamp}&startTime=1657411200000&endTime=1662768000000`
    const signature = CryptoJS.HmacSHA256(queryString, apiSecret).toString();
    const config = {
      method: 'get',
      url: `https://api.binance.com/sapi/v1/capital/deposit/hisrec?&timestamp=${timestamp}&signature=${signature}&startTime=1657411200000&endTime=1662768000000`,
      headers: {
        'Content-Type': 'application/json',
        'X-MBX-APIKEY': apiKey
      }
    };
    const { data } = await axios(config);
    res.json(data);
  } catch (error) {
    console.error(error, 'error');
  }
})


router.get('/binance/address', [passport.authenticate("jwt", { session: false })], async (req, res) => {
  try {
    const { coin, network } = req.query;
    const { apiKey, secretKey: apiSecret } = req.user.binanceKeys
    const timestamp = Date.now()
    const queryString = `coin=${coin}&timestamp=${timestamp}&network=${network}`
    const signature = CryptoJS.HmacSHA256(queryString, apiSecret).toString();

    const config = {
      method: 'get',
      url: `https://api.binance.com/sapi/v1/capital/deposit/address?coin=${coin}&timestamp=${timestamp}&signature=${signature}&network=${network}`,
      headers: {
        'Content-Type': 'application/json',
        'X-MBX-APIKEY': apiKey
      }
    };

    const response = await axios(config);
    res.json(JSON.stringify(response.data))
  } catch (error) {
    console.error(error, 'error');
    res.status(500).send(error.message)
  }
})

router.get('/binance/getcoins', [passport.authenticate("jwt", { session: false })], async (req, res) => {
  const url = 'https://api.binance.com/sapi/v1/capital/config/getall?';
  const { apiKey, secretKey: apiSecret } = req.user.binanceKeys
  try {
    const timestamp = Date.now();
    const signature = crypto.createHmac('sha256', apiSecret)
      .update(`timestamp=${timestamp}`)
      .digest('hex');
    const config = {
      params: {
        timestamp: timestamp,
        signature: signature,
      },
      headers: {
        'Content-Type': 'application/json',
        'X-MBX-APIKEY': apiKey
      },
    };
    const { data } = await axios.get(url, config);
    let result = data
      .filter(item => item.withdrawAllEnable == true && item.networkList[0].name !== 'FIAT')
      .map(({ coin: ticker, name: label, networkList }) => ({
        ticker,
        label,
        networkList
      }))
      .filter(item => {
        const anyMemoRegex = item.networkList.some(network => {
          if (network.specialTips) {
            const upperCase = network.specialTips.toUpperCase()
            return upperCase.includes('MEMO') || upperCase.includes('MSG')
          }
        });
        return !anyMemoRegex
      })
      .map(({ networkList, ...rest }) => ({
        ...rest,
        networkList: networkList.map(({ network, coin: ticker, name: label, }) => ({ network, ticker, label })),
      }))

    res.json(result);

  } catch (error) {
    console.error(error, 'error');
  }
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