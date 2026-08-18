import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const fetchAds = async (
    searchValue = search,
    categoryValue = category
  ) => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (searchValue.trim()) {
        params.append("search", searchValue.trim());
      }

      if (categoryValue) {
        params.append("category", categoryValue);
      }

      const url = `${import.meta.env.VITE_API_URL}/api/ads?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();

      console.log("API DATA:", data);

      if (data.success) {
        setAds(data.ads);
      } else {
        setAds([]);
      }
    } catch (error) {
      console.error("API ERROR:", error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAds(search, category);
  };

  return (
    <main className="home">

      {/* HERO */}
      <section className="hero">
        <div>
          <span className="hero-badge">
            India's Local Marketplace
          </span>

          <h1>
            Buy & Sell
            <br />
            <span>Anything.</span>
          </h1>

          <p>
            Find great deals near you or sell your unused
            items quickly and easily.
          </p>

          <form
            className="search-box"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="What are you looking for?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Mobiles">Mobiles</option>
              <option value="Furniture">Furniture</option>
              <option value="Property">Property</option>
              <option value="Jobs">Jobs</option>
              <option value="Other">Other</option>
            </select>

            <button type="submit">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories-section">

        <div className="section-heading">
          <h2>Browse Categories</h2>
          <span>{ads.length} ads available</span>
        </div>

        <div className="category-list">
          {[
            "All",
            "Electronics",
            "Vehicles",
            "Mobiles",
            "Furniture",
            "Property",
            "Jobs",
            "Other",
          ].map((item) => (
            <button
              key={item}
              className={
                category ===
                (item === "All" ? "" : item)
                  ? "active"
                  : ""
              }
              onClick={() =>
                setCategory(
                  item === "All" ? "" : item
                )
              }
            >
              {item}
            </button>
          ))}
        </div>

      </section>

      {/* ADS */}
      <section className="ads-section">

        <div className="section-heading">
          <div>
            <h2>Latest Ads</h2>
            <p>Fresh listings from our community</p>
          </div>
        </div>

        {loading ? (
          <div className="status-box">
            <p>Loading ads...</p>
          </div>
        ) : ads.length === 0 ? (
          <div className="status-box">
            <h3>No ads found</h3>
            <p>
              Try another search or category.
            </p>
          </div>
        ) : (
          <div className="ads-grid">

            {ads.map((ad) => (

              <div
                className="ad-card"
                key={ad._id}
              >

                {/* =========================
                    AD IMAGE
                ========================= */}
                <div className="ad-card-image">

                  {ad.images &&
                  ad.images.length > 0 ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${ad.images[0]}`}
                      alt={ad.title}
                    />
                  ) : (
                    <div className="ad-image-placeholder">
                      📦
                    </div>
                  )}

                  <span className="ad-category">
                    {ad.category}
                  </span>

                </div>

                {/* =========================
                    AD CONTENT
                ========================= */}
                <div className="ad-card-body">

                  <h3>
                    {ad.title}
                  </h3>

                  <p className="description">
                    {ad.description}
                  </p>

                  <h2>
                    ₹{" "}
                    {Number(ad.price).toLocaleString(
                      "en-IN"
                    )}
                  </h2>

                  <p className="location">
                    📍 {ad.location}
                  </p>

                  <Link
                    to={`/ad/${ad._id}`}
                    className="details-btn"
                  >
                    View Details →
                  </Link>

                </div>

              </div>

            ))}

          </div>
        )}

      </section>

    </main>
  );
}

export default Home;