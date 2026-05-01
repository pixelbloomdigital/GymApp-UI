import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import api from './api/axios';
import PasswordField from './components/PasswordField.jsx';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpHint, setOtpHint] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    if (!phone || !/^\d{10}$/.test(phone)) { setError('Enter a valid 10-digit phone number'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/api/auth/otp/send', { phone });
      if (typeof data === 'string') setOtpHint(data);
      setStep(2);
    } catch (e) { setError(e.response?.data?.message || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (!otp) { setError('Enter the OTP'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/api/auth/otp/verify', { phone, otp });
      setStep(3);
    } catch (e) { setError(e.response?.data?.message || 'Invalid or expired OTP'); }
    finally { setLoading(false); }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/api/auth/reset-password', { phone, newPassword });
      alert('Password updated successfully! Please login.');
      navigate('/login');
    } catch (e) { setError(e.response?.data?.message || 'Failed to update password. Please try again.'); }
    finally { setLoading(false); }
  };


  const styles = {
    videoContainer: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: -3,
      overflow: "hidden",
    },
    video: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    heading: {
      textAlign: "center",
      marginBottom: "1.5rem",
      paddingBottom: "1rem",
      borderBottom: "1px solid #8e2bbd", 
    },
    headingTitle: {
      fontSize: "2.25rem",  
      fontWeight: 700,
      background: "linear-gradient(135deg, #8e2bbd 0%, #98cfff 100%)", 
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      margin: 0,
      lineHeight: 1.1,
    },
    headingSubtitle: {
      fontSize: "0.875rem",
      color: "#98cfff", 
      fontWeight: 500,
      margin: "0.25rem 0 0 0",
      letterSpacing: "0.05em",
      textTransform: "uppercase",
    },
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(26, 26, 29, 0.7)", 
      zIndex: -2,
    },
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      width: "100vw",
      position: "relative",
      zIndex: 10,
      fontFamily: "'Poppins', sans-serif",
    },
    
    card: {
      width: "100%",
      maxWidth: "420px",
      background: "#292931",
      borderRadius: "12px",
      padding: "1.5rem",
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      color: "#FFFFFF",
      boxSizing: "border-box",
      fontFamily: "'Poppins', sans-serif",
    },
    field: {
      marginBottom: "0.75rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.25rem",
    },
    label: {
      fontSize: "0.9rem",
      color: "#98cfff",
    },
    input: {
      padding: "0.75rem 0.875rem",
      borderRadius: "8px",
      border: "1px solid #3e0994",
      background: "#1A1A1D",
      color: "#FFFFFF",
      outline: "none",
      fontSize: "1rem",
      boxSizing: "border-box",
    },
    inputReadonly: {
      padding: "0.75rem 0.875rem",
      borderRadius: "8px",
      border: "1px solid #3e0994",
      background: "#1A1A1D",
      color: "#FFFFFF",
      outline: "none",
      fontSize: "1rem",
      boxSizing: "border-box",
      opacity: 0.6,
      cursor: "not-allowed",
    },
    submitButton: {
      marginTop: "0.5rem",
      width: "100%",
      padding: "0.75rem 0.875rem",
      borderRadius: "8px",
      border: "none",
      background: "#8e2bbd",
      color: "#FFFFFF",
      fontWeight: 600,
      cursor: "pointer",
      fontSize: "1rem",
      transition: "background 0.2s",
    },
    errorMessage: {
      background: "#fee2e2",
      color: "#dc2626",
      padding: "12px",
      borderRadius: "6px",
      marginBottom: "16px",
      fontSize: "14px",
    },
    successToast: {
      position: "fixed",
      top: "30px",
      right: "30px",
      background: "white",
      padding: "15px 20px",
      borderRadius: "8px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      zIndex: 1000,
      animation: "slideIn 0.3s ease-out",
    },
    successIcon: {
      color: "#22c55e",
      fontSize: "24px",
      fontWeight: "bold",
    },
    closeToast: {
      background: "none",
      border: "none",
      fontSize: "24px",
      color: "#999",
      cursor: "pointer",
      padding: 0,
      marginLeft: "10px",
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "12px",
      zIndex: 10,
    },
    spinner: {
      width: "50px",
      height: "50px",
      border: "4px solid white",
      borderTopColor: "transparent",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
  };

   return (
    <>
      {/* FIXED Background Video */}
      <div style={styles.videoContainer}>
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          preload="auto"
          style={styles.video}
        >
          <source src="/videos/gym-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>  {/* ✅ FIXED: No extra </source> */}
      </div>

      {/* Overlay */}
      <div style={styles.overlay}></div>

      {/* Success Toast */}
      {step === 3 && (
        <div style={styles.successToast}>
          <span style={styles.successIcon}>✓</span>
          <span style={{ color: '#1f2937' }}>OTP Verified — set your new password</span>
        </div>
      )}

      {/* Main Container */}
      <div style={styles.container}>
        <div style={styles.card}>
          {/* Loading Overlay */}
          {loading && (
            <div style={styles.loadingOverlay}>
              <div style={styles.spinner}></div>
            </div>
          )}

          {/* Header */}
          <div style={styles.heading}>
            <h1 style={styles.headingTitle}>Forgot Password</h1>
            <p style={styles.headingSubtitle}>Reset Your Account</p>
          </div>

          {/* Error Message */}
          {error && <div style={styles.errorMessage}>{error}</div>}

          {/* Step 1: Phone Input */}
          {step === 1 && (
            <>
              <div style={styles.field}>
                <label style={styles.label}>Enter your phone number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit phone number"
                  maxLength={10}
                  style={styles.input}
                />
              </div>
              <button onClick={handleSendOTP} style={styles.submitButton} disabled={loading}>
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <>
              <div style={styles.field}>
                <label style={styles.label}>Phone Number</label>
                <input type="tel" value={phone} readOnly style={styles.inputReadonly} />
              </div>
              {otpHint && <div style={{ fontSize: '0.8rem', color: '#4ade80', padding: '0.5rem', background: 'rgba(74,222,128,0.1)', borderRadius: '6px', marginBottom: '0.5rem' }}>Dev hint: {otpHint}</div>}
              <div style={styles.field}>
                <label style={styles.label}>Enter OTP</label>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit OTP" maxLength={6} style={styles.input} />
              </div>
              <button onClick={handleVerifyOTP} style={styles.submitButton} disabled={loading}>
                {loading ? 'Verifying…' : 'Verify OTP'}
              </button>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <>
              <div style={styles.field}>
                <label style={styles.label}>Enter New Password</label>
                <PasswordField
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  inputStyle={styles.input}
                />
              </div>
              <div style={{ fontSize: "0.75rem", color: "#98cfff", marginTop: "0.25rem", fontStyle: "italic" }}>
                Min. 6 characters
              </div>
              <button onClick={handleUpdatePassword} style={styles.submitButton} disabled={loading}>
                {loading ? 'Updating…' : 'Update Password'}
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}