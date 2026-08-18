import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    localStorage.setItem(
      "darkMode",
      darkMode
    );
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="logo">
          <span>10X</span> BEEZ
        </Link>

        {/* Navigation */}
        <div className="nav-links">

          <Link
            to="/"
            className="nav-link"
          >
            Home
          </Link>

          {!token ? (
            <>
              <Link
                to="/login"
                className="nav-link"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="nav-link"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/my-ads"
                className="nav-link"
              >
                My Ads
              </Link>

              {/* Messages */}
              <Link
                to="/chats"
                className="nav-link messages-link"
              >
                💬 Messages
              </Link>

              <Link
                to="/create-ad"
                className="post-ad-btn"
              >
                + Post Ad
              </Link>

              <button
                onClick={handleLogout}
                className="logout-btn"
              >
                Logout
              </button>
            </>
          )}

          {/* Dark Mode */}
          <button
            className="theme-toggle"
            onClick={() =>
              setDarkMode(!darkMode)
            }
            title={
              darkMode
                ? "Switch to Light Mode"
                : "Switch to Dark Mode"
            }
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;