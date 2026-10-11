const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const { setAvailability, updateLocation, nearbyDrivers } = require("../controllers/driverController");

router.use(protect);
router.get("/nearby", nearbyDrivers);
router.patch("/availability", authorize("driver"), setAvailability);
router.patch("/location", authorize("driver"), updateLocation);
module.exports = router;
