const jwt = require('jsonwebtoken');

var auth = (req, res, next) => {
    const { token } = req.headers;
    try {
        const { email } = jwt.verify(token, process.env.USR_PASSPHRASE);
        req.options = { email };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid token.' });
    }
}

module.exports = { auth };