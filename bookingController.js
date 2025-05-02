const stripe = require('stripe')(process.env.STRIPE_PASSWORD);
const Tour = require("./dev-data/models/tourSchema");
const catchAsync = require("./utils/catchAsync");
const AppError = require("./utils/AppError");
const factory = require("./factoryHandler");
const Booking = require("./dev-data/models/bookingModel")



exports.getCheckoutSession = catchAsync(async(req,res,next)=>{ 
    // 1) Get the Currently Booked Tour

    const tourId = req.params.tourId;
    const tour = await Tour.findById(tourId);
     
    // 2) Create a Session of Payment 
     const session = await stripe.checkout.sessions.create({ // All Details About Stripe-Session
        payment_method_types : ['card'],
        success_url : `${req.protocol}://${req.get('host')}/?tourId=${tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url : `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email:req.user.email,
        client_reference_id : req.params.tourId,
        mode:"payment",
        line_items:[   // All details About Tour Payments
            { 
                "price_data": {
                "currency" : "usd",
                "unit_amount" : tour.price * 100,
                "product_data" : {
                      "name" : `${tour.name} Tour`,
                      "description" : tour.summary,
                       "images" : [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                  }
                },
                "quantity": 1
            }
        ]

    })



 // 3) Send the Response 

    res.status(200).json({
        status:'success',
        session
    })
// next();

})

exports.createBookingChekout = catchAsync(async(req,res,next) =>{
    const {tourId,user,price} = req.query;
    const tour = tourId;

    if(!tour && !user && !price) return next();

    await Booking.create({tour,user,price});

    res.redirect(req.originalUrl.split('?')[0]);
});



