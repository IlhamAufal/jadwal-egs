// middleware/auth.js
const authMiddleware = (req, res, pass) => {
    const apiKey = req.headers['x-api-key'];

    if (apiKey == 'SECRET123') {
        pass();
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
};

module.exports = authMiddleware;