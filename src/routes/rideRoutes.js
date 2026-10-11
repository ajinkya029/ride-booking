const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const {
  estimate, createRide, myRides, getRide, acceptRide, startRide, completeRide, cancelRide
} = require("../controllers/rideController");

router.use(protect);
router.post("/estimate", estimate);
router.post("/", authorize("rider"), createRide);
router.get("/my", myRides);
router.get("/:id", getRide);
router.patch("/:id/accept", authorize("driver"), acceptRide);
router.patch("/:id/start", authorize("driver"), startRide);
router.patch("/:id/complete", authorize("driver"), completeRide);
router.patch("/:id/cancel", cancelRide);
module.exports = router;
