const binanceAuth = (req, res, next) => {
    const { apiKey } = req.user.binanceKeys
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'X-MBX-APIKEY': apiKey
        }
    };
    req.binanceDefaultAxiosConfig = config;
    next();
};

module.exports = binanceAuth 