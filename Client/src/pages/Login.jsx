import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password }
      );

      const user = res.data.user;

      // ✅ use sessionStorage (fix multi-tab issue)
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("role", user.role);
      sessionStorage.setItem("userId", user.id);
      sessionStorage.setItem("userName", user.name);
      sessionStorage.setItem("email", user.email || email);

      // ✅ React navigation (no reload)
      if (user.role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }

    } catch (err) {
      alert(err?.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <main className="background_wrapper">
      <div className="login_form_wrapper">
        <form className="login_form" onSubmit={handleLogin}>
          <h1 className="title">Login</h1>

          <div className="login_form_content">
            {/* EMAIL */}
            <div className="login_content_box">
              <span className="icon">👤</span>
              <div className="login_content_box_input">
                <input
                  id="email"
                  type="email"
                  placeholder=" "
                  className="login_input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label htmlFor="email" className="login_label">
                  Email
                </label>
              </div>
            </div>

            {/* PASSWORD */}
            <div className="login_content_box">
              <span className="icon">🔒</span>
              <div className="login_content_box_input">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  className="login_input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label htmlFor="password" className="login_label">
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

            {/* REMEMBER */}
            <div className="remember_login">
              <div className="remember_left">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>

              <a href="#" className="forget_link">
                Forgot password?
              </a>
            </div>

            {/* BUTTON */}
            <button className="button_login" type="submit">
              Login
            </button>

            {/* LINK */}
            <p className="register_login">
              Don’t have an account? <Link to="/signup">Signup</Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}

export default Login;