const asyncErrorWrapper = require('../middleware/asyncErrorWrapper');
const z = require('zod');
const bcrypt = require('bcrypt');
const prisma = require('../prisma/prisma');

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

    req.session.userId = data.id;

    res.status(200).json({msg: "Register success", email: data.email});
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
    req.session.userId = data.id;
    // let like = await prisma.user.findUnique({
    //     where: {
    //         id: req.session.userId,
    //     },
    //     select: {
    //         commodities: {
    //             select: {
    //                 id: true,
    //                 name: true,
    //                 images: true,
    //                 rating: true,
    //                 ratingAmount: true,
    //                 price: true,
    //                 promotingPrice: true,
    //             }
    //         }
    //     }
    // })

    // like = like.commodities.map(d => ({
    //     id: d.id,
    //     name: d.name,
    //     image: d.images[0],
    //     rating: d.rating,
    //     ratingAmount: d.ratingAmount,
    //     price: d.price,
    //     promotingPrice: d.promotingPrice,
    // }))
    res.status(200).json({msg: "Login success", email: data.email});
})


const logout = asyncErrorWrapper(async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            res.status(500).json({err});
            return;
        }
        res.clearCookie("connect.sid");
        res.status(200).json({msg: "Logout success"});
    });
})


const getUser = asyncErrorWrapper(async (req, res) => {
    const data = await prisma.user.findUnique({
        where: {
            id: req.session.userId,
        }
    })
    // let like = await prisma.user.findUnique({
    //     where: {
    //         id: req.session.userId,
    //     },
    //     select: {
    //         commodities: {
    //             select: {
    //                 id: true,
    //                 name: true,
    //                 images: true,
    //                 rating: true,
    //                 ratingAmount: true,
    //                 price: true,
    //                 promotingPrice: true,
    //             }
    //         }
    //     }
    // })
    //
    // like = like.commodities.map(d => ({
    //     id: d.id,
    //     name: d.name,
    //     image: d.images[0],
    //     rating: d.rating,
    //     ratingAmount: d.ratingAmount,
    //     price: d.price,
    //     promotingPrice: d.promotingPrice,
    // }))
    res.status(200).json({msg: "Get user success", data});
})


const getLike = asyncErrorWrapper(async (req, res) => {
    let data = await prisma.user.findUnique({
        where: {
            id: req.session.userId,
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
    console.log({
        where: {
            id: req.session.userId,
        },
        data: {
            commodities: {
                connect: {
                    id: req.body.id,
                }
            }
        }
    });
    const data = await prisma.user.update({
        where: {
            id: req.session.userId,
        },
        data: {
            commodities: {
                connect: {
                    id: req.body.id,
                }
            }
        }
    })

    res.status(200).json({msg: "Add like success", data});
})

const deleteLike = asyncErrorWrapper(async (req, res) => {
    const data = await prisma.user.update({
        where: {
            id: req.session.userId,
        },
        data: {
            commodities: {
                disconnect: {
                    id: req.body.id,
                }
            }
        }
    })

    res.status(200).json({msg: "Delete like success", data});
})

const getLikeId = asyncErrorWrapper(async (req, res) => {
    let data = await prisma.user.findUnique({
        where: {
            id: req.session.userId,
        },
        select: {
            commodities: {
                select: {
                    id: true,
                }
            }
        }
    })

    data = data.commodities.map(d => d.id)


    res.status(200).json({msg: "Get like success", data});
})

module.exports = {
    login,
    logout,
    register,
    getUser,
    getLike,
    addLike,
    deleteLike,
    getLikeId
}