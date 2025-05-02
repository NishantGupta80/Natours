const mongoose = require("mongoose");
const Tour = require("./tourSchema");

const reviewModel = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review Can not be Empty"],
    },
    rating: {
      type: Number,
      max: [5, "please Rate between 1 to 5"],
      min: [1, "please Rate betweeb 1 to 5"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId, //Parent Refrencing -->for each Review , there will be one Tour
      ref: "Tour",
      required: [true, "Review must Bwlong to a Tour"],
    },
    user: {
      type: mongoose.Schema.ObjectId, // parent Refrencing  --> for each Review ,there will be one User
      ref: "User",
      required: [true, "Review Must belong to a User"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewModel.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });

  next();
});

reviewModel.index({ tour: 1, user: 1 }, { unique: true });

reviewModel.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour", // its important that you should only use a _id name field here in Group stage in .
        nRatings: { $sum: 1 },
        ratAverage: { $avg: "$rating" },
      },
    },
  ]);~
  console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].ratAverage,
      ratingQuantity: stats[0].nRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingQuantity: 0,
    });
  }
};

reviewModel.post("save", async function () {
  await this.constructor.calcAverageRatings(this.tour);
});

// for deleting or Updating a Tour
// findByidAndUpdate
// findByIdAndDelete

reviewModel.pre(/^findOneAnd/, async function (next) {
  // Access the document before update
  this.doc = await this.model.findOne(this.getFilter());
  console.log(this.doc);
  next();
});
reviewModel.post(/^findOneAnd/, async function (next) {
  await this.doc.constructor.calcAverageRatings(this.doc.tour);
});

const Rev = mongoose.model("Rev", reviewModel);

module.exports = Rev;
