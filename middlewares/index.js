const binanceAuth = (req, res, next) => {
    const apiKey = '29khWqeIYik85s3DVpM0gXIZgOWJUfxWObx6zwKL14X7X2vV8fReQPo1IYzrm2WM';
    // const { apiKey } = req.user.binanceKeys
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