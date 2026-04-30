import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        { name, email, password, role }
      );

      alert(res.data.message);

      if (role === "admin") {
        setName("");
        setEmail("");
        setPassword("");
        setRole("member");
        return;
      }

      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <main className="background_wrapper">
      <div className="login_form_wrapper">
        <form className="login_form" onSubmit={handleSignup}>
          <h1 className="title">Signup</h1>

          <div className="login_form_content">
            <div className="login_content_box">
              <span className="icon">👤</span>
              <div className="login_content_box_input">
                <input
                  id="name"
                  type="text"
                  placeholder=" "
                  className="login_input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <label htmlFor="name" className="login_label">
                  Name
                </label>
              </div>
            </div>

            <div className="login_content_box">
              <span className="icon">📧</span>
              <div className="login_content_box_input">
                <input
                  id="signupEmail"
                  type="email"
                  placeholder=" "
                  className="login_input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label htmlFor="signupEmail" className="login_label">
                  Email
                </label>
              </div>
            </div>

            <div className="login_content_box">
              <span className="icon">🔒</span>
              <div className="login_content_box_input">
                <input
                  id="signupPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  className="login_input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label htmlFor="signupPassword" className="login_label">
                  Password
                </label>

                <span
                  className="password_eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

            <div className="login_content_box">
              <span className="icon">🛡️</span>
              <div className="login_content_box_input">
                <select
                  id="role"
                  className="login_input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin (Requires Approval)</option>
                </select>
                <label htmlFor="role" className="login_label">
                  Role
                </label>
              </div>
            </div>

            {role === "admin" && (
              <p className="admin_note">
                Admin signup requires superuser approval via email.
              </p>
            )}

            <button className="button_login" type="submit">
              Signup
            </button>

            <p className="register_login">
              Already have an account? <Link to="/">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}

export default Signup;