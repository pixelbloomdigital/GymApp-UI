import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { UserPayment } from "./Payment";
import { UserMembership } from "./Membership";
import { useProfile } from "./ProfileContext";

function UserHome({ activePage, setActivePage }) {
  const cards = [
    { icon: "fa-id-card", title: "Membership Status", color: "wine", page: "membership" },
    { icon: "fa-calendar-check", title: "Next Session", color: "wine", page: "session" },
    { icon: "fa-dumbbell", title: "Workout Progress", color: "wine", page: "workout" },
    { icon: "fa-bullseye", title: "Fitness Goal", color: "wine", page: "goal" }
  ];

  const PageWrapper = ({ title, children }) => (
    <div className="page-view">
      <div className="page-header">
        <h2>{title}</h2>
        <button className="home-btn" onClick={() => setActivePage(null)}>
          <i className="fas fa-home"></i> Home
        </button>
      </div>
      <div className="page-content">{children}</div>
    </div>
  );

  const MembershipStatus = () => {
    const { profile } = useProfile();
    return (
      <PageWrapper title="Membership Status">
        <p>Status: {profile.membership}</p>
        <p>Plan: {profile.plan}</p>
        {profile.planExpiry && <p>Expires: {profile.planExpiry}</p>}
      </PageWrapper>
    );
  };

  const NextSession = () => (
    <PageWrapper title="Next Session">
      <p>Date: Tomorrow</p>
      <p>Time: 6:00 AM</p>
      <p>Trainer: John Doe</p>
    </PageWrapper>
  );

  const WorkoutProgress = () => (
    <PageWrapper title="Workout Progress">
      <p>Today: Chest Day Completed ✓</p>
      <p>This Week: 4/6 sessions done</p>
      <p>Calories Burned: 2,400 kcal</p>
    </PageWrapper>
  );

  const FitnessGoal = () => (
    <PageWrapper title="Fitness Goal">
      <p>Target: Lose 3kg</p>
      <p>Progress: 1.5kg lost</p>
      <p>Remaining: 1.5kg</p>
    </PageWrapper>
  );

  return (
    <div>
      {!activePage && (
        <>
          <div className="hero">
            <img src="/assets/gym.jpeg" alt="Gym" />
            <div className="overlay"></div>
            <div className="hero-text">
              <h1 className="gradient-text">My Fitness Dashboard</h1>
              <p>Track your progress & achieve your goals</p>
            </div>
          </div>

          <div className="cards">
            {cards.map((card, index) => (
              <div
                key={index}
                className={`card card-${card.color}`}
                onClick={() => setActivePage(card.page)}
              >
                <i className={`fas ${card.icon} icon-${card.color}`}></i>
                <p>{card.title}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {activePage === "membership" && <MembershipStatus />}
      {activePage === "session" && <NextSession />}
      {activePage === "workout" && <WorkoutProgress />}
      {activePage === "goal" && <FitnessGoal />}
    </div>
  );
}

function ProfilePage() {
  const { profile, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone
    });
    setIsEditing(false);
  };

  return (
    <div className="page-view">
      <div className="page-header">
        <h2>My Profile</h2>
        {!isEditing && (
          <button className="add-member-btn" onClick={() => setIsEditing(true)}>
            <i className="fas fa-edit"></i> Edit Profile
          </button>
        )}
      </div>
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <img 
            src={profile.profileImage} 
            alt="Profile" 
            style={{ 
              width: "150px", 
              height: "150px", 
              borderRadius: "50%", 
              border: "3px solid #3e0994",
              objectFit: "cover"
            }} 
          />
          <label 
            htmlFor="upload-photo" 
            style={{
              position: "absolute",
              bottom: "5px",
              right: "5px",
              background: "#3e0994",
              color: "white",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
            }}
          >
            <i className="fas fa-camera"></i>
          </label>
          <input 
            id="upload-photo" 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </div>
      </div>
      <div style={{ marginTop: "2rem", maxWidth: "400px", margin: "2rem auto" }}>
        {!isEditing ? (
          <>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Phone:</strong> {profile.phone}</p>
            <p><strong>Membership:</strong> {profile.membership}</p>
            <p><strong>Plan:</strong> {profile.plan}</p>
            {profile.planExpiry && <p><strong>Expires:</strong> {profile.planExpiry}</p>}
          </>
        ) : (
          <>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Name</label>
              <input
                className="login-input"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Email</label>
              <input
                className="login-input"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Phone</label>
              <input
                className="login-input"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="login-btn" onClick={handleSave} style={{ flex: 1 }}>
                <i className="fas fa-save"></i> Save
              </button>
              <button className="home-btn" onClick={handleCancel} style={{ flex: 1 }}>
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function UserSidebar({ sidebarCollapsed, setSidebarCollapsed }) {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: "fa-home", route: "/user" },
    { name: "Profile", icon: "fa-user", route: "/user/profile" },
    { name: "Membership", icon: "fa-id-card", route: "/user/membership" },
    { name: "Payment", icon: "fa-credit-card", route: "/user/payment" },
    { name: "Logout", icon: "fa-right-from-bracket", route: "/" }
  ];

  return (
    <aside className={`sidebar ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className="profile sidebar-text">
        <img src={profile.profileImage} alt="User" />
        <div>
          <p className="greet">Welcome</p>
          <p className="admin-name">{profile.name}</p>
        </div>
      </div>

      <nav>
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`menu-btn ${location.pathname === item.route ? "active-menu" : ""}`}
            onClick={() => navigate(item.route)}
          >
            <i className={`fas ${item.icon}`}></i>
            <span className="sidebar-text">{item.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default function UserDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState(null);

  return (
    <div className="app-container">
      <UserSidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />

      <main className="main-content">
        <div className="topbar">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <i className="fas fa-bars"></i>
          </button>
        </div>

        <Routes>
          <Route path="/" element={<UserHome activePage={activePage} setActivePage={setActivePage} />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/membership" element={<UserMembership />} />
          <Route path="/payment" element={<UserPayment />} />
        </Routes>
      </main>
    </div>
  );
}
