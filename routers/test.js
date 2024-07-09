const router = require('express').Router();


router.get('/', (req, res) => {
    res.cookie('exampleCookie', 'cookieValue', { httpOnly: false, secure: false });
    res.send("hello world");
})

module.exports = router;