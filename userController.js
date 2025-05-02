const multer = require("multer");
const AppError = require("./utils/AppError");
const catchAsync = require("./utils/catchAsync");
const express = require("express");
const sharp = require("sharp");
const fs = require("fs");
const User = require("./dev-data/models/userModel");
const factory = require("./factoryHandler");
//const { ShortURL } = require("short/models/ShortURL");

const filter = (obj, ...allowedFields) => {
  const newObject = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObject[el] = obj[el];
  });
  return newObject;
};

// const storage = multer.diskStorage({
//   destination : (req,file,cb)=>{
//     cb(null,"public/img/users");
//   },
//   filename : (req,file,cb)=>{
//     const ext = file.mimetype.split('/')[1];
//     cb(null,`user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// })

const storage = multer.memoryStorage();

const Filter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new AppError("Not an Image,Upload only Images", 404), false);
};

const upload = multer({ storage: storage, fileFilter: Filter });

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync( async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
   await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});
exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.photo);
  console.log(req.file);
  console.log(req.body);
  //1) restrict the Route

  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError("Cant Update password Using This Route", 401));

  //2) filter the object to contain only allowed Fileds

  const filteredObj = filter(req.body, "name", "email");
  if (req.file) filteredObj.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    message: "success",
    user: {
      updatedUser,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(200).json({
    message: "success",
  });
});

exports.getUser = factory.getOne(User);
exports.UpdateUser = factory.updateOne(User); //can't Update the Passwords
exports.deleteUser = factory.deleteOne(User);
// exports.createUser = factory.createOne(User); this should not be there because we are Not Going to Create a User by own they should signUp

exports.getAllUsers = factory.getAll(User);
