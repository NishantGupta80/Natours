const mongoose = require("mongoose");
const User = require("./userModel");
const Tour = require("./tourSchema");

const bookingSchema = new mongoose.Schema({
   tour:{
    type:mongoose.Schema.ObjectId,
    ref:'Tour',
    required:[true,"Bookings Must belong to a tour!"]
   },
   user:{
    type:mongoose.Schema.ObjectId,
    ref:'User',
    required:[true,"Bookings Must belong to a user!"]
   },
   price:{
    type:Number,
    required:[true,"booking Must Have a Price"]
   },
   createdAt:{
    type:Date,
    default:Date.now()
   },
   paid:{
    type:Boolean,
    default:true
   }

})

bookingSchema.pre(/^find/,function(next){
    this.populate('user').populate({
        path:'tour',
        select:'name'
    })

    next();
})

const Booking = mongoose.model("Bookings", bookingSchema);
module.exports= Booking;
