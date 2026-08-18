import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setMessage("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "${import.meta.env.VITE_API_URL}localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Registration failed");
        return;
      }

      navigate("/login");
    } catch (error) {
      console.error(error);
      setMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="auth-logo">
          10X <span>BEEZ</span>
        </div>

        <h1>Create Account 🚀</h1>
        <p>Join 10X BEEZ and start buying & selling.</p>

        {message && <div className="error-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>

          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            minLength="6"
            required
          />

          <label>Mobile Number</label>

          <input
            type="tel"
            name="phone"
            placeholder="10-digit mobile number"
            value={formData.phone}
            onChange={handleChange}
            maxLength="10"
            required
          />

          <label>Location</label>

          <input
            type="text"
            name="location"
            placeholder="e.g. Kolhapur"
            value={formData.location}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;