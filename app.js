const express = require("express");

const app = express();

require('dotenv').config()

app.use(require("cors")());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.use("/api/session/user", require("./routers/sessionUserRouter"))

app.use("/api/home", require("./routers/homeRouter"));
app.use("/api/market", require("./routers/marketRouter"));
app.use("/api/commodity", require("./routers/commodityRouter"));
app.use("/api/comment", require("./routers/commentRouter"));
app.use("/api/search", require("./routers/searchRouter"));




app.listen(9999, '0.0.0.0',() => console.log("127.0.0.1:9999"));