import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import Members from "./MembersAdmin.jsx";
import Logout from "./Logout";
import { AdminPayments } from "./Payment.jsx";
import { FinanceManagement } from "./Finance.jsx";

// ================= DASHBOARD =================
function Dashboard({ activeCard, setActiveCard, activePage, setActivePage }) {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/api/visitors', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => { setVisitors(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const today          = new Date();
  const currentMonth   = today.getMonth();
  const totalMembers   = visitors.length;
  const activeMembers  = visitors.filter(m => m.role === 'VISITOR' || m.role === 'MEMBER').length;

  const monthlyJoinedCount = visitors.filter(m => {
    if (!m.visitDate) return false;
    const d = Array.isArray(m.visitDate)
      ? new Date(m.visitDate[0], m.visitDate[1] - 1, m.visitDate[2])
      : new Date(m.visitDate);
    return !isNaN(d) && d.getMonth() === currentMonth;
  }).length;

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

  // ================= PAGES =================
  const JoinedMembers = () => (
    <PageWrapper title="Visitors / Members">
      {loading ? <p>Loading...</p> : (
        <>
          <p>Total Visitors: {totalMembers}</p>
          <p>Active: {activeMembers}</p>
          {visitors.map(m => (
            <p key={m.visitorId}>{m.name} — {m.email} — {m.phone} — {m.role}</p>
          ))}
        </>
      )}
    </PageWrapper>
  );

  const MonthlyJoined = () => (
    <PageWrapper title="Monthly Joined">
      <p>Visitors Joined This Month: {monthlyJoinedCount}</p>
    </PageWrapper>
  );

  const Expiring3  = () => <PageWrapper title="Expiring in 3 Days"><p>No expiry data available from visitor API.</p></PageWrapper>;
  const Expiring7  = () => <PageWrapper title="Expiring in 4–7 Days"><p>No expiry data available from visitor API.</p></PageWrapper>;
  const Expired    = () => <PageWrapper title="Expired Members"><p>No expiry data available from visitor API.</p></PageWrapper>;
  const Inactive   = () => <PageWrapper title="Inactive Members"><p>No inactive data available from visitor API.</p></PageWrapper>;
  const cards = [
    { icon: "fa-user-group",       text: "Total Visitors",     value: totalMembers,       page: "joined"  },
    { icon: "fa-user-check",       text: "Active",             value: activeMembers,      page: "joined"  },
    { icon: "fa-chart-bar",        text: "Monthly Joined",     value: monthlyJoinedCount, page: "monthly" },
    { icon: "fa-clock",            text: "Expiring (3 Days)",  value: 0,                  page: "exp3"    },
    { icon: "fa-clock",            text: "Expiring (4-7 Days)",value: 0,                  page: "exp7"    },
    { icon: "fa-exclamation-circle",text: "Expired",           value: 0,                  page: "expired" },
    { icon: "fa-user-slash",       text: "Inactive",           value: 0,                  page: "inactive"}
  ];
  // ================= MAIN RETURN =================
  return (
    <div>
      {!activePage && (
        <>
          <div className="hero">
            <img src="/assets/gym.jpeg" alt="Gym" />
            <div className="overlay"></div>
            <div className="hero-text">
              <h1 className="gradient-text">Power Zone Dashboard</h1>
              <p>Manage members, track activity & monitor gym performance</p>
            </div>
          </div>

          <div className="cards">
            {cards.map((card, index) => (
              <div
                key={index}
                className={`card ${activeCard === index ? "active-card" : ""}`}
                onClick={() => {
                  setActiveCard(index);
                  setActivePage(card.page);
                }}
              >
                <i className={`fas ${card.icon}`}></i>
                <h2 className="card-value">{card.value}</h2>   
                <p className="card-text">{card.text}</p>    
              </div>
            ))}
          </div>
        </>
      )}

      {activePage === "joined" && <JoinedMembers />}
      {activePage === "monthly" && <MonthlyJoined />}
      {activePage === "exp3" && <Expiring3 />}
      {activePage === "exp7" && <Expiring7 />}
      {activePage === "expired" && <Expired />}
      {activePage === "inactive" && <Inactive />}
    </div>
  );
}

// ================= SIDEBAR =================
function Sidebar({ sidebarCollapsed, setSidebarCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: "fa-home", route: "/admin-dashboard" },
    { name: "Members", icon: "fa-users", route: "/admin-dashboard/members" },
    { name: "Payments", icon: "fa-credit-card", route: "/admin-dashboard/payments" },
    { name: "Finance", icon: "fa-chart-line", route: "/admin-dashboard/finance" },
    { name: "Logout", icon: "fa-right-from-bracket", route: "/admin-dashboard/logout" }
  ];

 return (
  <aside className={`sidebar ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
    {!sidebarCollapsed ? (
      <div className="profile">
        <div className="profile-left">
          <img src="/assets/th.webp" alt="Admin" />
          <div>
            <p className="greet">Welcome</p>
            <p className="admin-name">Admin</p>
          </div>
        </div>

        <button
          className="menu-toggle"
          onClick={() => setSidebarCollapsed(true)}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>
    ) : (
      <div className="collapsed-header">
        <button
          className="menu-toggle"
          onClick={() => setSidebarCollapsed(false)}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>
    )}

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
// ================= MAIN ADMIN =================
export default function AdminDashboard(){
  const [activeCard, setActiveCard] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState(null);

  return (
    <div className="app-container">
      <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={
            <Dashboard
              activeCard={activeCard}
              setActiveCard={setActiveCard}
              activePage={activePage}
              setActivePage={setActivePage}
            />
          } />
          <Route path="/members" element={<Members />} />
          <Route path="/payments" element={<AdminPayments />} />
          <Route path="/finance" element={<FinanceManagement />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </main>
    </div>
  );
}