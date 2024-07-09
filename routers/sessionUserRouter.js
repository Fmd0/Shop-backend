const router = require('express').Router();
const { login, logout, register, getUser, addLike, deleteLike, getLike, getLikeId} = require("../controllers/sessionUserController")
const sessionAuth = require("../middleware/sessionAuth")


router.post('/login', login);
router.post('/logout', logout);
router.post('/register', register);
router.get('/', sessionAuth, getUser);

router.get('/like', sessionAuth, getLike);
router.post('/like', sessionAuth, addLike);
router.delete('/like', sessionAuth, deleteLike);
router.get('/like/id', sessionAuth, getLikeId);



module.exports = router;