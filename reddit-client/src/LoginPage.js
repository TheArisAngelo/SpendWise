import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";
import { FaLock, FaLockOpen } from "react-icons/fa";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";

const AUTH_STORAGE_KEY = "budget-tracker-auth";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const identifier = formData.identifier.trim();
    const password = formData.password.trim();

    if (!identifier) {
      setError("Please enter your username or email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        { identifier, password },
      );

      const authData = {
        isLoggedIn: true,
        username: response.data.user.username,
        token: response.data.token,
      };

      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

      if (onLogin) onLogin(authData);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError("");

      const result = await signInWithPopup(auth, googleProvider);
      const firebaseToken = await result.user.getIdToken();

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/google`,
        { firebaseToken },
      );

      const authData = {
        isLoggedIn: true,
        username: response.data.user.username,
        token: response.data.token,
      };

      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

      if (onLogin) onLogin(authData);
      navigate("/");
    } catch (err) {
      if (err.response?.status === 404) {
        setError(
          "No account found for this Google account. Please sign up first.",
        );
      } else {
        setError(err.response?.data?.message || "Google sign-in failed.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="app-shell--auth">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-grid" />

      <main className="login-layout">
        <div className="auth-page-header">
          <Link to="/" className="auth-back-link">
            ← Back to Home
          </Link>
        </div>

        <section className="create-card login-card">
          <div className="auth-card-header">
            <p className="eyebrow">Login</p>
            <h1 className="auth-card-title">Access your account</h1>
            <p className="auth-card-subtitle">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>

          <div className="lane-chip">Sign In</div>

          <button
            type="button"
            className="google-signin-btn"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              "Signing in..."
            ) : (
              <>
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                />
                Continue with Google
              </>
            )}
          </button>

          <div className="auth-divider">
            <span>or sign in with username or email</span>
          </div>

          <form
            className="create-form create-form--login"
            onSubmit={handleSubmit}
          >
            <label className="create-field create-field--full">
              <span>Username or Email</span>
              <input
                type="text"
                name="identifier"
                placeholder="Enter your username or email"
                value={formData.identifier}
                onChange={handleChange}
              />
            </label>

            <label className="create-field create-field--full">
              <span>Password</span>
              <div className="password-field-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="password-toggle-btn"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FaLockOpen color="#7c3aed" />
                  ) : (
                    <FaLock color="#7c3aed" />
                  )}
                </button>
              </div>
            </label>

            <div className="create-field--full login-forgot-row">
              <Link to="/forgot-password" className="login-forgot-link">
                Forgot Password?
              </Link>
            </div>

            {error ? (
              <div className="lane-error create-field--full">{error}</div>
            ) : null}

            <button
              type="submit"
              className="create-submit-btn create-field--full"
              disabled={loading}
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
