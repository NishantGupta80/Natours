 const Tour=require("./dev-data/models/tourSchema");
 const catchAsync=require("./utils/catchAsync");
 const AppError = require("./utils/AppError");
 const Booking = require("./dev-data/models/bookingModel")





exports.getOverview = ( async (req,res)=>{



    const tours= await Tour.find();

    res.status(200).render('overview',{
        tours,
        title:'All Tours'
    });
  });

exports.getTour =catchAsync( ( async (req,res,next) => {
   // const slugs=req.params.slug;
  const tour=await Tour.findOne({slug: req.params.slug}).populate({
    path:'reviews',
    fields:'review rating user'
  });

  if(!tour)
  {
     return next(new AppError("Not Found Any Tour with That Name", 404));
  }

  res.status(200).render('tour',{
    title:tour.name,
    tour
  })
}))

exports.getLoginForm = (req,res) =>{
  res.status(200).render('login',{
    title : "Login To Your Account"
  })
}

exports.getMain = ((req,res)=>{
    res.status(200).render('base');
})

exports.getAccount = (req,res) =>{
  res.status(200).render('account',{
    title : "Your Account"
  })
}

exports.getMyTours = catchAsync(async(req,res,next) => {

  const bookings = await Booking.find({user:req.user.id});

  const tourIds = bookings.map(el=> el.tour);

  const bookedTours = await Tour.find({_id:{$in:tourIds}});

  res.status(200).render('overview',{
      title:'My Bookings',
      tours : bookedTours
})
})