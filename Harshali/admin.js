import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import Members from "./Members";
import Logout from "./Logout";
import { AdminPayments } from "./Payment";
import { FinanceManagement } from "./Finance";

// Dashboard component
function Dashboard({ activeCard, setActiveCard, activePage, setActivePage }) {
  const cards = [
    { icon: "fa-user-group", text: "Joined Members", color: "wine", page: "joined" },
    { icon: "fa-chart-bar", text: "Monthly Joined", color: "wine", page: "monthly" },
    { icon: "fa-clock", text: "Expiring within 3 days", color: "wine", page: "exp3" },
    { icon: "fa-clock", text: "Expiring within 4–7 days", color: "wine", page: "exp7" },
    { icon: "fa-exclamation-circle", text: "Expired", color: "wine", page: "expired" },
    { icon: "fa-user-slash", text: "Inactive Members", color: "gray", page: "inactive" }
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

  const JoinedMembers = () => (
    <PageWrapper title="Joined Members">
      <p>Total Members: 120</p>
      <p>New Today: 5</p>
    </PageWrapper>
  );

  const MonthlyJoined = () => (
    <PageWrapper title="Monthly Joined">
      <p>January: 32</p>
      <p>February: 28</p>
    </PageWrapper>
  );

  const Expiring3 = () => (
    <PageWrapper title="Expiring in 3 Days">
      <p>Rahul — 2 days left</p>
      <p>Sneha — 3 days left</p>
    </PageWrapper>
  );

  const Expiring7 = () => (
    <PageWrapper title="Expiring in 4–7 Days">
      <p>Amit — 6 days left</p>
    </PageWrapper>
  );

  const Expired = () => (
    <PageWrapper title="Expired Members">
      <p>Rohit — Expired yesterday</p>
    </PageWrapper>
  );

  const Inactive = () => (
    <PageWrapper title="Inactive Members">
      <p>Pooja — Not visited for 30 days</p>
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
              <h1 className="gradient-text">Power Zone Dashboard</h1>
              <p>Manage members, track activity & monitor gym performance</p>
            </div>
          </div>

          <div className="cards">
            {cards.map((card, index) => (
              <div
                key={index}
                className={`card card-${card.color} ${activeCard === index ? "active-card" : ""}`}
                onClick={() => {
                  setActiveCard(index);
                  setActivePage(card.page);
                }}
              >
                <i className={`fas ${card.icon} icon-${card.color}`}></i>
                <p>{card.text}</p>
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

// Sidebar component
function Sidebar({ sidebarCollapsed, setSidebarCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: "fa-home", route: "/admin" },
    { name: "Members", icon: "fa-users", route: "/admin/members" },
    { name: "Payments", icon: "fa-credit-card", route: "/admin/payments" },
    { name: "Finance", icon: "fa-chart-line", route: "/admin/finance" },
    { name: "Logout", icon: "fa-right-from-bracket", route: "/admin/logout" }
  ];

  return (
    <aside className={`sidebar ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className="profile sidebar-text">
        <img src="/assets/th.webp" alt="Admin" />
        <div>
          <p className="greet">Good Evening</p>
          <p className="admin-name">Admin</p>
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

export default function AdminDashboard() {
  const [activeCard, setActiveCard] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState(null);

  return (
    <div className="app-container">
      <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />

      <main className="main-content">
        <div className="topbar">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <i className="fas fa-bars"></i>
          </button>
        </div>

        <Routes>
          <Route path="/" element={<Dashboard activeCard={activeCard} setActiveCard={setActiveCard} activePage={activePage} setActivePage={setActivePage} />} />
          <Route path="/members" element={<Members />} />
          <Route path="/payments" element={<AdminPayments />} />
          <Route path="/finance" element={<FinanceManagement />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </main>
    </div>
  );
}
