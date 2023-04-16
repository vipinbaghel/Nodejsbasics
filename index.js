// const http = require("http");
import express from "express";
import http from "http";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from 'jsonwebtoken';
import path from 'path'

// connecting to database running loccal 
mongoose.connect("mongodb://localhost:27017", {
    dbName: "Backend",
})
.then(()=> console.log("DB connected"))
.catch((err) => console.log(err))


const userSchema = mongoose.Schema({
    name: String,
    email: String
})

const User = mongoose.model("User", userSchema)



// module creation and using 
// const gfName = require("./features");

const app = express();

// setting up view engine 
app.set("view engine", "ejs");

// using middlewares 
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


const isAuthenticate = async(req,res, next) => {
    const token = req.cookies.token;

    if(token) {
        const decoded = jwt.verify(token, "vipin")
        req.user = await User.findById(decoded._id);
        res.render("logout");
    } else {
       next();
    }
}

app.get("/",isAuthenticate, (req,res) => {
    console.log(req.user);
    res.render("login");
})

app.get("/logout",(req,res) => {

    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now()),
    })

    res.redirect("/");
})

app.post("/login", async (req, res) => {


    // storing the user id into user variable 
    const user = await User.create({
        name: req.body.username,
        email: req.body.email
    })

    const token = jwt.sign({_id: user._id}, "vipin")
   res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60*1000)
   });
   res.redirect("/")
})




app.listen(3000, () => {
    console.log("server is running");
})