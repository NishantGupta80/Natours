const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const User = require("./userModel");

// ---------------------------------------------------------------------------------------------->
// userSchema=new mongoose.schema({

//   name:{  // Here You can simply add Your Custom fields
//     type:    // but from here onwards you can only use the schemaOptions ,No custom field of your own
//     max:
//     min:
//     default:
//   }
// })
//---------------------------------------------------------------------------------------------->
/// but in case of GeoData you will have to Go one level Deeper in the Construction
// startLocation:{ // Your Custom Field
//   type:{ // in Normal BSON from Here You can Only choose schemaOptions Field but in GeoJSON you can here also can choose Custom fileds and aftere this level you can only choose SchemaOptions
//       type:  //schemaOptions
//       default:
//         enum:
//   },
//   coordinates:{ // your Custom field

//   },
//   adddress:  //Your Custom Fields
//   descriptions:
// }
// --------------------------------------------------------------------------------------------->

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      maxlength: [40, "A Tour Can not Have more than 40 characters"],
      minlength: [10, "A Tour Must have atleast 10 Characters"],
    },
    startLocation: {
      // here StartLocation will be Containing objects means A geoJSON object,
      //GeoJson
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      // We are Embedding the startlocation Property in Location field,there Fore Location will contain array of objects,in which objects will be geoJson(startLocation Type Objects)
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    rating: {
      type: Number,
      required: true,
      default: 4.5,
    },
    duration: {
      type: Number,
      required: [true, "Duration is Required"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A Group size is required"],
    },
    difficulty: {
      type: String,
      required: [true],
      enum: {
        values: ["easy", "difficult", "medium"],
        message: "Difficulty Should be Easy , Medium or Difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, "Ratings should be between 1 to 5"],
      min: [1, "Ratings should be Between 1 to 5"],
      set: val => Math.round(val * 10)/10
    },
    slug: String,
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    // we dont want it required or any other attribute we can simply assign a literal rather than a list of object;
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message: "Price Discount is Invalid {VALUE}",
      },
    },
    summary: {
      type: String,
      trim: true, // Removes whitespace characters, including null, or the specified characters from the beginning and end of a string
      required: true,
    },
    SecretTour: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: true,
    },
    images: [String], // an array of string for rest of all  the images
    createdAt: {
      type: Date,
      default: Date.now,
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({price:1,ratingsAverage:-1});
tourSchema.index({startLocation:'2dsphere'})

tourSchema.virtual("week").get(function () {
  // adding a Virtual Property or Field in Schema that will no that stored on database
  return this.duration / 7;
});

tourSchema.virtual("reviews", {
  ref: "Rev",
  foreignField: "tour",
  localField: "_id",
});

////// Document Middleware

// tourSchema.pre('save',async function(next){
//  const guidePromises =  this.guides.map( async (id)=>{
//    return await User.findById(id);
//   });

//   this.guides =  await Promise.all(guidePromises);
//   console.log(this.guides);
//   next();
// })

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt", // these fileds will be not shown in guides section 
  })
  next();
});

tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post('save',function (doc,next){
//   console.log(doc); /// here the doc refers to the document which have been saved jsut now
//   next();
// })

///// Query Middleware

//tourSchema.pre("find", function (next) {              //runs Exactly before query of Find,and Will not run for findeOne,findAndUpdate
tourSchema.pre(/^find/, function (next) {
  // runs for every Query that starts with find..... (due to regex)
  this.find({ SecretTour: { $ne: true } }); // Here this Refers to the Query
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  /// here the Docs refers to the resulted documents after running th Query
  console.log(`Query Took ${Date.now() - this.start} milliSeconds`);
  // console.log(docs);
  next();
});

// tourSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({
//     $match: { SecretTour: { $ne: true } },
//   });
//   next();
// });

const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
