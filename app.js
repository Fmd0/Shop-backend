const express = require("express");
const session = require("express-session");

const app = express();

// pre-flight request
app.options('/api/session/user/*', require("cors")({
    credentials: true,
    origin: ['http://localhost:5173', 'http://192.168.0.3:5173'],
}));

app.use(require("cors")());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: "xnU9wFyyZiSjVKDudL/8uY35FV0yT9+gvM5CRq6aNDQ=",
    resave: false,
    saveUninitialized: false,
    cookie: {
        // maxAge: 14 * 60 * 60 * 24 * 1000,
        httpOnly: false,
        secure: false,
    }
}))



// app.use("/api/test", require('./routers/test'));
app.use("/api/session/user", require("cors")({
    credentials: true,
    origin: ['http://localhost:5173', 'http://192.168.0.3:5173'],
}), require("./routers/sessionUserRouter"))

app.use("/api/home", require("./routers/homeRouter"));
app.use("/api/market", require("./routers/marketRouter"));
app.use("/api/commodity", require("./routers/commodityRouter"));
app.use("/api/comment", require("./routers/commentRouter"));
app.use("/api/search", require("./routers/searchRouter"));




app.listen(9999, '0.0.0.0',() => console.log("127.0.0.1:9999"));