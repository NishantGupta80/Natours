const catchAsync = require("./utils/catchAsync");
const AppError = require("./utils/AppError");
const ApiFeatures = require("./utils/apiFeatures");

exports.deleteOne = (Model) => {
  //Model refers to the Collection of the Particular Entity
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("Not Found Any Document by that ID")); // throw new AppError("Not Found Any tour by that ID")
    }
    res.status(201).json({
      status: "Success",
      data: "Data Deleted",
    });
  });
};
exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "Success",
      data: doc,
    });
  });
};

exports.updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("Not Found Any Documemnt by that ID")); // throw new AppError("Not Found Any tour by that ID")
    }

    res.status(200).json({
      status: "Success",
      data: doc,
    });
  });
};

exports.getOne = (Model, popOptions) => {
  return catchAsync(async (req, res, next) => {
    let queryfetched = Model.findById(req.params.id);
    if (popOptions) queryfetched.populate(popOptions);
    const doc = await queryfetched;
    if (!doc) {
      return next(new AppError("Not Found Any document by that ID")); // throw new AppError("Not Found Any document by that ID")
    }
    res.status(200).json({
      status: "Success",
      data: doc,
    });
  });
};

exports.getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const Features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    //Execute Query
    console.log(Features);
    const doc = await Features.query;
    console.log(doc);

    res.status(201).json({
      status: "Success",
      result: doc.length,
      data: {
        data: doc,
      },
    });
  });
};
