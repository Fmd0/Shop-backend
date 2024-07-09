const prisma = require("../prisma/prisma");
const z= require("zod");
const asyncErrorWrapper = require("../middleware/asyncErrorWrapper")

const MarketFormSchema = z.object({
    id: z.string(),
    name: z.union([z.string().min(3), z.literal('')]),
    icon: z.union([z.string().url(), z.literal('')]),
    bigLogo: z.union([z.string().url(), z.literal('')]),
    bigLogoBgColor: z.string(),
    bigLogoFontColor: z.string(),
    bigPic: z.union([z.string().url(), z.literal('')]),
    bigVideo: z.union([z.string().url(), z.literal('')]),
    rating: z.union([z.string(), z.literal('')]),
    ratingAmount: z.union([z.string(), z.literal('')]),
    description: z.union([z.string(), z.literal('')]),
    website: z.union([z.string().url(), z.literal('')]),
    email: z.union([z.string().email(), z.literal('')]),
    telephone: z.union([z.string(), z.literal('')]),
    facebook: z.union([z.string().url(), z.literal('')]),
    twitter: z.union([z.string().url(), z.literal('')]),
    ins: z.union([z.string().url(), z.literal('')]),
    youtube: z.union([z.string().url(), z.literal('')]),
    address: z.union([z.string(), z.literal('')]),
    privacyPolicy: z.union([z.string().url(), z.literal('')]),
    refundPolicy: z.union([z.string().url(), z.literal('')]),
    shippingPolicy: z.union([z.string().url(), z.literal('')]),
})

const CreateMarketFormSchema = MarketFormSchema.omit({
    id: true,
}).partial({
    bigLogo: true,
    bigLogoBgColor: true,
    bigLogoFontColor: true,
    bigPic: true,
    bigVideo: true,
    rating: true,
    ratingAmount: true,
    description: true,
    website: true,
    email: true,
    telephone: true,
    facebook: true,
    twitter: true,
    ins: true,
    youtube: true,
    address: true,
    privacyPolicy: true,
    refundPolicy: true,
    shippingPolicy: true,
})

const UpdateMarketFormSchema = MarketFormSchema.omit({
    id: true,
    // icon: true,
}).partial({
    name: true,
    icon: true,
    bigLogo: true,
    bigLogoBgColor: true,
    bigLogoFontColor: true,
    bigPic: true,
    bigVideo: true,
    rating: true,
    ratingAmount: true,
    description: true,
    website: true,
    email: true,
    telephone: true,
    facebook: true,
    twitter: true,
    ins: true,
    youtube: true,
    address: true,
    privacyPolicy: true,
    refundPolicy: true,
    shippingPolicy: true,
})


const getMarket =  asyncErrorWrapper (async (req, res) => {
    try {
        let page = Number(req.query.page) || 1;
        if(page<1) { page = 1; }
        const query = req.query.query || "";
        let pageSize = Number(req.query.pageSize) || 6;
        if (pageSize<1) { pageSize = 6; }

        const {_count} = await prisma.market.aggregate({
            _count: true,
            where: {
                name: {
                    contains: query,
                    mode: "insensitive"
                }
            }
        })
        const totalPages = Math.ceil(_count/pageSize);

        const data = await prisma.market.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
            where: {
                name: {
                    contains: query,
                    mode: "insensitive"
                }
            },
            orderBy: {
                createdAt: "desc"
            },
        });

        res.header("Access-Control-Allow-Origin", "*");
        res.json({msg: "Success", totalPages, data});
    }
    catch (error) {
        console.error(error);
        throw JSON.stringify({ msg: "GET market error" });
    }
})


const createMarket = asyncErrorWrapper(async (req, res) => {

    let parseResult =
        CreateMarketFormSchema.safeParse(req.body);
    if (!parseResult.success) {
        console.log(parseResult.error.flatten().fieldErrors);
        throw JSON.stringify(parseResult.error.flatten().fieldErrors)
    }

    // 数据库新增操作
    const data = await prisma.market.create({
        data: parseResult.data,
    })
    res.header("Access-Control-Allow-Origin", "*");
    res.json({msg: "Success",data});
})


const getMarketItem = asyncErrorWrapper(async (req, res) => {
    const data = await prisma.market.findUnique({
        where: {
            id: req.params.id,
        },
        include: {
            marketTag: true,
        }
    });
    res.header("Access-Control-Allow-Origin", "*");
    res.json({msg: "Success",data})
})


const updateMarket = asyncErrorWrapper(async (req, res) => {
    let parseResult =
        UpdateMarketFormSchema.safeParse(req.body);
    if (!parseResult.success) {
        console.log(parseResult.error.flatten().fieldErrors);
        throw JSON.stringify(parseResult.error.flatten().fieldErrors)
    }
    const data = await prisma.market.update({
        where: {
            id: req.params.id,
        },
        data: parseResult.data
    })
    res.header("Access-Control-Allow-Origin", "*");
    res.json({msg: "Success",data})
})


const deleteMarket = asyncErrorWrapper(async (req, res) => {
    const data = await prisma.market.delete({
        where: {
            id: req.params.id
        }
    });
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({msg: "Success",data})
})



const getMarketCommodity = asyncErrorWrapper(async (req, res) => {

    let page = Number(req.query.page) || 1;
    if(page<1) { page = 1; }
    let pageSize = Number(req.query.pageSize) || 6;
    if ( pageSize<1) { pageSize = 6; }
    const query = req.query.query || "";

    const startPrice = Number(req.query.startPrice)*100 || 0;
    const endPrice = Number(req.query.endPrice)*100 || 20000;

    const sortByParam = req.query.sortBy;
    let orderBy = "createdAt";
    let order = "asc";
    if(sortByParam === "bestSelling") {
        orderBy = "selling";
        order = "desc";
    }
    else if(sortByParam === "newest") {
        order = "desc"
    }
    else if(sortByParam === "priceDesc") {
        orderBy = "price";
        order = "desc";
    }
    else if(sortByParam === "priceAsc") {
        orderBy = "price";
        order = "asc";
    }

    const onSaleParam = req.query.onSale;
    let promotingPrice = {};
    if(onSaleParam && onSaleParam !== "") {
        promotingPrice = {
            promotingPrice: {
                gt: 0,
            }
        }
    }

    const inStockParam = req.query.inStock;
    let stock = {};
    if(inStockParam  && inStockParam !== "") {
        stock = {
            stock: {
                gt: 0
            }
        }
    }

    const tagParam = req.query.tag;
    let tags = {}
    if(tagParam  && tagParam !== "" && tagParam !== "All") {
        tags = {
            tags: {
                has: tagParam,
            }
        }
    }

    const marketIdParam = req.query.marketId;
    let marketId = {};
    if(marketIdParam  && marketIdParam !== "") {
        marketId = {
            marketId: marketIdParam
        }
    }


    const {_count} = await prisma.commodity.aggregate({
        _count: true,
        where: {
            name: {
                contains: query,
                mode: "insensitive",
            },
            price: {
                gte: startPrice,
                lte: endPrice,
            },
            ...marketId,
            ...tags,
            ...promotingPrice,
            ...stock,
        },
    })

    const data = await prisma.commodity.findMany({
        where: {
            name: {
                contains: query,
                mode: "insensitive",
            },
            price: {
                gte: startPrice,
                lte: endPrice,
            },
            ...promotingPrice,
            ...stock,
            ...tags,
            ...marketId,
        },
        select: {
            id: true,
            name: true,
            price: true,
            promotingPrice: true,
            images: true,
            rating: true,
            ratingAmount: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
            [orderBy]: order,
        }
    });
    const hasMore = _count > page*(pageSize);
    res.json({msg: "Success", totalAmount: _count, hasMore, data});

})


module.exports = {
    getMarket,
    createMarket,
    getMarketItem,
    updateMarket,
    deleteMarket,
    getMarketCommodity
}