import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MemberDashboard.css";

const API_URL = "http://localhost:3001/users";

const MemberDashboard = () => {
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 🔐 Fetch Logged-in Member
  useEffect(() => {
    const fetchMember = async () => {
      try {
        const loggedUser = JSON.parse(localStorage.getItem("user"));

        // 🚨 If not logged in → redirect
        if (!loggedUser) {
          navigate("/");
          return;
        }

        // 🚨 If not member role → redirect
        if (loggedUser.role !== "member") {
          navigate("/");
          return;
        }

        const res = await fetch(`${API_URL}/${String(loggedUser.id)}`);
        const data = await res.json();

        setMember(data);
      } catch (error) {
        console.error("Error fetching member:", error);
      }
    };

    fetchMember();
  }, [navigate]);

  // ⏳ Loading state
  if (!member) {
    return (
      <div style={{ color: "white", padding: "2rem" }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <>
      {/* Video Background */}
      <div className="video-container">
        <video autoPlay loop muted playsInline preload="auto">
          <source src="/videos/gym-video.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="video-overlay"></div>

      <div className="members-container dashboard-container">
        
        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <div className="admin-info">
              <div className="admin-avatar">👤</div>
              <div className="admin-text">
                <p className="admin-greeting">Welcome back</p>
                <p className="admin-name">{member.name}</p>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button className="nav-item active">📊 Dashboard</button>

            <button
              className="nav-item"
              onClick={() => navigate(`/edit-profile/${member.id}`)}
            >
              ✏️ Edit Profile
            </button>

            <button className="nav-item">🏋️ Workouts</button>
            <button className="nav-item">💰 Payments</button>
            <button className="nav-item">📈 Reports</button>
          </nav>
        </div>

        {!sidebarOpen && (
          <button
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
        )}

        {/* Main Content */}
        <div className="main-content">
          <div className="members-header-section">
            <div className="top-nav">
              <button
                className="back-dashboard-btn"
                onClick={() => navigate("/")}
              >
                ← Dashboard
              </button>

              <div className="nav-buttons">
                <button className="nav-button active">Dashboard</button>
                <button className="nav-button">Settings</button>

                <button
                  className="nav-button"
                  onClick={() => {
                    localStorage.removeItem("user");
                    navigate("/");
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Profile Header */}
          <div className="member-profile-header">
            <div className="profile-info">
              <h1 className="profile-name">{member.name}</h1>
              <p className="profile-meta">
                {member.membership || "No membership"} •{" "}
                {member.activityStatus || "No status"}
              </p>
              <p className="profile-contact">
                {member.email} • {member.contact}
              </p>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="dashboard-grid">
            
            {/* Overview */}
            <div className="member-card overview-card">
              <div className="card-header">
                <h3 className="card-title">Overview</h3>
              </div>
              <div className="card-body">
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">Membership</div>
                    <div className="stat-value">
                      {member.membership || "—"}
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-label">Trainer</div>
                    <div className="stat-value">
                      {member.trainer || "—"}
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-label">Attendance</div>
                    <div className="stat-value">
                      {member.attendance || "—"}
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-label">Status</div>
                    <div className="stat-value status-active">
                      {member.activityStatus || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance */}
            <div className="member-card chart-card">
              <div className="card-header">
                <h3 className="card-title">Attendance</h3>
              </div>
              <div className="card-body chart-placeholder">
                <div className="chart-container">
                  {member.attendance || "No attendance data"}
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="member-card activity-card">
              <div className="card-header">
                <h3 className="card-title">Recent Activity</h3>
              </div>
              <div className="card-body">
                <ul className="activity-list">
                  <li>✅ Checked in recently</li>
                  <li>💪 Workout session active</li>
                  <li>💳 Payment up to date</li>
                </ul>
              </div>
            </div>

            {/* Notes */}
            <div className="member-card notes-card">
              <div className="card-header">
                <h3 className="card-title">Trainer Notes</h3>
              </div>
              <div className="card-body">
                <p className="notes-text">
                  {member.notes || "No notes available."}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default MemberDashboard;
