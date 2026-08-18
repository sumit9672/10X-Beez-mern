const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const {
  createAd,
  getAllAds,
  getSingleAd,
  getMyAds,
  updateAd,
  deleteAd,
} = require("../controllers/adController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create Ad with images
router.post(
  "/create",
  protect,
  upload.array("images", 5),
  createAd
);

// Get All Ads
router.get("/", getAllAds);

// Get My Ads
router.get("/my-ads", protect, getMyAds);

// Get Single Ad
router.get("/:id", getSingleAd);

// Update Ad
router.put(
  "/:id",
  protect,
  upload.array("images", 5),
  updateAd
);

// Delete Ad
router.delete("/:id", protect, deleteAd);

module.exports = router;