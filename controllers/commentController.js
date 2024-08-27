const prisma = require("../prisma/prisma");
const asyncErrorWrapper = require("../middleware/asyncErrorWrapper")

const getComment = asyncErrorWrapper(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 6;

    const commodityIdParam = req.query.commodityId;
    let commodityId = {};
    if(commodityIdParam && commodityIdParam !== "") {
        commodityId = {
            commodityId: commodityIdParam,
        }
    }

    const marketIdParam = req.query.marketId;
    let marketId = {};
    if(marketIdParam && marketIdParam !== "") {
        marketId = {
            marketId: marketIdParam,
        }
    }

    const {_count: totalAmount} = await prisma.comment.aggregate({
        // where: {
        //     ...commodityId,
        //     ...marketId,
        // },
        _count: true
    })
    const totalPages = Math.ceil(totalAmount / pageSize)
    const hasMore = totalAmount > page*pageSize;

    let groupRating = []
    if(page === 1) {
        groupRating = await prisma.comment.groupBy({
            by: ['rating'],
            _count: true,
        })
    }

    const data = await prisma.comment.findMany({
        // where: {
        //     ...commodityId,
        //     ...marketId
        // },
        select: {
            id: true,
            rating: true,
            comment: true,
            userName: true,
            marketId: true,
            commodityId: true,
            createdAt: true,
            market: {
                select: {
                    name: true,
                }
            },
            commodity: {
                select: {
                    name: true,
                }
            }
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
            createdAt: "desc"
        }
    });
    res.json({msg: "Success", totalAmount, totalPages, groupRating, hasMore, data});
})


module.exports = {
    getComment,
}