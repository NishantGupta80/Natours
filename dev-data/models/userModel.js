const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    validate: [validator.isEmail, "Doesn't look like an email"],
  },
  photo: {
    type: String,
    default:"default.jpg"
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  role: {
    type: String,
    enum: ["user", "admin", "guide", "tour-guide"],
    default: "user",
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); //if passowrd is Not modified dont do anything
  this.password = await bcrypt.hash(this.password, 12); // if its modified or it is newly created hash and Save the password
  this.passwordConfirm = undefined;

  if (!this.isNew) {
    // if its newly created no need to set password changed at but if it created before and Some has reset their password then set the passwordChangedAt field
    this.passwordChangedAt = Date.now() - 1000; // Ensure the timestamp is set
  }
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Method to check if the provided password is correct
userSchema.methods.correctPassword = async function (
  givenPassword,
  realPassword
) {
  return await bcrypt.compare(givenPassword, realPassword);
};

// Method to check if password was changed after the token was issued
userSchema.methods.passwordChanged = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedTimestamp; // If the token was issued before password was changed, return true
  }
  return false; // Password not changed after token was issued
};

userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 1000 * 60 * 10;

  return resetToken;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
