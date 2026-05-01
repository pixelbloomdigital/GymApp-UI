import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {useAuth} from "./AuthContext.jsx";
import PasswordField from "./components/PasswordField.jsx";
const API_URL = "http://localhost:3001/users";

const LoginScreen = () => {
  const { login } = useAuth();
  const [mode, setMode] = useState("login");
  const [status, setStatus] = useState(null); 
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
  });
  const navigate = useNavigate()
  const clearForm = () => {
    setFormData({
      name: "",
      email: "",
      contact: "",
      password: "",
    });
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // ---------------- REGISTER ----------------
    if (mode === "register") {

      if (!formData.name || !formData.contact) {
        setStatus({ type: "error", message: "Please fill all fields." });
        return;
      }

      // check if email already exists
      const checkUser = await fetch(`${API_URL}?email=${formData.email}`);
      const existingUser = await checkUser.json();

      if (existingUser.length > 0) {
        setStatus({ type: "error", message: "Email already registered." });
        return;
      }

      // create user
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "member"
        }),
      });

      setStatus({ type: "success", message: "Account created successfully!" });
      setMode("login");
      clearForm();
      return;
    }

    // ---------------- LOGIN ----------------
    // ---------------- LOGIN ----------------
if (mode === "login") {
  const res = await fetch(
    `${API_URL}?email=${formData.email}&password=${formData.password}`
  );
  const user = await res.json();

  if (user.length > 0) {
    const loggedUser = user[0];

    setStatus({ type: "success", message: "Login successful! Redirecting..." });

    // store user
    login(loggedUser);
    setTimeout(() => {
      // 🔥 ROLE BASED NAVIGATION
      if (loggedUser.role === "admin") {
        navigate("/admin-dashboard");
      } 
      else if (loggedUser.role === "member") {
        navigate(`/member-dashboard/${loggedUser.id}`);
      }
    }, 1200);

  } else {
    setStatus({ type: "error", message: "Invalid email or password." });
  }
}


  } catch (error) {
    setStatus({ type: "error", message: "Server not running!" });
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
      fontSize: "3rem",  
      fontWeight: 700,
      background: "linear-gradient(135deg, #8e2bbd 0%, #98cfff 100%)", 
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      margin: 0,
      lineHeight: 1.1,
   },
  headingSubtitle: {
    fontSize: "0.9rem",
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
    },
    tabs: {
      display: "flex",
      marginBottom: "1.5rem",
      marginTop: "1rem",
      borderRadius: "8px",
      overflow: "hidden",
      border: "1px solid #0d063b",
    },
    tabButton: {
      flex: 1,
      padding: "0.75rem 0",
      border: "none",
      background: "#4b4b55",
      color: "#ffffff",
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "1rem",
    },
    tabButtonActive: {
      background: "#3e0994",
      color: "#FFFFFF",
    },
    field: {
      marginBottom: "0.75rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.25rem",
    },
    label: {
      fontSize: "1rem",
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
    },
    helperText: {
      marginTop: "0.85rem",
      fontSize: "0.85rem",
      textAlign: "center",
      color: "#98cfff",
    },
    statusMessage: {
      padding: "1rem",
      borderRadius: "12px",
      textAlign: "center",
      fontWeight: "500",
      fontSize: "0.95rem",
      marginTop: "1rem",
    }
  };
  return (
    <>
      <div style={styles.videoContainer}>
        <video autoPlay muted loop playsInline preload="auto" style={styles.video}>
          <source src="/videos/gym-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      <div style={styles.overlay}></div>
      
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.heading}>
            <h1 style={styles.headingTitle}>MuscleFit</h1>
            <p style={styles.headingSubtitle}>Management Portal</p>
          </div>

          <h3 style={{ fontSize: "1.3rem", textAlign: "center", marginBottom: "1rem", color: "#98cfff" }}>
            {mode === "login" ? "Welcome Back!" : "Create Your Account"}
          </h3>

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInput}
                  placeholder="Enter your name"
                  style={styles.input}
                  required
                  minLength="2"
                />
              </div>
            )}

            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInput}
                placeholder="you@example.com"
                style={styles.input}
                required
              />
            </div>
            {mode === "register" && (
            <div style={styles.field}>
              <label style={styles.label}>Contact</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleInput}
                placeholder="Enter your contact number"
                style={styles.input}
                required
                maxLength="10"
                pattern="[0-9]{10}"
              />
            </div>)}

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <PasswordField
                name="password"
                value={formData.password}
                onChange={handleInput}
                placeholder="••••••••"
                inputStyle={styles.input}
                required
                minLength="8"
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                title="Password must be at least 8 characters long and include uppercase, lowercase, number, and special character(@ $ ! % * ? &)."
              />
              {mode === "register" && (
                <div style={{ fontSize: "0.75rem", color: "#98cfff", marginTop: "0.25rem" }}>
                  Password must be at least 8 characters long and include uppercase, lowercase, number, and special character(@ $ ! % * ? &).
                </div>
              )}
            </div>

            {mode === "login" && (
              <p style={{
                fontSize: "0.85rem",
                textAlign: "right",
                margin: "0 0 1rem 0",
                color: "#98cfff",
              }}>
                <span 
                  style={{ cursor: "pointer", textDecoration: "underline" }} 
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </span>
              </p>
            )}

            <button type="submit" style={styles.submitButton}>
              {mode === "login" ? "Login" : "Create account"}
            </button>

            {status && (
              <div
                style={{
                  ...styles.statusMessage,
                  backgroundColor: status.type === "success" ? "#10b98120" : "#ef444420",
                  marginTop: "1rem",
                  border: `2px solid ${status.type === "success" ? "#10b981" : "#ef4444"}`,
                  color: status.type === "success" ? "#059669" : "#dc2626",
                }}
              >
                {status.message}
              </div>
            )}
          </form>

          <p style={styles.helperText}>
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <span 
                  style={{ color: "#98cfff", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }} 
                  onClick={() => { setMode("register"); clearForm(); }}
                >
                  Register
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span 
                  style={{ color: "#98cfff", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }} 
                  onClick={() => { setMode("login"); clearForm(); }}
                >
                  Login
                </span>
              </>
            )}
          </p>
          <p style={{ ...styles.helperText, marginTop: "0.5rem" }}>
            <span
              style={{ color: "#98cfff", cursor: "pointer", textDecoration: "underline" }}
              onClick={() => navigate("/")}
            >
              ← Back to Portal
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginScreen; 
