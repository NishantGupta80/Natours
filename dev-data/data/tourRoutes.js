const express = require("express");
const tourController = require(`${__dirname}/../../tourController`);
const authController = require(`./../..//authController`);
const RevController = require("./../../RevController");
const RevRoutes = require("./RevRoutes");

const router = express.Router();

//router.param("id",tourController.checkId);

router.use("/:tourId/reviews", RevRoutes); // for all this urls again get redirect to review routes

router
  .route("/top-5-expensive-tours")
  .get(tourController.configureQueryString, tourController.getAllTours);

router.route("/TourStats").get(tourController.getTourStats);

//now for this "tours-within" route we have two options 
// 1)  /tours-within?distance=233&center=-40,45&units=mi
// 2)  /tours-within/:distance/:center/:latlon/units/:mi

//we will prefer the second one because its the standard one

router.route("/tours-within/:distance/center/:latlon/units/:units").get(tourController.getToursWithin);
router.route("/distances/:latlon/units/:units").get(tourController.getTourDistances);

router.route("/YearPlans/:year").get(
  authController.protect,
  authController.restrictedTo("admin", "lead-guide",'guide'),
  tourController.getYearPlan
);
 
router
  .route("/")
  .get(tourController.getAllTours) //No restriction anyOne can See our Whole Tours--> other websites can use aor Api for getting All tours wothout restrictions
  .post(
    authController.protect,
    authController.restrictedTo("admin", "lead-guide"),  // Creatign a Tour should be restricted to only Some Entity 
    tourController.CreateTour
  );

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(authController.protect,authController.restrictedTo("admin", "lead-guide"),tourController.uploadTourImages,tourController.resizeTourImages,tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictedTo("admin",'lead-guide'),
    tourController.deleteTour
  );

// router
//   .route("/:tourId/reviews")
//   .post(
//     authController.protect,
//     authController.restrictedTo("user"),
//     RevController.createReview
//   );

module.exports = router;
