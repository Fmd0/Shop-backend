const asyncErrorWrapper = require("../middleware/asyncErrorWrapper")
const prisma = require("../prisma/prisma")

const getHomeStarted = asyncErrorWrapper(async(_, res) => {
    const data = await prisma.homeShopStarted.findMany({
        orderBy: {
            createdAt: "asc"
        }
    });
    res.json({msg: "success", data});
})


const getHomeBanner = asyncErrorWrapper(async(req, res) => {
    const data = await prisma.homeBanner.findMany({
        orderBy: {
            createdAt: "asc"
        },
    });
    res.json({msg: "success", data});
})



module.exports = {
    getHomeStarted,
    getHomeBanner
}