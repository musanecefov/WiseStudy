import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied: No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // decoded.id matches your JWT
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};


export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers?.authorization;
    if (!authHeader) return next();
    const token = authHeader.split(" ")[1];
    if (!token) return next();
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
    } catch (err) {
        // ignore invalid token, treat as guest
        console.error(err);
    }
    return next();
};

export const requireAuth = (req, res, next) => {
    const authHeader = req.headers?.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        return next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({ message: "Invalid token" });
    }
};


