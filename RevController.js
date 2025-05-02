const Review = require("./dev-data/models/reviewModel");
const catchAsync=require('./utils/catchAsync');
const factory = require('./factoryHandler');

exports.getAllReviews = factory.getAll(Review);
// catchAsync(async (req, res, next) => {
//     let filter={};
//     if(!req.params.tourId) filter={tour:req.params.tourId};  //for nested Routes
//   const reviews = await Review.find(filter); //find the reviews where tour field has tourId

//   res.status(200).json({
//     message: "success",
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });


exports.setTourUserIds = (req,res,next) =>{
  if(!req.body.tour) req.body.tour=req.params.tourId;
  if(!req.body.user) req.body.user=req.user.id;

  next();
}

  exports.getReview = factory.getOne(Review);
  exports.deleteReview = factory.deleteOne(Review);
  exports.updateReview = factory.updateOne(Review); 
  exports.createReview = factory.createOne(Review);