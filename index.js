require('dotenv').config();
console.log("PORT from .env:", process.env.PORT);
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const path = require("path");
const cookieParser = require("cookie-parser");

//middlewears
const {restrictToLoggedInUserOnly, checkAuth} = require("./middleware/auth");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

//route
const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRoutes");
const userRoute = require("./routes/user");
app.use("/url", restrictToLoggedInUserOnly, urlRoute);
app.use("/", checkAuth, staticRoute);
app.use("/user", userRoute);


//Connection with mongoDb
const connectToMongoDb = require("./connection");
connectToMongoDb("mongodb://localhost:27017/short-url")
    .then(()=> console.log("mongoDb connected"))
    .catch(err => console.error("MongoDB connection failed:", err));

app.listen(PORT, ()=> console.log(`Server Started at PORT = ${PORT}`) );