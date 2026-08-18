import { Link } from "react-router-dom";

function AdCard({ ad }) {
  return (
    <div className="ad-card">
      <div className="ad-card-content">
        <span className="ad-category">{ad.category}</span>

        <h3>{ad.title}</h3>

        <p>{ad.description}</p>

        <h2>₹ {ad.price.toLocaleString("en-IN")}</h2>

        <p>📍 {ad.location}</p>

        <Link to={`/ad/${ad._id}`} className="view-btn">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default AdCard;