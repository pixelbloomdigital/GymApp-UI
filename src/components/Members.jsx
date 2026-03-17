import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Members.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Members() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };

  const handleNavigateToAnnouncements = () => {
    navigate('/announcements');
  };

  const handleNavigateToEquipment = () => {
    navigate('/equipment');
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleNavigateToStaffList = () =>{
    navigate('/staff-list')
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

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm)
  );

  
  const handleRenew = () => {
    navigate('/membership-purchase', { 
      state: { member: selectedMember } 
    });
  };

  
  if (selectedMember) {
    return (
      <div className="members-container">
        {/* Sidebar */}
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
            <button className="nav-item" onClick={handleNavigateToEquipment}>
              <i className="fas fa-dumbbell"></i>
              <span>Gym Equipment</span>
            </button>
            <button className="nav-item" onClick={handleNavigateToAnnouncements}>
              <i className="fas fa-bullhorn"></i>
              <span>Announcements</span>
            </button>
            <button className="nav-item" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </button>
          </nav>
        </div>

     
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

                {/* Renew button - redirects to membership purchase page */}
                <button className="renew-btn" onClick={handleRenew}>
                  <i className="fas fa-sync-alt"></i> Renew Membership
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

 
  return (
    <div className="members-container">
      {/* Sidebar */}
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
          <button className="nav-item" onClick={handleNavigateToEquipment}>
            <i className="fas fa-dumbbell"></i>
            <span>Gym Equipment</span>
          </button>
          <button className="nav-item" onClick={handleNavigateToAnnouncements}>
            <i className="fas fa-bullhorn"></i>
            <span>Announcements</span>
          </button>
          <button className="nav-item" onClick={handleNavigateToStaffList}>
             <i className="fas fa-user-tie"></i>
            <span>Staff Management</span>
          </button>
          <button className="nav-item" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </nav>
      </div>
      
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
  );
}