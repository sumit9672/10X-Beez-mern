import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function AdDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const token = localStorage.getItem("token");

  // =========================
  // GET USER ID FROM JWT
  // =========================
  const getUserIdFromToken = () => {
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId;
    } catch (error) {
      return null;
    }
  };

  const currentUserId = getUserIdFromToken();

  // =========================
  // FETCH SINGLE AD
  // =========================
  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/ads/${id}`
        );

        const data = await response.json();

        console.log("SINGLE AD:", data);

        if (data.success) {
          setAd(data.ad);
          setSelectedImage(0);
        }
      } catch (error) {
        console.error("GET AD ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [id]);

  // =========================
  // START CHAT WITH SELLER
  // =========================
  const handleChat = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!ad) return;

    if (isOwner) {
      alert("You cannot chat with yourself.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/chat/conversation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            adId: ad._id,
            sellerId: ad.user,
          }),
        }
      );

      const data = await response.json();

      console.log("CONVERSATION:", data);

      if (!response.ok || !data.success) {
        alert(
          data.message || "Failed to start conversation"
        );
        return;
      }

      navigate(`/chat/${data.conversation._id}`);
    } catch (error) {
      console.error("CHAT ERROR:", error);
      alert("Failed to start chat");
    }
  };

  // =========================
  // DELETE AD
  // =========================
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this ad?"
    );

    if (!confirmDelete) return;

    setDeleting(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/ads/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        navigate("/my-ads");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("DELETE ERROR:", error);
      alert("Failed to delete ad");
    } finally {
      setDeleting(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <main className="ad-details-page">
        <div className="status-box">
          <p>Loading ad...</p>
        </div>
      </main>
    );
  }

  // =========================
  // AD NOT FOUND
  // =========================
  if (!ad) {
    return (
      <main className="ad-details-page">
        <div className="status-box">
          <h2>Ad not found</h2>

          <Link to="/">
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  // =========================
  // CHECK OWNER
  // =========================
  const isOwner =
    currentUserId &&
    ad.user &&
    currentUserId === ad.user.toString();

  // =========================
  // IMAGES
  // =========================
  const images = ad.images || [];

  return (
    <main className="ad-details-page">

      {/* Back */}
      <Link to="/" className="details-back">
        ← Back to Home
      </Link>

      <div className="details-layout">

        {/* =========================
            MAIN CARD
        ========================= */}
        <section className="details-card">

          {/* =========================
              IMAGE GALLERY
          ========================= */}
          <div className="details-image-section">

            {/* Main Image */}
            <div className="details-main-image">

              {images.length > 0 ? (
                <img
                  src={`http://localhost:5000${images[selectedImage]}`}
                  alt={ad.title}
                />
              ) : (
                <div className="details-placeholder">
                  📦
                </div>
              )}

            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="image-thumbnails">

                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={
                      selectedImage === index
                        ? "thumbnail active"
                        : "thumbnail"
                    }
                    onClick={() =>
                      setSelectedImage(index)
                    }
                  >
                    <img
                      src={`http://localhost:5000${image}`}
                      alt={`${ad.title} ${index + 1}`}
                    />
                  </button>
                ))}

              </div>
            )}

          </div>

          {/* =========================
              AD CONTENT
          ========================= */}
          <div className="details-content">

            <div className="details-top">

              <span className="ad-category">
                {ad.category}
              </span>

              <span className="details-status">
                ● Available
              </span>

            </div>

            <h1>{ad.title}</h1>

            <div className="details-price">
              ₹{" "}
              {Number(ad.price).toLocaleString("en-IN")}
            </div>

            <div className="details-location">
              📍 {ad.location}
            </div>

            <hr />

            <h2>Description</h2>

            <p className="details-description">
              {ad.description}
            </p>

            <div className="details-date">
              Posted on{" "}
              {new Date(
                ad.createdAt
              ).toLocaleDateString("en-IN")}
            </div>

          </div>

        </section>

        {/* =========================
            SIDEBAR
        ========================= */}
        <aside className="details-sidebar">

          {/* Seller Information */}
          <div className="seller-card">

            <h3>Seller Information</h3>

            <div className="seller-avatar">
              👤
            </div>

            <p className="seller-label">
              Seller
            </p>

            <p className="seller-id">
              10X BEEZ User
            </p>

          </div>

          {/* =========================
              CHAT WITH SELLER
          ========================= */}
          {!isOwner && token && (
            <div className="chat-seller-action">

              <button
                className="chat-seller-btn"
                onClick={handleChat}
              >
                💬 Chat with Seller
              </button>

            </div>
          )}

          {/* =========================
              OWNER ACTIONS
          ========================= */}
          {isOwner && (
            <div className="owner-actions">

              <h3>Manage Ad</h3>

              {/* Edit */}
              <button
                className="details-edit-btn"
                onClick={() =>
                  navigate(`/edit-ad/${ad._id}`)
                }
              >
                ✏️ Edit Ad
              </button>

              {/* Delete */}
              <button
                className="details-delete-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "🗑️ Delete Ad"}
              </button>

            </div>
          )}

          {/* Browse More */}
          <Link
            to="/"
            className="browse-btn"
          >
            Browse More Ads
          </Link>

        </aside>

      </div>

    </main>
  );
}

export default AdDetails;