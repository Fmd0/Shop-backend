const asyncErrorWrapper = require("../middleware/asyncErrorWrapper")
const jwt = require("jsonwebtoken");

const authMiddleware = asyncErrorWrapper( async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({msg: 'Not auth'});
    }
    try {
        const token = authHeader.split(' ')[1];
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.email = user.email;
        return next();
    }
    catch(err) {
        return res.status(401).json({msg: 'Not auth'});
    }
})

module.exports = authMiddleware;