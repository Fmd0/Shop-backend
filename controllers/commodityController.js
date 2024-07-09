const prisma = require("../prisma/prisma");
const asyncErrorWrapper = require("../middleware/asyncErrorWrapper")


const getCommodityItem = asyncErrorWrapper(async (req, res) => {
    const id = req.params.id;

    const commodity = await prisma.commodity.findUnique({
        where: {
            id
        },
        select: {
            id: true,
            name: true,
            price: true,
            promotingPrice: true,
            images: true,
            rating: true,
            ratingAmount: true,
            description: true,
            stock: true,
            officialLink: true,
            market: {
                select: {
                    id: true,
                    name: true,
                    icon: true,
                    rating: true,
                    ratingAmount: true,
                    website: true,
                    email: true,
                    telephone: true,
                    facebook: true,
                    twitter: true,
                    ins: true,
                    youtube: true,
                    address: true,
                    shippingPolicy: true,
                    refundPolicy: true,
                }
            },
            skuConfigs: {
                select: {
                    key: true,
                    value: true,
                    defaultValue: true,
                }
            },
            skuItems: {
                select: {
                    sku: true,
                    price: true,
                    promotingPrice: true,
                    image: true,
                    stock: true
                }
            }
        },
    })

    const marketId = commodity?.market?.id||"";
    let bestSellingCommodities = await prisma.commodity.findMany({
        where: {
            marketId,
        },
        orderBy: {
            selling: "desc",
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
        take: 6
    })
    bestSellingCommodities = bestSellingCommodities.map(b => {
        b.images = [b.images[0]]
        return b;
    });

    res.json({msg: "Success", data: {commodity, bestSellingCommodities}});
})


module.exports = {
    getCommodityItem
}