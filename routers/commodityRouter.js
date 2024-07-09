const router = require('express').Router();
const {
    getCommodityItem
} = require("../controllers/commodityController")


router.get('/:id', getCommodityItem)


module.exports = router;