import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";
import { FaLock, FaLockOpen } from "react-icons/fa";

const API_BASE = process.env.REACT_APP_API_URL || "";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Step 1 — Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!identifier.trim()) {
      return setError("Please enter your username or email.");
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/forgot/send-otp`, { identifier });
      setSuccess("OTP sent! Check your email.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!otp.trim()) return setError("Please enter the OTP.");
    if (otp.length !== 6) return setError("OTP must be 6 digits.");

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/forgot/verify-otp`, {
        identifier,
        otp,
      });
      setSuccess("OTP verified! Set your new password.");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!newPassword) return setError("Please enter a new password.");
    if (newPassword.length < 4)
      return setError("Password must be at least 4 characters.");
    if (!confirmPassword) return setError("Please confirm your new password.");
    if (newPassword !== confirmPassword)
      return setError("Passwords do not match.");

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/reset-password`, {
        identifier,
        newPassword,
      });
      setSuccess("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Reset failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const stepTitle = {
    1: "Find your account",
    2: "Enter your OTP",
    3: "Create a new password",
  }[step];

  const stepChip = {
    1: "Step 1 of 3 — Identify Account",
    2: "Step 2 of 3 — Verify OTP",
    3: "Step 3 of 3 — New Password",
  }[step];

  return (
    <div className="app-shell--auth">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-grid" />

      <main className="login-layout">
        <div className="auth-page-header">
          <Link to="/login" className="auth-back-link">
            ← Back to Login
          </Link>
        </div>

        <section className="create-card login-card">
          <div className="auth-card-header">
            <p className="eyebrow">Reset Password</p>
            <h1 className="auth-card-title">{stepTitle}</h1>
            <p className="auth-card-subtitle">
              Remembered it? <Link to="/login">Log in</Link>
            </p>
          </div>

          <div className="lane-chip">{stepChip}</div>

          {/* Step 1 — Identifier */}
          {step === 1 && (
            <form
              className="create-form create-form--login"
              onSubmit={handleSendOtp}
            >
              <label className="create-field create-field--full">
                <span>Username or Email</span>
                <input
                  type="text"
                  placeholder="Enter your username or email"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    clearMessages();
                  }}
                />
              </label>

              {error && (
                <div className="lane-error create-field--full">{error}</div>
              )}
              {success && (
                <div className="create-success create-field--full">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="create-submit-btn create-field--full"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {/* Step 2 — OTP */}
          {step === 2 && (
            <form
              className="create-form create-form--login"
              onSubmit={handleVerifyOtp}
            >
              <label className="create-field create-field--full">
                <span>6-Digit OTP</span>
                <input
                  type="text"
                  placeholder="Enter the OTP sent to your email"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    clearMessages();
                  }}
                />
              </label>

              {error && (
                <div className="lane-error create-field--full">{error}</div>
              )}
              {success && (
                <div className="create-success create-field--full">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="create-submit-btn create-field--full"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                className="auth-back-link create-field--full"
                style={{ justifyContent: "center" }}
                onClick={() => {
                  clearMessages();
                  setStep(1);
                }}
              >
                ← Back
              </button>
            </form>
          )}

          {/* Step 3 — New Password */}
          {step === 3 && (
            <form
              className="create-form create-form--login"
              onSubmit={handleResetPassword}
            >
              <label className="create-field create-field--full">
                <span>New Password</span>
                <div className="password-field-wrap">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      clearMessages();
                    }}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showNewPassword ? (
                      <FaLockOpen color="#7c3aed" />
                    ) : (
                      <FaLock color="#7c3aed" />
                    )}
                  </button>
                </div>
              </label>

              <label className="create-field create-field--full">
                <span>Confirm New Password</span>
                <div className="password-field-wrap">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearMessages();
                    }}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <FaLockOpen color="#7c3aed" />
                    ) : (
                      <FaLock color="#7c3aed" />
                    )}
                  </button>
                </div>
              </label>

              {error && (
                <div className="lane-error create-field--full">{error}</div>
              )}
              {success && (
                <div className="create-success create-field--full">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="create-submit-btn create-field--full"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
