const express = require("express");
const authController = require("./../../authController");
const bookingController = require("./../../bookingController");
const viewController = require("./../../viewController");

const router = express.Router();

router.get('/checkout-session/:tourId',authController.protect,bookingController.getCheckoutSession);




module.exports = router;
