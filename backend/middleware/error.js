const ErrorHandler=require("../utils/ErrorHandler");
module.exports=(err,req,res,next) =>{
    err.statusCode=err.statusCode || 500
    err.message=err.message ||"internal server error"
    //wrong mongo id
    if(err.name ==="CastError"){
        const message=`Resources not found with this id.. Invalid ${err.path}`;
        err=new ErrorHandler(message,400)
    }
    //duplicate key error
    if(err.code===11000){
        const message=`Duplicate key ${Object.keys(err.keyValue)} Entered`;
        err =new ErrorHandler(message,400);
    }
    //wrong jwt error
    if(err.name==="JsonWebToken"){
        const message=`Your yrl is Invalid please try again`;
        err =new  ErrorHandler(message,400)
    }
    //jwt expire
    if(err.name==="TokenExpireError"){
        const message=`Your url is expired try again letter`;
        err=new ErrorHandler(message,400)
    }
    res.status(err.statusCode).json({
       success:false,
       message:err.message, 
    })
}