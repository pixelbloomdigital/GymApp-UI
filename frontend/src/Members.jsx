import { useState } from "react";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

:root {
  --primary-gradient: linear-gradient(135deg, #3e0994 0%, #98cfff 100%);
  --secondary-gradient: linear-gradient(135deg, #98cfff 0%, #3e0994 100%);
  --dark-bg: #1A1A1D;
  --card-bg: #292931;
  --sidebar-bg: #1A1A1D;
  --text-light: #ffffff;
  --text-gray: #98cfff;
  --accent-blue: #3e0994;
  --accent-light-blue: #98cfff;
  --success-green: #22c55e;
  --border-color: #3e0994;
  --light-bg: linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 50%, #dce7ff 100%);
}

.members-container {
  display: flex;
  min-height: 100vh;
  background: var(--light-bg);
  font-family: 'Poppins', sans-serif;
  color: var(--text-light);
  position: relative;
}

.members-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(62, 9, 148, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(152, 207, 255, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(62, 9, 148, 0.03) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.sidebar {
  width: 280px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
  box-shadow: 4px 0 20px rgba(62, 9, 148, 0.15);
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(62, 9, 148, 0.3);
}

.sidebar-title {
  font-family: 'Poppins', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 0 0 2rem 0;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(62, 9, 148, 0.1);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.admin-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--accent-blue);
  flex-shrink: 0;
  box-shadow: 0 0 15px rgba(62, 9, 148, 0.5);
}

.admin-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.admin-text {
  flex: 1;
}

.admin-greeting {
  font-size: 0.9rem;
  color: var(--text-gray);
  margin: 0 0 0.2rem 0;
}

.admin-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-light);
}

.sidebar-nav {
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  color: var(--text-gray);
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-align: left;
  position: relative;
}

.nav-item i {
  font-size: 1.2rem;
  width: 24px;
}

.nav-item:hover {
  background: rgba(62, 9, 148, 0.15);
  color: var(--text-light);
}

.nav-item.active {
  background: rgba(62, 9, 148, 0.2);
  color: var(--text-light);
  border-left: 3px solid var(--accent-blue);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--accent-blue);
  box-shadow: 0 0 10px var(--accent-blue);
}

.main-content {
  margin-left: 280px;
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  position: relative;
  z-index: 1;
  max-width: calc(100vw - 280px);
  box-sizing: border-box;
}

.members-header-section {
  margin-bottom: 2rem;
}

.back-dashboard-btn {
  background: rgba(62, 9, 148, 0.1);
  border: 1px solid var(--border-color);
  color: var(--accent-blue);
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  font-family: 'Poppins', sans-serif;
}

.back-dashboard-btn:hover {
  background: var(--primary-gradient);
  color: var(--text-light);
  transform: translateX(-5px);
  box-shadow: 0 4px 15px rgba(62, 9, 148, 0.3);
}

.back-dashboard-btn i {
  margin-right: 0.5rem;
}

.search-section {
  margin-bottom: 2rem;
}

.search-wrapper {
  display: flex;
  gap: 1rem;
  max-width: 600px;
}

.search-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  color: #1A1A1D;
  font-size: 0.95rem;
  font-family: 'Poppins', sans-serif;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(62, 9, 148, 0.1);
}

.search-input::placeholder {
  color: #666;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-blue);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 20px rgba(62, 9, 148, 0.3);
}

.search-btn {
  background: var(--primary-gradient);
  border: none;
  color: var(--text-light);
  padding: 1rem 2rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(62, 9, 148, 0.4);
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(62, 9, 148, 0.6);
}

.members-count {
  margin-bottom: 2rem;
}

.members-count h2 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  animation: fadeInUp 0.6s ease;
  max-width: 100%;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.member-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(62, 9, 148, 0.2);
  position: relative;
  box-shadow: 0 4px 20px rgba(62, 9, 148, 0.15);
  min-width: 280px;
}

.member-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--primary-gradient);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 0;
}

.member-card:hover::before {
  opacity: 0.08;
}

.member-card:hover {
  transform: translateY(-10px) scale(1.02);
  border-color: var(--accent-blue);
  box-shadow: 0 15px 40px rgba(62, 9, 148, 0.3);
}

.card-header {
  position: relative;
  overflow: hidden;
}

.card-gradient {
  background: var(--primary-gradient);
  padding: 1.5rem;
  position: relative;
  z-index: 1;
}

.card-gradient::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-30px, -30px); }
}

.card-name {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.8rem;
  letter-spacing: 1px;
  margin: 0 0 0.3rem 0;
  color: var(--text-light);
}

.card-phone {
  font-size: 1.1rem;
  margin: 0.3rem 0;
  opacity: 0.9;
  font-weight: 500;
}

.card-bill {
  font-size: 0.95rem;
  margin: 0.5rem 0 0 0;
  opacity: 0.85;
  font-weight: 400;
}

.card-body {
  padding: 1.5rem;
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.95);
}

.status-indicator {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 10px currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-indicator.active {
  background: var(--success-green);
  box-shadow: 0 0 15px var(--success-green);
}

.status-indicator.inactive {
  background: #ff4444;
  box-shadow: 0 0 15px #ff4444;
}

.member-avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--accent-blue);
  box-shadow: 0 8px 25px rgba(62, 9, 148, 0.4);
  position: relative;
}

.member-avatar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(62, 9, 148, 0.3) 100%);
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.member-card:hover .member-avatar img {
  transform: scale(1.1);
}

.card-footer-info {
  text-align: center;
}

.footer-name {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  margin: 0 0 0.3rem 0;
  letter-spacing: 1px;
  color: #1A1A1D;
}

.footer-phone {
  font-size: 1rem;
  color: #666;
  margin: 0.3rem 0;
}

.footer-bill {
  font-size: 0.9rem;
  color: #666;
  margin: 0.5rem 0 0 0;
}

.detail-view {
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeInUp 0.6s ease;
}

.back-btn {
  background: rgba(62, 9, 148, 0.1);
  border: 1px solid var(--border-color);
  color: var(--accent-blue);
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;
  font-family: 'Poppins', sans-serif;
}

.back-btn:hover {
  background: var(--primary-gradient);
  color: var(--text-light);
  transform: translateX(-5px);
  box-shadow: 0 4px 15px rgba(62, 9, 148, 0.3);
}

.back-btn i {
  margin-right: 0.5rem;
}

.member-detail-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(220px, 300px) 1fr;
  border: 1px solid rgba(62, 9, 148, 0.2);
  box-shadow: 0 10px 40px rgba(62, 9, 148, 0.2);
  position: relative;
}

.member-detail-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: var(--primary-gradient);
}

.member-detail-left {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 244, 255, 0.95) 100%);
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid rgba(62, 9, 148, 0.2);
  position: relative;
}

.member-detail-left::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 210px;
  height: 210px;
  background: radial-gradient(circle, rgba(62, 9, 148, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 0;
}

.member-image-container {
  position: relative;
  z-index: 1;
}

.member-detail-img {
  width: 130px;
  height: 130px;
  object-fit: cover;
  border-radius: 16px;
  border: 3px solid var(--accent-blue);
  box-shadow: 0 10px 30px rgba(62, 9, 148, 0.4);
  transition: transform 0.4s ease;
}

.member-detail-img:hover {
  transform: scale(1.05) rotate(2deg);
}

.member-detail-right {
  padding: 3rem;
  background: rgba(255, 255, 255, 0.95);
}

.detail-info {
  margin-bottom: 2rem;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(62, 9, 148, 0.15);
  font-size: 1.1rem;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 700;
  min-width: 180px;
  color: #666;
  font-family: 'Poppins', sans-serif;
  letter-spacing: 1px;
  font-size: 1.2rem;
}

.info-value {
  color: #1A1A1D;
  font-weight: 500;
}

.status-toggle {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
}

.status-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 30px;
  border: 2px solid rgba(62, 9, 148, 0.2);
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

input:checked + .toggle-slider {
  background: var(--primary-gradient);
  border-color: var(--accent-blue);
}

input:checked + .toggle-slider:before {
  transform: translateX(30px);
}

.renew-btn {
  width: 100%;
  background: var(--secondary-gradient);
  border: none;
  color: var(--text-light);
  padding: 1.2rem;
  border-radius: 12px;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;
  letter-spacing: 2px;
  box-shadow: 0 8px 25px rgba(245, 87, 108, 0.4);
  margin-bottom: 2rem;
}

.renew-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(245, 87, 108, 0.6);
}

.renewal-section {
  background: rgba(62, 9, 148, 0.05);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid rgba(62, 9, 148, 0.2);
  animation: slideDown 0.4s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.renewal-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  letter-spacing: 1px;
  margin: 0 0 1.5rem 0;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.membership-select {
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid var(--border-color);
  color: #1A1A1D;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.membership-select:focus {
  outline: none;
  border-color: var(--accent-blue);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 15px rgba(62, 9, 148, 0.2);
}

.membership-select option {
  background: white;
  color: #1A1A1D;
}

.save-btn {
  width: 100%;
  background: var(--primary-gradient);
  border: none;
  color: var(--text-light);
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;
  letter-spacing: 2px;
  box-shadow: 0 6px 20px rgba(62, 9, 148, 0.4);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(62, 9, 148, 0.6);
}

.mobile-menu-toggle {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 101;
  background: var(--primary-gradient);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.5);
}

@media (max-width: 1400px) {
  .members-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 1024px) {
  .member-detail-card {
    grid-template-columns: 1fr;
  }

  .member-detail-left {
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    padding: 2rem;
  }

  .member-detail-img {
    width: 200px;
    height: 200px;
  }

  .sidebar {
    width: 240px;
  }

  .main-content {
    margin-left: 240px;
    max-width: calc(100vw - 240px);
  }

  .members-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -280px;
    transition: left 0.3s ease;
  }

  .sidebar.open {
    left: 0;
  }

  .main-content {
    margin-left: 0;
    padding: 1rem;
  }

  .members-grid {
    grid-template-columns: 1fr;
  }

  .search-wrapper {
    flex-direction: column;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .info-label {
    min-width: auto;
  }

  .member-detail-card {
    margin-top: 1rem;
  }

  .mobile-menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
`;

export default function Members() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showRenewal, setShowRenewal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("1-month");

  const handleNavigateToDashboard = () => {
    console.log("Navigate to Dashboard");
  };

  const handleLogout = () => {
    console.log("Logout");
  };

  const members = [
    {
      id: 1,
      name: "Redaju",
      phone: "3456de7890",
      address: "Laal Darwaza, Munger",
      joinedDate: "29-09-2024",
      nextBill: "29-09-2024",
      status: true,
      img: "src/assets/member1.webp"
    },
    {
      id: 2,
      name: "Vikas Kumar",
      phone: "729508651dds8",
      address: "Munger, Bihar",
      joinedDate: "15-08-2024",
      nextBill: "28-10-2024",
      status: true,
      img: "src/assets/Member2.avif"
    },
    {
      id: 3,
      name: "Vinay D",
      phone: "+91-6295086518",
      address: "Munger, Bihar",
      joinedDate: "01-10-2024",
      nextBill: "31-10-2024",
      status: true,
      img: "src/assets/Member3.jpg"
    },
    {
      id: 4,
      name: "John Doe",
      phone: "01234567890",
      address: "Munger, Bihar",
      joinedDate: "01-09-2024",
      nextBill: "30-09-2024",
      status: false,
      img: "src/assets/member4.webp"
    }
  ];

  const membershipPlans = [
    { value: "1-month", label: "1 Month Membership" },
    { value: "3-month", label: "3 Month Membership" },
    { value: "6-month", label: "6 Month Membership" },
    { value: "12-month", label: "12 Month Membership" }
  ];

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm)
  );

  const handleRenew = () => {
    setShowRenewal(true);
  };

  const handleSaveMembership = () => {
    console.log("Renewing membership:", selectedPlan);
    setShowRenewal(false);
    alert(`Membership renewed for ${selectedPlan}`);
  };

  const Sidebar = () => (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Fit Nexus</h1>
        <div className="admin-info">
          <div className="admin-avatar">
            <img src="/assets/admin-avatar.jpg" alt="Admin" />
          </div>
          <div className="admin-text">
            <p className="admin-greeting">Good Evening 👋</p>
            <p className="admin-name">admin</p>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <button className="nav-item" onClick={handleNavigateToDashboard}>
          <i className="fas fa-home"></i>
          <span>Dashboard</span>
        </button>
        <button className="nav-item active">
          <i className="fas fa-users"></i>
          <span>Members</span>
        </button>
        <button className="nav-item" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );

  if (selectedMember) {
    return (
      <>
        <style>{styles}</style>
        <div className="members-container">
          <Sidebar />
          <div className="main-content">
            <div className="detail-view">
              <button className="back-btn" onClick={() => setSelectedMember(null)}>
                <i className="fas fa-arrow-left"></i> Go Back
              </button>

              <div className="member-detail-card">
                <div className="member-detail-left">
                  <div className="member-image-container">
                    <img
                      src={selectedMember.img}
                      alt={selectedMember.name}
                      className="member-detail-img"
                    />
                  </div>
                </div>

                <div className="member-detail-right">
                  <div className="detail-info">
                    <div className="info-row">
                      <span className="info-label">Name :</span>
                      <span className="info-value">{selectedMember.name}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Mobile :</span>
                      <span className="info-value">{selectedMember.phone}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Address :</span>
                      <span className="info-value">{selectedMember.address}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Joined Date :</span>
                      <span className="info-value">{selectedMember.joinedDate}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Next Bill Date :</span>
                      <span className="info-value">{selectedMember.nextBill}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Status :</span>
                      <label className="status-toggle">
                        <input
                          type="checkbox"
                          checked={selectedMember.status}
                          readOnly
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <button className="renew-btn" onClick={handleRenew}>
                    Renew
                  </button>

                  {showRenewal && (
                    <div className="renewal-section">
                      <h3 className="renewal-title">Membership</h3>
                      <select
                        className="membership-select"
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                      >
                        {membershipPlans.map(plan => (
                          <option key={plan.value} value={plan.value}>
                            {plan.label}
                          </option>
                        ))}
                      </select>
                      <button className="save-btn" onClick={handleSaveMembership}>
                        Save
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="members-container">
        <Sidebar />
        <div className="main-content">
          <div className="members-header-section">
            <button className="back-dashboard-btn" onClick={handleNavigateToDashboard}>
              <i className="fas fa-arrow-left"></i> Back to Dashboard
            </button>
          </div>

          <div className="search-section">
            <div className="search-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search By Name or Mobile No"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-btn">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>

          <div className="members-count">
            <h2>Total Members {filteredMembers.length}</h2>
          </div>

          <div className="members-grid">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="member-card"
                onClick={() => setSelectedMember(member)}
              >
                <div className="card-header">
                  <div className="card-gradient">
                    <h3 className="card-name">{member.name}</h3>
                    <p className="card-phone">{member.phone}</p>
                    <p className="card-bill">Next Bill Date : {member.nextBill}</p>
                  </div>
                </div>

                <div className="card-body">
                  <div className={`status-indicator ${member.status ? 'active' : 'inactive'}`}></div>
                  <div className="member-avatar">
                    <img src={member.img} alt={member.name} />
                  </div>
                  <div className="card-footer-info">
                    <p className="footer-name">{member.name}</p>
                    <p className="footer-phone">{member.phone}</p>
                    <p className="footer-bill">Next Bill Date : {member.nextBill}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
