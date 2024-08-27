const asyncErrorWrapper = require('../middleware/asyncErrorWrapper');
const z = require('zod');
const bcrypt = require('bcrypt');
const prisma = require('../prisma/prisma');
const jwt = require('jsonwebtoken');

const UserSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    name: z.string(),
})

const RegisterUserSchema = UserSchema;
const LoginUserSchema = UserSchema.omit({
    name: true,
})

const register = asyncErrorWrapper(async (req, res) => {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const parseResult = RegisterUserSchema.safeParse(req.body);
    if (!parseResult.success) {
        res.status(500).json(parseResult.error.flatten().fieldErrors);
        return;
    }
    const data = await prisma.user.create({
        data: parseResult.data,
    })
    const token = jwt.sign({email: parseResult.data.email,}, process.env.JWT_SECRET, {expiresIn: '7d'});
    res.status(200).json({msg: "Register success", email: data.email, token});
})


const login = asyncErrorWrapper(async (req, res) => {
    const parseResult = LoginUserSchema.safeParse(req.body);
    if (!parseResult.success) {
        res.status(500).json(parseResult.error.flatten().fieldErrors);
        return;
    }
    const data = await prisma.user.findUnique({
        where: {
            email: parseResult.data.email,
        }
    })
    if(!data) {
        res.status(500).json({msg: "User not exist"});
        return;
    }

    const isEqual = await bcrypt.compare(req.body.password, data.password);
    if (!isEqual) {
        res.status(500).json({msg: "Password not valid"});
        return;
    }
    const token = jwt.sign({email: parseResult.data.email,}, process.env.JWT_SECRET, {expiresIn: '7d'});
    res.status(200).json({msg: "Login success", email: data.email, token});
})


// const logout = asyncErrorWrapper(async (req, res) => {
//     req.session.destroy(err => {
//         if (err) {
//             console.log(err);
//             res.status(500).json({err});
//             return;
//         }
//         res.clearCookie("connect.sid");
//         res.status(200).json({msg: "Logout success"});
//     });
// })


const getUser = asyncErrorWrapper(async (req, res) => {
    const data = await prisma.user.findUnique({
        where: {
            email: req.email,
        },
        select: {
            name: true,
            email: true,
        }
    })
    res.status(200).json({msg: "Get user success", data});
})


const getLike = asyncErrorWrapper(async (req, res) => {
    let data = await prisma.user.findUnique({
        where: {
            email: req.email,
        },
        select: {
            commodities: {
                select: {
                    id: true,
                    name: true,
                    images: true,
                    rating: true,
                    ratingAmount: true,
                    price: true,
                    promotingPrice: true,
                }
            }
        }
    })

    data = data.commodities.map(d => ({
        id: d.id,
        name: d.name,
        image: d.images[0],
        rating: d.rating,
        ratingAmount: d.ratingAmount,
        price: d.price,
        promotingPrice: d.promotingPrice,
    }))

    res.status(200).json({msg: "Get like success", data});
})

const addLike = asyncErrorWrapper(async (req, res) => {
    await prisma.user.update({
        where: {
            email: req.email,
        },
        data: {
            commodities: {
                connect: {
                    id: req.body.id,
                }
            }
        }
    })
    res.status(200).json({msg: "Add like success"});
})

const deleteLike = asyncErrorWrapper(async (req, res) => {
    await prisma.user.update({
        where: {
            email: req.email,
        },
        data: {
            commodities: {
                disconnect: {
                    id: req.body.id,
                }
            }
        }
    })

    res.status(200).json({msg: "Delete like success"});
})

const getLikeId = asyncErrorWrapper(async (req, res) => {
    let data = await prisma.user.findUnique({
        where: {
            email: req.email,
        },
        select: {
            commodityIds: true,
        }
    })

    data = data.commodityIds;
    res.status(200).json({msg: "Get like success", data});
})


const followMarket = asyncErrorWrapper(async (req, res) => {
    await prisma.user.update({
        where: {
            email: req.email,
        },
        data: {
            markets: {
                connect: {
                    id: req.body.id,
                }
            }
        }
    })
    res.status(200).json({msg: "Follow market success"});
})

const notFollowMarket = asyncErrorWrapper(async (req, res) => {
    await prisma.user.update({
        where: {
            email: req.email,
        },
        data: {
            markets: {
                disconnect: {
                    id: req.body.id,
                }
            }
        }
    })

    res.status(200).json({msg: "Not follow market success"});
})

const getFollowMarketId = asyncErrorWrapper(async (req, res) => {
    let data = await prisma.user.findUnique({
        where: {
            email: req.email,
        },
        select: {
            marketIds: true,
        }
    })

    data = data.marketIds;
    res.status(200).json({msg: "Get followed market success", data});
})


module.exports = {
    login,
    // logout,
    register,
    getUser,
    getLike,
    addLike,
    deleteLike,
    getLikeId,
    followMarket,
    notFollowMarket,
    getFollowMarketId
}