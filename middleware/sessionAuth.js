const asyncErrorWrapper = require("../middleware/asyncErrorWrapper")

const sessionAuth = asyncErrorWrapper( async (req, res, next) => {
    if(req.session.userId) {
        next();
    }
    else {
        res.status(401).json({msg: 'Not auth'});
    }
})

module.exports = sessionAuth;