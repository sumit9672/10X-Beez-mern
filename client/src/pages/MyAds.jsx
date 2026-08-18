import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function MyAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchMyAds = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/ads/my-ads",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setAds(data.ads);
      }
    } catch (error) {
      console.error("MY ADS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAds();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this ad?"
    );

    if (!confirmDelete) return;

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
        setAds((currentAds) =>
          currentAds.filter((ad) => ad._id !== id)
        );
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("DELETE ERROR:", error);
      alert("Failed to delete ad");
    }
  };

  if (loading) {
    return (
      <main className="my-ads-page">
        <div className="status-box">
          <p>Loading your ads...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="my-ads-page">

      {/* Header */}
      <div className="my-ads-header">

        <div>
          <span className="page-badge">📦 Your Listings</span>

          <h1>My Ads</h1>

          <p>
            Manage the items you've posted on 10X BEEZ.
          </p>
        </div>

        <Link
          to="/create-ad"
          className="new-ad-btn"
        >
          + Post New Ad
        </Link>

      </div>

      {/* Stats */}
      <div className="ads-stats">
        <div className="stat-card">
          <span>Total Ads</span>
          <strong>{ads.length}</strong>
        </div>

        <div className="stat-card">
          <span>Status</span>
          <strong>Active</strong>
        </div>
      </div>

      {/* Ads */}
      {ads.length === 0 ? (
        <div className="empty-ads">

          <div className="empty-icon">
            📦
          </div>

          <h2>No Ads Yet</h2>

          <p>
            You haven't posted anything yet.
            Start selling your items today!
          </p>

          <Link
            to="/create-ad"
            className="primary-btn empty-btn"
          >
            + Post Your First Ad
          </Link>

        </div>
      ) : (
        <div className="my-ads-grid">

          {ads.map((ad) => (
            <div
              className="my-ad-card"
              key={ad._id}
            >

              {/* Card top */}
              <div className="my-ad-top">

                <span className="ad-category">
                  {ad.category}
                </span>

                <span className="active-badge">
                  ● Active
                </span>

              </div>

              {/* Card body */}
              <div className="my-ad-body">

                <h2>{ad.title}</h2>

                <p className="my-ad-description">
                  {ad.description}
                </p>

                <h3>
                  ₹ {Number(ad.price).toLocaleString("en-IN")}
                </h3>

                <p className="my-ad-location">
                  📍 {ad.location}
                </p>

                <p className="posted-date">
                  Posted on{" "}
                  {new Date(ad.createdAt).toLocaleDateString(
                    "en-IN"
                  )}
                </p>

              </div>

              {/* Actions */}
              <div className="my-ad-actions">

                <Link
                  to={`/ad/${ad._id}`}
                  className="view-ad-btn"
                >
                  View
                </Link>

                <button
                  className="edit-btn"
                  onClick={() =>
                    navigate(`/edit-ad/${ad._id}`)
                  }
                >
                  ✏️ Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    handleDelete(ad._id)
                  }
                >
                  🗑️ Delete
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </main>
  );
}

export default MyAds;