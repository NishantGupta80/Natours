const fs = require("fs");
const url = require("url");
const express = require("express");
const morgan =require('morgan');
const AppError=require("./utils/AppError");
const ErrorHandler=require('./errorController');
const rateLimit=require('express-rate-limit');
const helmet=require("helmet");
const xss=require('xss-clean');
const sanitize=require('express-mongo-sanitize');
const { whitelist } = require("validator");
const hpp=require('hpp');
const path=require('path');
const cookieParser = require("cookie-parser");
const compression = require("compression");


const app = express();

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));

app.use(express.static(path.join(__dirname,'public')));

//app.use(express.static(path.join))

console.log(process.env.NODE_ENV);

//Body Parsing of Req
app.use(express.json({limit : '10kb'}));
app.use(cookieParser());

//Data Sanitization against NOSQL query injection
app.use(sanitize());   //it will basically Filter out all the $ and . signs from the body 

//Data Sanitization against XSS
app.use(xss());  //prevents to add any html code through the Querys

//Prevents Parameter pollutions
app.use(hpp({
  whitelist:['duration','ratingsQuantity','ratingsAverage','maxGroupSize','difficulty','price']
}));

/// Developmetn Logging
if(process.env.NODE_ENV=="development")
app.use(morgan('dev'));

//setting Headers for Security
  //app.use(helmet.contentSecurityPolicy());


//setting Limit Tp prevent Dos Attacks
const limiter=rateLimit({
  max:100,  // only accept 100 request From same API in an Hour
  windowMs:1000*60*60,
  message:'Too many Requests'
})
app.use('/api',limiter);


app.use(compression()); // compress all the responses

 // normal Middlewares
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime);
  next();
});

//Routes
console.log(`${__dirname}`)
const revRouter=require(`${__dirname}/dev-data/data/RevRoutes`)
const tourRouter=require(`${__dirname}/dev-data/data/tourRoutes`)
const userRouter=require(`${__dirname}/dev-data/data/userRoutes`)
const viewRouter=require(`${__dirname}/dev-data/data/viewRoutes`);
const bookingRouter=require(`${__dirname}/dev-data/data/bookingRoutes`);


app.use('/',viewRouter);
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',revRouter);
app.use('/api/v1/bookings',bookingRouter);


app.all('*',(req,res,next)=>{

  // const error=new Error(Can not find ${req.url} route on the Server! Try Another Url);
  // error.statusCode=404;
  // error.status="Fail";

  // next(error);

  next(new AppError(`Can not find ${req.url} route on the Server! Try Another Url`,404));
})


///////   Defining a Global  Moiddleware

app.use(ErrorHandler);



module.exports=app;