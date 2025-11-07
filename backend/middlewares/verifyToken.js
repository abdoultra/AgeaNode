const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Normaliser la forme de req.user pour que les controllers puissent utiliser req.user._id et req.user.role
        req.user = {
            _id: decoded.userId || decoded._id || null,
            role: decoded.role || null,
            ...decoded,
        };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Exemple header: "Authorization: Bearer eyJ..."