const router = require('express').Router();
const {
    login,
    register,
    getUser,
    addLike,
    deleteLike,
    getLike,
    getLikeId,
    followMarket,
    notFollowMarket,
    getFollowMarketId
} = require("../controllers/sessionUserController")
const authMiddleware = require("../middleware/auth")


router.post('/login', login);
// router.post('/logout', logout);
router.post('/register', register);
router.get('/', authMiddleware, getUser);

router.get('/like', authMiddleware, getLike);
router.post('/like', authMiddleware, addLike);
router.delete('/like', authMiddleware, deleteLike);
router.get('/like/id', authMiddleware, getLikeId);

router.post('/follow', authMiddleware, followMarket);
router.delete('/follow', authMiddleware, notFollowMarket);
router.get('/follow/id', authMiddleware, getFollowMarketId);



module.exports = router;