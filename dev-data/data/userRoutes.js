const express = require("express");
const userController = require(`${__dirname}/../../userController`);
const authController=require(`./../..//authController`);

const router = express.Router();


router.post('/signUp',authController.signUp);
router.post('/login',authController.login);
router.get('/logout',authController.logOut);

router.post('/forgotPassword',authController.forgotPassword);
router.patch('/resetPassword/:token',authController.resetPassword);

router.patch('/updatePassword',authController.protect,authController.updateMyPassword);
router.patch('/updateMe',authController.protect,userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe);

router.delete('/deleteMe',authController.protect,userController.deleteMe);
router.get('/getMe',authController.protect,userController.getMe,userController.getUser);

router
  .route("/:id")
  .get(authController.protect,authController.restrictedTo('admin'),userController.getUser)
  .patch(authController.protect,authController.restrictedTo('admin'),userController.UpdateUser)
  .delete(authController.protect,authController.restrictedTo('admin'),userController.deleteUser);
router
  .route("/")
  .get(authController.protect,authController.restrictedTo('admin'),userController.getAllUsers)
  //.post(userController.createUser);

module.exports = router;
