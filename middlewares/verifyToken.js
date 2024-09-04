const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Access denied' });
        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;