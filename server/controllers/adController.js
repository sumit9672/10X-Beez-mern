const Ad = require("../models/Ad");

// Create Ad
const createAd = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      location,
    } = req.body;

    // Required fields
    if (
      !title ||
      !description ||
      !price ||
      !category ||
      !location
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Categories where image is compulsory
    const imageRequiredCategories = [
      "Electronics",
      "Vehicles",
      "Mobiles",
      "Furniture",
      "Property",
    ];

    // Get uploaded images
    const images = req.files
      ? req.files.map(
          (file) => `/uploads/${file.filename}`
        )
      : [];

    // Minimum 1 image validation
    if (
      imageRequiredCategories.includes(category) &&
      images.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least 1 image is required for this category",
      });
    }

    // Create Ad
    const ad = await Ad.create({
      title,
      description,
      price,
      category,
      location,
      images,
      user: req.userId,
    });

    res.status(201).json({
      success: true,
      message: "Ad created successfully",
      ad,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create ad",
      error: error.message,
    });
  }
};


// Get All Ads + Search + Category Filter
const getAllAds = async (req, res) => {
  try {
    const { search, category } = req.query;

    let filter = {};

    // Search in title, description, location AND category
    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          location: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    const ads = await Ad.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: ads.length,
      ads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get ads",
      error: error.message,
    });
  }
};


// Get Single Ad
const getSingleAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    res.status(200).json({
      success: true,
      ad,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get ad",
      error: error.message,
    });
  }
};

// Update Ad
const updateAd = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      location,
      existingImages,
    } = req.body;

    const ad = await Ad.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    // Check ownership
    if (
      ad.user.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this ad",
      });
    }

    // -------------------------
    // Update text fields
    // -------------------------

    ad.title = title?.trim() || ad.title;
    ad.description = description?.trim() || ad.description;
    ad.price = price || ad.price;
    ad.category = category || ad.category;
    ad.location = location?.trim() || ad.location;

    // -------------------------
    // Existing Images
    // -------------------------

    let keepImages = [];

    if (existingImages) {
      try {
        keepImages = JSON.parse(existingImages);
      } catch (error) {
        keepImages = [];
      }
    }

    // -------------------------
    // New Uploaded Images
    // -------------------------

    const newImages = req.files
      ? req.files.map(
          (file) => `/uploads/${file.filename}`
        )
      : [];

    // -------------------------
    // Combine Images
    // -------------------------

    const finalImages = [
      ...keepImages,
      ...newImages,
    ];

    // Maximum 5 images
    if (finalImages.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 images are allowed",
      });
    }

    // -------------------------
    // Image Required Categories
    // -------------------------

    const imageRequiredCategories = [
      "Electronics",
      "Vehicles",
      "Mobiles",
      "Furniture",
      "Property",
    ];

    if (
      imageRequiredCategories.includes(ad.category) &&
      finalImages.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least 1 image is required for this category",
      });
    }

    ad.images = finalImages;

    await ad.save();

    res.status(200).json({
      success: true,
      message: "Ad updated successfully",
      ad,
    });
  } catch (error) {
    console.error("UPDATE AD ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update ad",
      error: error.message,
    });
  }
};


// Delete Ad
const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    // Check ownership
    if (
      ad.user.toString() !==
      req.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this ad",
      });
    }

    await Ad.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Ad deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete ad",
      error: error.message,
    });
  }
};


// Get My Ads
const getMyAds = async (req, res) => {
  try {
    const ads = await Ad.find({
      user: req.userId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: ads.length,
      ads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get your ads",
      error: error.message,
    });
  }
};


// Export
module.exports = {
  createAd,
  getAllAds,
  getSingleAd,
  getMyAds,
  updateAd,
  deleteAd,
};