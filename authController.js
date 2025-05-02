const catchAsync = require("./utils/catchAsync");
const crypto=require('crypto');
const User = require("./dev-data/models/userModel");
const jwt = require("jsonwebtoken");
const AppError = require("./utils/AppError");
const { promisify } = require("util");
const Email = require("./utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const CreateAndSendToken = (id,statusCode,user,res) =>{
  const token = jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

  const cookieOptions={
    expires:new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 ),
    httpOnly:true
  }

  if(process.env.NODE_ENV=='production')
    cookieOptions.secure=true;

  res.cookie('jwt',token,cookieOptions);

  user.password=undefined; //it will not be shown while sending response but it will be saved in the database because we are not doing user.save() here
  user.active=undefined;

  res.status(statusCode).json({
    status: "Success",
    token: token,
    user: user
  });
}

exports.signUp = catchAsync(async (req, res, next) => {
  // const newUser= await User.create(req.body); by thisLine of Code anyone can sign up as an Admin

  const newUser = await User.create({
    // by this method we are only signing up users without any role and then after role can assigned later on by the  main-admin
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
   const url = `${req.protocol}://${req.get('host')}/me`;
   console.log(url);
   await new Email(newUser,url).sendWelcome();
  
  CreateAndSendToken(newUser._id,201,newUser,res);
  
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("Please Provide more Details"), 400);

  // const validEmail=await User.find({email});// this will return a Document where passsword will not be present because in schema because we have select:false
  const validEmail = await User.findOne({ email }).select("+password"); //it will explicitely add password field too;

  if (!validEmail) return next(new AppError("Email Not registered"), 404);

  //console.log(typeof(password),typeof(validEmail.password));

  const ValidPassword = await validEmail.correctPassword(
    password,
    validEmail.password
  );
  if (!ValidPassword)
    return next(new AppError("Passwords are not Matching!"), 404);

  CreateAndSendToken(validEmail._id,201,validEmail,res);
});

exports.logOut = async (req,res) =>{
  res.cookie('jwt',"loggedOut",{
    expires: new Date(Date.now() + 10*1000),
    httpOnly : true
  })

  res.status(200).json({status :"success"})
}

exports.protect = catchAsync(async (req, res, next) => {
  // 1) check weather Token Exist or not in the Request headers
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer") // For Postman API Requests
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log(token);
  }else if(req.cookies.jwt){  // For Browser Requests
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      new AppError("You are Not Logged in. Please Login to Conotinue"),
      401
    ); //401 means Unauthorized

  // 2) verify the Token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //promisify(jwt.verify) is a function --> promisify(jwt.verify)() will trigger the Function

  // Here if verification will be failed it will automatically throw an error by jwt. so no need to return a new AppError here
  //here in decodedPayload we will get an id by which signature has been created and with that id now in step 3)  we will find a user in the database and if the user exist
  //means the user has not deleted his account and if user doesnt exist means user has been get deleted before 90 days of last login

  // 3) check if the User still Exists or not in the Database after getting the Token there can be Possibility that before 90 days
  //     User has deleted its account ,but still the token remain valid,there fore if a user do so we will not give access to that token in the app

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) check if a User has Changed the Passsword before 90 days ,in that case too we will have to update the token by making the user login again
  if (currentUser.passwordChanged(decoded.iat)) {
    return next(
      new AppError(
        "Password has been changed recently. Please log in again.",
        401
      )
    );
  }

  // Grant The Access for Protectetd Routes
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  // If token exist then Proceed else return from here only;
  try{
  if(req.cookies.jwt)
  {

    // If there is a Valid JWT
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

    //if User Still exist in the Database Witho these jwt
    const currentUser = await User.findById(decoded.id);
     if (!currentUser) {
     return next();
     }

    // if User Chnaged the Password Recently
     if (currentUser.passwordChanged(decoded.iat)) {
      return next();
   }


   // There Is a Logged In User
   res.locals.user = currentUser;
    return next();
   }
  }catch(err) {
    return next();
  }
  next();
}

exports.restrictedTo = (...roles) => {
  //roles is an array of passed arguemnet...=>{'user','admin'}
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError("You are Not allowed To perform this Action", 403)
      );
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const email = req.body.email;

  const userExist = await User.findOne({ email });
  if (!userExist) {
    return next(new AppError("User Doesn`t Exist !!"), 401);
  }
  console.log(userExist);

  const resetToken = userExist.createResetToken();
  userExist.save({ validateBeforeSave: false });

  
   //  const message = `Forgot Your Password? Submit a PATCH request with Your new Password and password Confirm to:${resetURL}.\nif you didn't forget Your Password,please ignore this email!`;

  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;
    
    await new Email(userExist,resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "token Sent Successfully to Email!",
    });
  } catch (err) {
    console.log(err);
    userExist.passwordResetToken = undefined;
    userExist.passwordResetExpires = undefined;
    await userExist.save({ validateBeforeSave: false });

    return next(new AppError("cant Reset please Try again later!!"), 500);
  }
});

exports.resetPassword = catchAsync( async (req, res, next) => {
  console.log(req.params);

  // 1) Get User Based on the Token
  const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user= await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt:Date.now()}});

  //2) checck if User exist then allow them to set  a new Password;
  if(!user)
    {
      return next(new AppError('User doesnt Exist or Link has been Expired!'),403);
    }
    

     //3) update the Password with the Password params
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;
    console.log(user);

   await user.save();

  // 4) send the Token and sign in the User
  CreateAndSendToken(user._id,200,user,res);
});

exports.updateMyPassword = catchAsync(async(req,res,next)=>{
  const CurrentPassword=req.body.CurrentPassword;
  const newPassword=req.body.newPassword;
  const newPasswordConfirm=req.body.newPasswordConfirm;
  
  // 1) first Check if User with this Exist or not

   const userExist= await User.findById(req.user._id).select('+password');
   if(!userExist)
    {
      return next(new AppError('User is not Registered'),403);
    }

    //2) check if Posted Current Password is Correct;
    const validPassword=userExist.correctPassword(JSON.stringify(CurrentPassword),userExist.password);
    if(!validPassword)
      {
        return  next(new AppError('You must Enter Correct Current Password To reset it',401));
      }

      // 3) if So than please Update the Password
      userExist.password=newPassword;
      userExist.passwordConfirm=newPasswordConfirm;
      await userExist.save();

   // 4) send the Token and sign in the User
   CreateAndSendToken(userExist._id,200,userExist,res);
});





