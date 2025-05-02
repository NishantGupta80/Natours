const express = require("express");
const authController = require("./../../authController");
const revController = require("./../../RevController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(authController.protect, revController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictedTo("user"),
    revController.setTourUserIds,
    revController.createReview
  );

router
  .route("/:id")
  .get(authController.protect,revController.getReview)
  .patch(authController.protect,authController.restrictedTo('admin','user'), revController.updateReview)
  .delete(authController.protect,authController.restrictedTo('admin','user'),revController.deleteReview)

module.exports = router;
