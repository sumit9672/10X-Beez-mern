import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function EditAd() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    location: "",
  });

  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const imageRequiredCategories = [
    "Electronics",
    "Vehicles",
    "Mobiles",
    "Furniture",
    "Property",
  ];

  // =========================
  // GET EXISTING AD
  // =========================

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/ads/${id}`
        );

        const data = await response.json();

        console.log("EDIT AD:", data);

        if (!response.ok || !data.success) {
          setError(data.message || "Ad not found");
          return;
        }

        setFormData({
          title: data.ad.title || "",
          description: data.ad.description || "",
          price: data.ad.price || "",
          category: data.ad.category || "",
          location: data.ad.location || "",
        });

        setImages(data.ad.images || []);
      } catch (error) {
        console.error("GET AD ERROR:", error);
        setError("Failed to load ad");
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [id]);

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================
  // ADD NEW IMAGES
  // =========================

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    setError("");

    if (selectedFiles.length === 0) {
      return;
    }

    if (
      images.length +
        newImages.length +
        selectedFiles.length >
      5
    ) {
      setError("Maximum 5 images are allowed.");
      e.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setError(
          "Only JPG, JPEG, PNG and WEBP images are allowed."
        );
        e.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError(
          `${file.name} is larger than 5 MB.`
        );
        e.target.value = "";
        return;
      }
    }

    setNewImages((prev) => [
      ...prev,
      ...selectedFiles,
    ]);

    e.target.value = "";
  };

  // =========================
  // REMOVE EXISTING IMAGE
  // =========================

  const removeExistingImage = (index) => {
    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setError("");
  };

  // =========================
  // REMOVE NEW IMAGE
  // =========================

  const removeNewImage = (index) => {
    setNewImages((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setError("");
  };

  // =========================
  // UPDATE AD
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      navigate("/login");
      return;
    }

    const totalImages =
      images.length + newImages.length;

    // Required category validation
    if (
      imageRequiredCategories.includes(
        formData.category
      ) &&
      totalImages === 0
    ) {
      setError(
        "At least 1 image is required for this category."
      );
      return;
    }

    if (totalImages > 5) {
      setError("Maximum 5 images are allowed.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const data = new FormData();

      data.append(
        "title",
        formData.title.trim()
      );

      data.append(
        "description",
        formData.description.trim()
      );

      data.append(
        "price",
        Number(formData.price)
      );

      data.append(
        "category",
        formData.category
      );

      data.append(
        "location",
        formData.location.trim()
      );

      // Existing images that should remain
      data.append(
        "existingImages",
        JSON.stringify(images)
      );

      // New images
      newImages.forEach((image) => {
        data.append("images", image);
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ads/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      const result = await response.json();

      console.log("UPDATE RESULT:", result);

      if (!response.ok || !result.success) {
        setError(
          result.message ||
            "Failed to update ad"
        );
        return;
      }

      setSuccess("Ad updated successfully!");

      setTimeout(() => {
        navigate(`/ad/${id}`);
      }, 700);
    } catch (error) {
      console.error("UPDATE ERROR:", error);

      setError(
        "Server error. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="form-page">
        <div className="form-card">
          <div className="status-box">
            <p>Loading ad...</p>
          </div>
        </div>
      </main>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <main className="form-page">
      <div className="form-card">

        <Link
          to={`/ad/${id}`}
          className="back-link"
        >
          ← Back to Ad
        </Link>

        <div className="form-header">
          <span className="form-icon">
            ✏️
          </span>

          <h1>Edit Ad</h1>

          <p>
            Update your advertisement information
            on 10X BEEZ.
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* TITLE */}

          <div className="form-group">
            <label>Ad Title</label>

            <input
              type="text"
              name="title"
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
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          {/* IMAGES */}

          <div className="form-group">

            <label>
              Product Images
              {imageRequiredCategories.includes(
                formData.category
              ) && (
                <span className="required-star">
                  *
                </span>
              )}
            </label>

            {/* Upload */}

            <div className="image-upload-box">

              <input
                id="editImageInput"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
                hidden
              />

              <label
                htmlFor="editImageInput"
                className="image-upload-button"
              >
                📷 Add More Images
              </label>

              <p className="image-help">
                Maximum 5 images • 5 MB each
              </p>

            </div>

            {/* EXISTING IMAGES */}

            {images.length > 0 && (
              <>
                <h4 className="image-section-title">
                  Existing Images
                </h4>

                <div className="image-preview-grid">

                  {images.map(
                    (image, index) => (
                      <div
                        className="image-preview-card"
                        key={image}
                      >

                        <img
                          src={`${import.meta.env.VITE_API_URL}${image}`}
                          alt={`Existing ${
                            index + 1
                          }`}
                        />

                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() =>
                            removeExistingImage(
                              index
                            )
                          }
                        >
                          ✕
                        </button>

                        {index === 0 && (
                          <span className="main-image-label">
                            Main
                          </span>
                        )}

                      </div>
                    )
                  )}

                </div>
              </>
            )}

            {/* NEW IMAGES */}

            {newImages.length > 0 && (
              <>
                <h4 className="image-section-title">
                  New Images
                </h4>

                <div className="image-preview-grid">

                  {newImages.map(
                    (image, index) => (
                      <div
                        className="image-preview-card"
                        key={`${image.name}-${index}`}
                      >

                        <img
                          src={URL.createObjectURL(
                            image
                          )}
                          alt={`New ${
                            index + 1
                          }`}
                        />

                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() =>
                            removeNewImage(
                              index
                            )
                          }
                        >
                          ✕
                        </button>

                      </div>
                    )
                  )}

                </div>
              </>
            )}

            <p className="image-count">
              {images.length +
                newImages.length}
              /5 images selected
            </p>

          </div>

          {/* BUTTONS */}

          <div className="edit-buttons">

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? "Updating..."
                : "✏️ Update Ad"}
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={() =>
                navigate(`/ad/${id}`)
              }
              disabled={saving}
            >
              Cancel
            </button>

          </div>

        </form>
      </div>
    </main>
  );
}

export default EditAd;