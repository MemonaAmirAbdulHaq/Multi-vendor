const express=require('express');
const ErrorHandler = require('./middleware/error');
const app=express();
const cookieParser=require("cookie-parser");
const bodyParser=require("body-parser")
const cors=require("cors")
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use("/",express.static("uploads"));

app.use(bodyParser.urlencoded({extended:true,limit:"50mb"}));




//CONFIG
if (process.env.NODE_ENV !== "PRODUCTION" ) {
    require("dotenv").config({
        path:"backend/config/.env"
    })
}
//import routes
const user=require("./controller/user");
app.use("/api/v2/user",user)
//it's for error handling
app.use(ErrorHandler)
module.exports=app;