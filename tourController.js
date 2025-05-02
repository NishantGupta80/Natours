const express = require("express");
const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
const Tour = require("./dev-data/models/tourSchema");
const ApiFeatures = require("./utils/apiFeatures");
const catchAsync = require("./utils/catchAsync");
const AppError = require("./utils/AppError");
const factory = require("./factoryHandler");

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/simple-natours.json`, "utf-8") // When Handelling the request By Fs module
);

const storage = multer.memoryStorage();
const Filter = (req,file,cb) =>{
  if(file.mimetype.startsWith('image'))
    cb(null,true);
  else
   cb(new AppError("Not an Image,Upload only Images",404),false);
}

const upload = multer({storage:storage,fileFilter:Filter});

exports.uploadTourImages = upload.fields([
  {name :"imageCover",maxCount:1},
  {name :"images" , maxCount:3}
]);

// upload.array('images',5); when a multiple fiel comes from a single input field from frontend;
// upload.single('image) ; when a single photo is coming from a single field;
// upload.fields([{name: " fieldnames"},{...},{...}]) ; when from a multiple files are coming from a single field , all file needs to be seprateely stored in your database

exports.resizeTourImages = catchAsync(async(req,res,next)=>{
  if(!req.files.imageCover || !req.files.images)
    return next();

   // 1) ImageCover
  req.body.imageCover = `tours-${req.params.id}-${Date.now()}-cover.jpeg`;

   await sharp(req.files.imageCover[0].buffer)
  .resize(2000, 1333)
  .toFormat("jpeg")
  .jpeg({ quality: 90 })
  .toFile(`public/img/tours/${req.body.imageCover}`);


   // 2) Images
  req.body.images = [];
  
  await Promise.all(
    req.files.images.map(async(file,i)=>{
      const filename =  `tours-${req.params.id}-${Date.now()}-${i+1}.jpeg`;

      
    await sharp(file.buffer)
   .resize(2000, 1333)
   .toFormat("jpeg")
   .jpeg({ quality: 90 })
   .toFile(`public/img/tours/${filename}`);

   req.body.images.push(filename);
    })
  );

   
   next();
})

exports.configureQueryString = (req, res, next) => {
  req.query.limit = "5"; //string value for limit
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,difficulty,summary";
  next();
};

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlon, units } = req.params;

  const [lat, lon] = latlon.split(",");
  if (!lat || !lon) {
    next(
      new AppError(
        "Please Provide latitude and longitude in this Format lat,lon",
        400
      )
    );
  }

  console.log(distance, lat, lon, units);
  const radius = units === 'mi' ? distance/3963.2 : distance/6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lon, lat], radius] } },
  });

  res.status(200).json({
    results: tours.length,
    status: "success",
    data: tours,
  });
});

exports.getTourDistances = catchAsync(async(req,res,next) =>{
  const {latlon, units } = req.params;
  const multiplier = units === 'mi' ? 0.000621371 : 0.001;

  const [lat, lon] = latlon.split(",");
  if (!lat || !lon) {
    next(
      new AppError(
        "Please Provide latitude and longitude in this Format lat,lon",
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lon * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project:{
         name:1,
         distance:1
      }
    } 
  ]);

  res.status(200).json({
    status: 'success',
    results:distances.length,
    data: {
      data: distances
    }
  });

});

// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews'); // same as Tour.findOne({_id:req.params.id});

//   if (!tour) {
//     return next(new AppError("Not Found Any tour by that ID")); // throw new AppError("Not Found Any tour by that ID")
//   }
//   res.status(200).json({
//     status: "Success",
//     tour: tour,
//   });
// });

exports.getTour = factory.getOne(Tour, { path: "reviews" }); //Model,popOptions
exports.getAllTours = factory.getAll(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.CreateTour = factory.createOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// const id = req.params.id;  // For Update a Tour field in file based System
// const userindex = tours.findIndex((el) => el.id == id);
// const updateFields = req.body;

// if (userindex != -1) {
//   for (const key in updateFields) {
//     if (key in tours[userindex]) {
//       tours[userindex][key] = updateFields[key];
//     } else {
//       res.end(`invalid Parameter ${key}`);
//     }
//   }

//   fs.writeFile(
//     `${__dirname}/dev-data/data/simple-natours.json`,
//     JSON.stringify(tours),
//     (err, data) => {
//       // adding the new Content Into File means Updating Our file api
//     }
//   );
//   const newDataofUser = tours[userindex];

//   res.status(200).json({
//     status: "success",
//     newDataofUser,
//   });
// } else {
//   res.send("User Dont Exist");
// }

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: "$difficulty",
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgRating: 1 },
    },
    // {
    //   $match:{_id:{$ne:'easy'}}
    // }
  ]);

  res.status(201).json({
    status: "Success",
    stats: stats,
  });
});

exports.getYearPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year;
  const plans = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
  ]);

  res.status(201).json({
    status: "Success",
    plans: plans,
  });
});
