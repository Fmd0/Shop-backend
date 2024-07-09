const router = require('express').Router();
const { getSearch } = require('../controllers/searchController');

router.get('/', getSearch);

module.exports = router;