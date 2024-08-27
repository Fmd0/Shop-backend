const prisma = require('../prisma/prisma');
const asyncErrorWrapper = require("../middleware/asyncErrorWrapper");

const getSearch = asyncErrorWrapper(async(req, res) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 6;
    const query = req.query.query || "";

    const onSaleParam = req.query.onSale;
    let onSale = {};
    if (onSaleParam && onSaleParam!=="") {
        onSale = {
            promotingPrice: {
                gt: 0,
            },
        }
    }

    const rating = Number(req.query.rating)||0;
    const startPrice = Number(req.query.startPrice*100)||0;
    const endPrice = Number(req.query.endPrice*100)||200000;

    let sortBy = "createdAt";
    let sort = "desc";
    const sortByParam = req.query.sortBy;
    if(sortByParam === "newest") {
        sort = "asc"
    }
    else if(sortByParam === "bestSelling") {
        sortBy = "selling";
        sort = "desc";
    }
    else if(sortByParam === "priceDesc") {
        sortBy = "price";
        sort = "desc";
    }
    else if(sortByParam === "priceAsc") {
        sortBy = "price";
        sort = "asc";
    }


    let some = {};
    let sizeParam = req.query.size;
    if(sizeParam && !Array.isArray(sizeParam)) {
        sizeParam = [sizeParam];
    }
    let colorParam = req.query.color;
    if(colorParam && !Array.isArray(colorParam)) {
        colorParam = [colorParam];
    }
    if(sizeParam && sizeParam.length!==0 && colorParam && colorParam.length !== 0) {
        some = {
            AND: [
                {
                    skuConfigs: {
                        some: {
                            value: {
                                hasSome: sizeParam,
                            }
                        }
                    }
                },
                {
                    skuConfigs: {
                        some: {
                            value: {
                                hasSome: colorParam,
                            }
                        }
                    }
                }
            ]
        }
    }
    else if(sizeParam && sizeParam.length!==0) {
        some = {
            skuConfigs: {
                some: {
                    value: {
                        hasSome: sizeParam
                    }
                }
            }
        }
    }
    else if(colorParam && colorParam.length !== 0) {
        some = {
            skuConfigs: {
                some: {
                    value: {
                        hasSome: colorParam
                    }
                }
            }
        }
    }


    const {_count: totalAmount} = await prisma.commodity.aggregate({
        where: {
            name: {
                contains: query,
                mode: "insensitive",
            },
            ...onSale,
            rating: {
                gte: rating,
            },
            price: {
                gte: startPrice,
                lte: endPrice,
            },
            ...some,
        },
        _count: true,
    })
    const totalPages = Math.ceil(totalAmount / pageSize);
    const hasMore = totalAmount> page*pageSize;

    const data = await prisma.commodity.findMany({
        select: {
            id: true,
            name: true,
            images: true,
            rating: true,
            ratingAmount: true,
            price: true,
            promotingPrice: true,
        },
        where: {
            name: {
                contains: query,
                mode: "insensitive",
            },
            ...onSale,
            rating: {
                gte: rating,
            },
            price: {
                gte: startPrice,
                lte: endPrice,
            },
            ...some,
        },
        orderBy: {
            [sortBy]: sort,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
    })

    res.json({msg: "Success", totalPages, hasMore, totalAmount, data});

})


module.exports = {
    getSearch,
}