import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { UserPayment } from "./Payment.jsx";
import { UserMembership } from "./Membership";
import { useProfile } from "./ProfileContext";
import { getMember, getMemberMemberships, getMonthlyAttendance } from "./api/coreService";

function DietPlanPage() {
  const memberId = localStorage.getItem('memberId') || localStorage.getItem('id');
  const navigate = useNavigate();
  return (
    <div className="page-view">
      <div className="page-header">
        <h2>Diet Plan</h2>
      </div>
      <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
        Get a personalized diet plan tailored to your fitness goals.
      </p>
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          className="add-member-btn"
          onClick={() => navigate(memberId ? `/edit-profile/${memberId}` : '/member-dashboard/profile')}
        >
          <i className="fas fa-apple-alt"></i> Create / View Diet Plan
        </button>
      </div>
    </div>
  );
}

function UserHome() {
  const navigate = useNavigate();
  const memberId = localStorage.getItem('memberId') || localStorage.getItem('id');
  const [membership, setMembership] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const now = new Date();

  useEffect(() => {
    if (!memberId) return;
    const ym = now.toISOString().slice(0, 7);
    import('./api/coreService').then(({ getMemberMemberships, getMonthlyAttendance }) => {
      getMemberMemberships(memberId).then(r => {
        const active = (r.data || []).find(m => m.status === 'ACTIVE') || r.data?.[0];
        setMembership(active);
      }).catch(() => {});
      getMonthlyAttendance(memberId, ym).then(r => setAttendance(r.data)).catch(() => {});
    });
  }, [memberId]);

  const cards = [
    { icon: "fa-id-card",        title: "Membership",      color: "wine", route: "/member-dashboard/membership" },
    { icon: "fa-calendar-check", title: "Attendance",      color: "wine", route: "/attendance-list" },
    { icon: "fa-chart-bar",      title: "My Reports",      color: "wine", route: "/member-reports" },
    { icon: "fa-user-edit",      title: "Edit Profile",    color: "wine", route: "/member-dashboard/profile" },
  ];

  return (
    <div>
      {/* Stats bar */}
      {(membership || attendance) && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"1rem", marginBottom:"1.5rem" }}>
          {membership && (
            <>
              <div className="card card-wine" style={{ cursor:"default", textAlign:"center" }}>
                <i className="fas fa-id-card icon-wine" />
                <p style={{ fontWeight:700, margin:"0.25rem 0 0" }}>{membership.planName || "Active"}</p>
                <p style={{ fontSize:"0.78rem", color:"#94a3b8", margin:0 }}>
                  Expires: {membership.endDate ? new Date(membership.endDate).toLocaleDateString('en-IN') : "—"}
                </p>
              </div>
              <div className="card card-wine" style={{ cursor:"default", textAlign:"center" }}>
                <i className="fas fa-clock icon-wine" />
                <p style={{ fontWeight:700, margin:"0.25rem 0 0" }}>{membership.daysRemaining ?? "—"} days</p>
                <p style={{ fontSize:"0.78rem", color:"#94a3b8", margin:0 }}>Remaining</p>
              </div>
            </>
          )}
          {attendance && (
            <>
              <div className="card card-wine" style={{ cursor:"default", textAlign:"center" }}>
                <i className="fas fa-calendar-check icon-wine" />
                <p style={{ fontWeight:700, margin:"0.25rem 0 0" }}>{attendance.presentDays ?? "—"}</p>
                <p style={{ fontSize:"0.78rem", color:"#94a3b8", margin:0 }}>Present this month</p>
              </div>
              <div className="card card-wine" style={{ cursor:"default", textAlign:"center" }}>
                <i className="fas fa-percent icon-wine" />
                <p style={{ fontWeight:700, margin:"0.25rem 0 0" }}>{attendance.attendancePercent ?? "—"}%</p>
                <p style={{ fontSize:"0.78rem", color:"#94a3b8", margin:0 }}>Attendance rate</p>
              </div>
            </>
          )}
        </div>
      )}

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
          <div key={index} className={`card card-${card.color}`} onClick={() => navigate(card.route)}>
            <i className={`fas ${card.icon} icon-${card.color}`}></i>
            <p>{card.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePage() {
  const { profile, updateProfile } = useProfile();
  const memberId = localStorage.getItem('memberId') || localStorage.getItem('id');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name:  localStorage.getItem('name')  || profile.name,
    email: localStorage.getItem('email') || profile.email,
    phone: profile.phone
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { updateProfile({ profileImage: reader.result }); };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { updateMember } = await import('./api/coreService');
      if (memberId) await updateMember(memberId, { name: formData.name, phone: formData.phone });
      updateProfile(formData);
      localStorage.setItem('name', formData.name);
      setIsEditing(false);
    } catch (e) {
      updateProfile(formData);
      setIsEditing(false);
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    setFormData({ name: localStorage.getItem('name') || profile.name, email: localStorage.getItem('email') || profile.email, phone: profile.phone });
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
              <button className="login-btn" onClick={handleSave} style={{ flex: 1 }} disabled={saving}>
                <i className={`fas ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> {saving ? 'Saving…' : 'Save'}
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
  const name  = localStorage.getItem('name')  || profile.name;
  const email = localStorage.getItem('email') || profile.email;

  const menuItems = [
    { name: "Dashboard",    icon: "fa-home",           route: "/member-dashboard" },
    { name: "Profile",      icon: "fa-user",           route: "/member-dashboard/profile" },
    { name: "Membership",   icon: "fa-id-card",        route: "/member-dashboard/membership" },
    { name: "Payment",      icon: "fa-credit-card",    route: "/member-dashboard/payment" },
    { name: "Attendance",   icon: "fa-calendar-check", route: "/attendance-list" },
    { name: "Reports",      icon: "fa-chart-bar",      route: "/member-reports" },
    { name: "Diet Plan",    icon: "fa-apple-alt",      route: "/member-dashboard/diet" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className="profile sidebar-text">
        <img src={profile.profileImage} alt="User" />
        <div>
          <p className="greet">Welcome</p>
          <p className="admin-name">{name}</p>
          <p style={{ fontSize: '0.75rem', color: '#98cfff', margin: 0 }}>{email}</p>
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
        <button className="menu-btn" onClick={handleLogout}>
          <i className="fas fa-right-from-bracket"></i>
          <span className="sidebar-text">Logout</span>
        </button>
      </nav>
    </aside>
  );
}

export default function UserDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
          <Route path="/" element={<UserHome />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/membership" element={<UserMembership />} />
          <Route path="/payment" element={<UserPayment />} />
          <Route path="/diet" element={<DietPlanPage />} />
        </Routes>
      </main>
    </div>
  );
}
