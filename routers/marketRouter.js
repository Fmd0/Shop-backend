const router = require('express').Router();
const {
    getMarket,
    createMarket,
    getMarketItem,
    deleteMarket,
    updateMarket,
    getMarketCommodity
} = require("../controllers/marketController");

router.get('/commodity', getMarketCommodity);
router.get('/', getMarket);
router.post('/', createMarket);
router.get('/:id', getMarketItem);
router.put('/:id', updateMarket);
router.delete('/:id', deleteMarket);


module.exports = router;