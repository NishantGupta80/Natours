const AppError = require("./utils/AppError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (error) => {
  const message = `Duplicate Field value:${error.keyValue.name} . Please Use something Else`;
  return new AppError(message, 400);
};

 const handleValidationErrorDB = (error) =>{

   const errors=Object.values(err.errors).map(el=>el.message);
  const message=`Invalid Input Data${errors.join('. ')}`;
  return new AppError(message,400);

 };

 const handleTokenError = (error) =>{
  return new AppError('Invalid Token! Please login Again!',401);
 }

 const handleTokenExpiredError=(error)=>{
  return new AppError('Your Session has been Expired. Please Login again',401);
 }



const sendErrorDev = (err, req,res) => {
  if(req.originalUrl.startsWith('/api')){
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }else{
    res.status(err.statusCode).render('error',{
      title: "SomeThing Went Very Wrong On the Site",
      msg: err.message
    })
  }
  
};

const sendErrorProd = (err,req, res) => {
  // Operational, trusted error: send message to client
  // A) API
  if(req.originalUrl.startsWith('/api')){
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error("ERROR 💥", err);

    // 2) Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
}else
{
  // B) Rendering Website
  if (err.isOperational) {
    res.status(err.statusCode).render('error',{
      title: "SomeThing Went Very Wrong On the Site",
      msg: err.message
    })
  } else {
    // Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error("ERROR 💥", err);

    // 2) Send generic message
    res.status(err.statusCode).render('error',{
      title: "SomeThing Went Very Wrong On the Site",
      msg: "Please Try Again Later"
    })
  }
}
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err,req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    console.log(error);
    error.message = err.message;

    if (error.reason && error.reason.name == "BSONError")
      error = handleCastErrorDB(error);

    if (error.code === 11000) 
      error = handleDuplicateErrorDB(error);
    

    if(error.name=='ValidatiorError')   ///Work on it
      error=handleValidationErrorDB(error);

    if(error.name=='JsonWebTokenError')
        error=handleTokenError(error);

    if(error.name=='TokenExpiredError')
      error=handleTokenExpiredError(error);

  

    sendErrorProd(error,req, res);
  }
};

module.exports = globalErrorHandler;
