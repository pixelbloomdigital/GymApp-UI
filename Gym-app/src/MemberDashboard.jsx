import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/users";

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
  videoOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(26, 26, 29, 0.8)",
    zIndex: -2,
  },
  membersContainer: {
    display: "flex",
    background: "transparent",
    position: "relative",
    zIndex: 10,
    fontFamily: "'Poppins', sans-serif",
  },
  sidebar: {
    width: "280px",
    background: "#1A1A1D",
    borderRight: "1px solid #3e0994",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    height: "100vh",
    left: 0,
    top: 0,
    zIndex: 100,
    boxShadow: "4px 0 20px rgba(62, 9, 148, 0.15)",
    transition: "left 0.3s ease",
  },
  sidebarClosed: {
    left: "-280px",
  },
  sidebarHeader: {
    padding: "2rem 1.5rem",
    borderBottom: "1px solid rgba(62, 9, 148, 0.3)",
  },
  adminInfo: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    background: "rgba(62, 9, 148, 0.1)",
    padding: "1rem",
    borderRadius: "12px",
    border: "1px solid #3e0994",
  },
  adminAvatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "2px solid #3e0994",
    flexShrink: 0,
    boxShadow: "0 0 15px rgba(62, 9, 148, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
  },
  adminText: {
    flex: 1,
  },
  adminGreeting: {
    fontSize: "0.9rem",
    color: "#98cfff",
    margin: "0 0 0.2rem 0",
  },
  adminName: {
    fontSize: "1.1rem",
    fontWeight: 600,
    margin: 0,
    color: "#ffffff",
  },
  sidebarNav: {
    padding: "1.5rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem 1.5rem",
    background: "transparent",
    border: "none",
    color: "#98cfff",
    fontSize: "1rem",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    cursor: "pointer",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    textAlign: "left",
  },
  navItemActive: {
    background: "rgba(62, 9, 148, 0.2)",
    color: "#ffffff",
    borderLeft: "3px solid #3e0994",
  },
  mainContent: {
    marginLeft: "280px",
    flex: 1,
    padding: "2rem",
    overflowY: "auto",
    position: "relative",
    zIndex: 1,
    minHeight: "100vh",
    maxWidth: "calc(100vw - 280px)",
    boxSizing: "border-box",
  },
  topNav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "2rem",
    paddingBottom: "1.5rem",
    borderBottom: "1px solid rgba(62, 9, 148, 0.3)",
  },
  backBtn: {
    padding: "0.6rem 1.2rem",
    background: "rgba(75, 75, 85, 0.6)",
    color: "#ffffff",
    border: "1px solid rgba(158, 196, 255, 0.1)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 500,
    fontFamily: "'Poppins', sans-serif",
    transition: "all 0.3s ease",
  },
  navButtons: {
    display: "flex",
    gap: "0.75rem",
  },
  navButton: {
    padding: "0.6rem 1.2rem",
    background: "rgba(75, 75, 85, 0.6)",
    color: "#ffffff",
    border: "1px solid rgba(158, 196, 255, 0.1)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 500,
    fontFamily: "'Poppins', sans-serif",
    transition: "all 0.3s ease",
  },
  navButtonActive: {
    background: "linear-gradient(135deg, #3e0994 0%, #98cfff 100%)",
    borderColor: "#3e0994",
  },
  profileInfo: {
    background: "rgba(41, 41, 49, 0.7)",
    padding: "2rem",
    borderRadius: "14px",
    border: "1px solid rgba(62, 9, 148, 0.2)",
    backdropFilter: "blur(10px)",
  },
  profileName: {
    fontSize: "2rem",
    fontWeight: 800,
    color: "#ffffff",
    margin: "0 0 0.5rem 0",
    textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
  },
  profileMeta: {
    color: "#98cfff",
    fontSize: "1.1rem",
    fontWeight: 500,
    margin: "0 0 0.75rem 0",
  },
  profileContact: {
    color: "#c5d9f8",
    fontSize: "1rem",
    margin: 0,
    fontWeight: 500,
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "1.5rem",
    marginTop: "2rem",
  },
  memberCard: {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "16px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    border: "1px solid rgba(62, 9, 148, 0.2)",
    position: "relative",
    boxShadow: "0 4px 20px rgba(62, 9, 148, 0.15)",
  },
  cardHeader: {
    background: "linear-gradient(135deg, #3e0994 0%, #98cfff 100%)",
    padding: "1.5rem",
    position: "relative",
  },
  cardTitle: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#ffffff",
    textShadow: "0 1px 4px rgba(0, 0, 0, 0.3)",
  },
  cardBody: {
    padding: "1.5rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1rem",
  },
  statItem: {
    background: "rgba(26, 26, 29, 0.8)",
    padding: "1rem",
    borderRadius: "10px",
    border: "1px solid rgba(62, 9, 148, 0.15)",
    textAlign: "center",
  },
  statLabel: {
    color: "#c5d9f8",
    fontSize: "0.9rem",
    marginBottom: "0.5rem",
    fontWeight: 600,
  },
  statValue: {
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "1.25rem",
    textShadow: "0 1px 4px rgba(0, 0, 0, 0.4)",
  },
  statValueActive: {
    color: "#22c55e",
    fontWeight: 800,
    fontSize: "1.25rem",
    textShadow: "0 1px 4px rgba(0, 0, 0, 0.4)",
  },
  activityList: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  activityItem: {
    padding: "0.75rem 0",
    borderBottom: "1px solid rgba(62, 9, 148, 0.1)",
    color: "#94a3b8",
    fontSize: "0.95rem",
  },
  chartContainer: {
    height: "160px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    background: "rgba(26, 26, 29, 0.5)",
    borderRadius: "10px",
    fontSize: "0.9rem",
  },
  notesText: {
    color: "#94a3b8",
    fontSize: "0.95rem",
    lineHeight: 1.6,
    margin: 0,
  },
  mobileMenuToggle: {
    display: "none",
    position: "fixed",
    top: "1rem",
    left: "1rem",
    zIndex: 101,
    background: "linear-gradient(135deg, #3e0994 0%, #98cfff 100%)",
    border: "none",
    color: "white",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    fontSize: "1.5rem",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(62, 9, 148, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "white",
    padding: "2rem",
  },
};

const MemberDashboard = () => {
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const loggedUser = JSON.parse(localStorage.getItem("user"));

        if (!loggedUser) {
          navigate("/");
          return;
        }

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

  if (!member) {
    return <div style={styles.loadingText}>Loading dashboard...</div>;
  }

  const sidebarStyle = {
    ...styles.sidebar,
    ...(sidebarOpen ? {} : styles.sidebarClosed),
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .member-sidebar { left: -280px !important; }
          .member-sidebar.open { left: 0 !important; }
          .member-main-content { margin-left: 0 !important; padding: 1rem !important; max-width: 100vw !important; }
          .member-mobile-toggle { display: flex !important; }
          .member-dashboard-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
        }
        @media (max-width: 1024px) and (min-width: 769px) {
          .member-sidebar { width: 240px !important; }
          .member-main-content { margin-left: 240px !important; max-width: calc(100vw - 240px) !important; }
        }
        .member-nav-item:hover { background: rgba(62, 9, 148, 0.15) !important; color: #ffffff !important; }
        .member-card:hover { transform: translateY(-8px); box-shadow: 0 15px 40px rgba(62, 9, 148, 0.3) !important; }
        .member-nav-btn:hover { background: linear-gradient(135deg, #3e0994 0%, #98cfff 100%) !important; border-color: #3e0994 !important; }
        .member-activity-item:last-child { border-bottom: none !important; }
      `}</style>

      <div style={styles.videoContainer}>
        <video style={styles.video} autoPlay loop muted playsInline preload="auto">
          <source src="/videos/gym-video.mp4" type="video/mp4" />
        </video>
      </div>

      <div style={styles.videoOverlay}></div>

      <div style={styles.membersContainer}>

        <div
          className={`member-sidebar${sidebarOpen ? " open" : ""}`}
          style={sidebarStyle}
        >
          <div style={styles.sidebarHeader}>
            <div style={styles.adminInfo}>
              <div style={styles.adminAvatar}>👤</div>
              <div style={styles.adminText}>
                <p style={styles.adminGreeting}>Welcome back</p>
                <p style={styles.adminName}>{member.name}</p>
              </div>
            </div>
          </div>

          <nav style={styles.sidebarNav}>
            <button
              className="member-nav-item"
              style={{ ...styles.navItem, ...styles.navItemActive }}
            >
              📊 Dashboard
            </button>

            <button
              className="member-nav-item"
              style={styles.navItem}
              onClick={() => navigate(`/edit-profile/${member.id}`)}
            >
              ✏️ Edit Profile
            </button>

            <button className="member-nav-item" style={styles.navItem}>🏋️ Workouts</button>
            <button className="member-nav-item" style={styles.navItem}>💰 Payments</button>
            <button className="member-nav-item" style={styles.navItem}>📈 Reports</button>
          </nav>
        </div>

        {!sidebarOpen && (
          <button
            className="member-mobile-toggle"
            style={{ ...styles.mobileMenuToggle, display: "flex" }}
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
        )}

        <div className="member-main-content" style={styles.mainContent}>
          <div style={{ marginBottom: "2rem" }}>
            <div style={styles.topNav}>
              <button
                style={styles.backBtn}
                onClick={() => navigate("/")}
              >
                ← Dashboard
              </button>

              <div style={styles.navButtons}>
                <button className="member-nav-btn" style={{ ...styles.navButton, ...styles.navButtonActive }}>Dashboard</button>
                <button className="member-nav-btn" style={styles.navButton}>Settings</button>
                <button
                  className="member-nav-btn"
                  style={styles.navButton}
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

          <div style={styles.profileInfo}>
            <h1 style={styles.profileName}>{member.name}</h1>
            <p style={styles.profileMeta}>
              {member.membership || "No membership"} •{" "}
              {member.activityStatus || "No status"}
            </p>
            <p style={styles.profileContact}>
              {member.email} • {member.contact}
            </p>
          </div>

          <div className="member-dashboard-grid" style={styles.dashboardGrid}>

            <div className="member-card" style={styles.memberCard}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Overview</h3>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.statsGrid}>
                  <div style={styles.statItem}>
                    <div style={styles.statLabel}>Membership</div>
                    <div style={styles.statValue}>{member.membership || "—"}</div>
                  </div>
                  <div style={styles.statItem}>
                    <div style={styles.statLabel}>Trainer</div>
                    <div style={styles.statValue}>{member.trainer || "—"}</div>
                  </div>
                  <div style={styles.statItem}>
                    <div style={styles.statLabel}>Attendance</div>
                    <div style={styles.statValue}>{member.attendance || "—"}</div>
                  </div>
                  <div style={styles.statItem}>
                    <div style={styles.statLabel}>Status</div>
                    <div style={styles.statValueActive}>{member.activityStatus || "—"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="member-card" style={styles.memberCard}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Attendance</h3>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.chartContainer}>
                  {member.attendance || "No attendance data"}
                </div>
              </div>
            </div>

            <div className="member-card" style={styles.memberCard}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Recent Activity</h3>
              </div>
              <div style={styles.cardBody}>
                <ul style={styles.activityList}>
                  <li className="member-activity-item" style={styles.activityItem}>✅ Checked in recently</li>
                  <li className="member-activity-item" style={styles.activityItem}>💪 Workout session active</li>
                  <li className="member-activity-item" style={{ ...styles.activityItem, borderBottom: "none" }}>💳 Payment up to date</li>
                </ul>
              </div>
            </div>

            <div className="member-card" style={styles.memberCard}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Trainer Notes</h3>
              </div>
              <div style={styles.cardBody}>
                <p style={styles.notesText}>
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
