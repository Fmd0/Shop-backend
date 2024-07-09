const router = require('express').Router();
const { getComment } = require("../controllers/commentController");


router.get('/', getComment);


module.exports = router;