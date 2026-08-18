import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function CreateAd() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    location: "",
  });

  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const imageRequiredCategories = [
    "Electronics",
    "Vehicles",
    "Mobiles",
    "Furniture",
    "Property",
  ];

  // =========================
  // FORM CHANGE
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  // =========================
  // OPEN FILE SELECTOR
  // =========================
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // =========================
  // ADD IMAGES
  // =========================
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    console.log("SELECTED FILES:", selectedFiles);

    if (selectedFiles.length === 0) {
      return;
    }

    setMessage("");

    // Maximum 5 images
    if (images.length + selectedFiles.length > 5) {
      setMessage("You can upload maximum 5 images.");
      e.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    // Validate images
    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setMessage(
          `${file.name}: Only JPG, JPEG, PNG and WEBP images are allowed.`
        );
        e.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setMessage(`${file.name} is larger than 5 MB.`);
        e.target.value = "";
        return;
      }
    }

    // Create preview objects
    const newImages = selectedFiles.map((file) => ({
      file: file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prevImages) => [
      ...prevImages,
      ...newImages,
    ]);

    console.log("IMAGES ADDED:", newImages);

    // Reset input
    e.target.value = "";
  };

  // =========================
  // REMOVE IMAGE
  // =========================
  const removeImage = (indexToRemove) => {
    setImages((prevImages) => {
      const imageToRemove = prevImages[indexToRemove];

      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      return prevImages.filter(
        (_, index) => index !== indexToRemove
      );
    });

    setMessage("");
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // Image required validation
    if (
      imageRequiredCategories.includes(formData.category) &&
      images.length === 0
    ) {
      setMessage(
        "Please upload at least 1 image for this category."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", Number(formData.price));
      data.append("category", formData.category);
      data.append("location", formData.location);

      // Add images
      images.forEach((imageObj) => {
        data.append("images", imageObj.file);
      });

      console.log("TOTAL IMAGES:", images.length);

      const response = await fetch(
        '${import.meta.env.VITE_API_URL}/api/ads/create',
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      const result = await response.json();

      console.log("CREATE AD RESPONSE:", result);

      if (!response.ok || !result.success) {
        setMessage(
          result.message || "Failed to create ad"
        );
        return;
      }

      // Clear preview URLs
      images.forEach((imageObj) => {
        URL.revokeObjectURL(imageObj.preview);
      });

      navigate(`/ad/${result.ad._id}`);
    } catch (error) {
      console.error("CREATE AD ERROR:", error);

      setMessage(
        "Server error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="form-page">
      <div className="form-card">

        <Link to="/" className="back-link">
          ← Back to Home
        </Link>

        <div className="form-header">
          <span className="form-icon">📢</span>

          <h1>Post an Ad</h1>

          <p>
            Sell your item quickly and easily on 10X BEEZ.
          </p>
        </div>

        {message && (
          <div className="error-message">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* TITLE */}
          <div className="form-group">
            <label>Ad Title</label>

            <input
              type="text"
              name="title"
              placeholder="What are you selling?"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              placeholder="Describe your item..."
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
            />
          </div>

          {/* PRICE */}
          <div className="form-group">
            <label>Price</label>

            <div className="price-input">
              <span>₹</span>

              <input
                type="number"
                name="price"
                placeholder="Enter price"
                value={formData.price}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>

          {/* CATEGORY */}
          <div className="form-group">
            <label>Category</label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Category
              </option>

              <option value="Electronics">
                Electronics
              </option>

              <option value="Vehicles">
                Vehicles
              </option>

              <option value="Mobiles">
                Mobiles
              </option>

              <option value="Furniture">
                Furniture
              </option>

              <option value="Property">
                Property
              </option>

              <option value="Jobs">
                Jobs
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          {/* LOCATION */}
          <div className="form-group">
            <label>Location</label>

            <input
              type="text"
              name="location"
              placeholder="e.g. Kolhapur"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          {/* IMAGE UPLOAD */}
          <div className="form-group">

            <label>
              Product Images{" "}

              {imageRequiredCategories.includes(
                formData.category
              ) ? (
                <span className="required-star">
                  *
                </span>
              ) : (
                <span className="optional-text">
                  (Optional)
                </span>
              )}
            </label>

            <div className="image-upload-box">

              {/* REAL FILE INPUT */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
                style={{ display: "none" }}
              />

              {/* BUTTON */}
              <button
                type="button"
                className="image-upload-button"
                onClick={openFileSelector}
              >
                📷 Add Images
              </button>

              <p className="image-help">
                Select up to 5 images • Maximum 5 MB each
              </p>

            </div>

            {/* IMAGE PREVIEW */}
            {images.length > 0 && (
              <>
                <div className="image-preview-grid">

                  {images.map((imageObj, index) => (
                    <div
                      className="image-preview-card"
                      key={`${imageObj.file.name}-${index}`}
                    >

                      <img
                        src={imageObj.preview}
                        alt={`Preview ${index + 1}`}
                      />

                      {/* REMOVE */}
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() =>
                          removeImage(index)
                        }
                      >
                        ✕
                      </button>

                      {/* MAIN IMAGE */}
                      {index === 0 && (
                        <span className="main-image-label">
                          Main
                        </span>
                      )}

                    </div>
                  ))}

                </div>

                <p className="image-count">
                  {images.length}/5 images selected
                </p>
              </>
            )}

          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
          >
            {loading
              ? "Posting..."
              : "🚀 Post Ad"}
          </button>

        </form>
      </div>
    </main>
  );
}

export default CreateAd;