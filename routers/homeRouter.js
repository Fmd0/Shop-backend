const router = require('express').Router();
const { getHomeBanner, getHomeStarted} = require("../controllers/homeController");

router.get('/banner', getHomeBanner);
router.get('/started', getHomeStarted);

module.exports = router;