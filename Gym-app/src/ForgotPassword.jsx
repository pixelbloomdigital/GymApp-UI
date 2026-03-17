import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
const API_URL = "http://localhost:3001/users";
export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // ========== BACKEND INTEGRATION POINT 1 ==========
  // Send OTP to user's email
 const handleSendOTP = async () => {
  if (!email) {
    setError('Please enter your email');
    return;
  }

  setLoading(true);
  setError('');

  try {
    // check if email exists
    const res = await fetch(`${API_URL}?email=${email.trim()}`);
    const user = await res.json();

    if (user.length === 0) {
      setError("Email not registered");
      setLoading(false);
      return;
    }

    // generate 6 digit otp
const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();


// expiry = 2 minutes from now
const expiryTime = Date.now() + 2 * 60 * 1000;

await fetch(`${API_URL}/${user[0].id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    otp: generatedOTP,
    otpExpiry: expiryTime
  })
});

alert(`Mock OTP: ${generatedOTP} (valid 2 min)`);

    setLoading(false);
    setStep(2);
    alert(`Mock OTP (check console): ${generatedOTP}`);

  } catch {
    setError("Server not running");
    setLoading(false);
  }
};

  // ========== BACKEND INTEGRATION POINT 2 ==========
  // Verify OTP entered by user
  const handleVerifyOTP = async () => {
  if (!otp) {
    setError("Please enter OTP");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const res = await fetch(`${API_URL}?email=${email.trim()}`);
    const users = await res.json();

    if (!users.length) {
      setError("User not found");
      return;
    }

    const dbUser = users[0];

    console.log("Entered OTP:", otp);
    console.log("DB OTP:", dbUser.otp);

    // FIXED COMPARISON
    if (String(dbUser.otp).trim() !== otp.trim()) {
      setError("Invalid OTP");
      return;
    }

    // expiry check
    if (Date.now() > Number(dbUser.otpExpiry)) {
      setError("OTP expired. Request new OTP.");
      return;
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setStep(3);
    }, 1500);

  } catch (error) {
    setError("Server error");
  } finally {
    setLoading(false);
  }
};

  const handleUpdatePassword = async () => {
  if (!newPassword) {
    setError('Please enter new password');
    return;
  }

  const strongPasswordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!strongPasswordPattern.test(newPassword)) {
    setError('Weak password format');
    return;
  }

  setLoading(true);
  setError('');

  try {
    // get user
    const res = await fetch(`${API_URL}?email=${email.trim()}`);
    const user = await res.json();

    // update password & remove otp
   await fetch(`${API_URL}/${user[0].id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    password: newPassword,
    otp: null,
    otpExpiry: null
  })
});

    alert("Password updated successfully! Please login again.");

localStorage.removeItem("user");
sessionStorage.clear();

setTimeout(() => {
  navigate("/");
}, 1500);

  } catch {
    setError("Failed to update password");
  } finally {
    setLoading(false);
  }
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
      {showSuccess && (
        <div style={styles.successToast}>
          <span style={styles.successIcon}>✓</span>
          <span style={{ color: '#1f2937' }}>OTP is Successfully Verified</span>
          <button onClick={() => setShowSuccess(false)} style={styles.closeToast}>×</button>
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

          {/* Step 1: Email Input */}
          {step === 1 && (
            <>
              <div style={styles.field}>
                <label style={styles.label}>Enter your email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  style={styles.input}
                />
              </div>
              <button onClick={handleSendOTP} style={styles.submitButton}>
                Send OTP
              </button>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <>
              <div style={styles.field}>
                <label style={styles.label}>Enter your email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  style={styles.inputReadonly}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  maxLength={6}
                  style={styles.input}
                />
              </div>

              <button onClick={handleVerifyOTP} style={styles.submitButton}>
                Verify OTP
              </button>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <>
              <div style={styles.field}>
                <label style={styles.label}>Enter your email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  style={styles.inputReadonly}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  readOnly
                  style={styles.inputReadonly}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Enter New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter New Password"
                  style={styles.input}
                />
              </div>
              <div style={{
        fontSize: "0.75rem", 
        color: "#98cfff", 
        marginTop: "0.25rem",
        fontStyle: "italic"
      }}>
        8+ chars: Uppercase, lowercase, number, special (@$!%*?)
      </div>
  
              <button onClick={handleUpdatePassword} style={styles.submitButton}>
                Update Password
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