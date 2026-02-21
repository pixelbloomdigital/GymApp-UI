import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
const USERS_API = "http://localhost:3001/users";
const MEMBERSHIP_API = "http://localhost:3001/memberships";


const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const stored = localStorage.getItem('sidebarOpen');
      return stored === null ? true : JSON.parse(stored);
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    try { 
      localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen)); 
    } catch (e) {}
  }, [sidebarOpen]);

const [members, setMembers] = useState([]);
const [memberships, setMemberships] = useState([]);
useEffect(() => {
  fetchMembers();
  fetchMemberships();
}, []);

const fetchMembers = async () => {
  const res = await fetch(USERS_API);
  const data = await res.json();
  const onlyMembers = data.filter(user => user.role === "member");
  setMembers(onlyMembers);
};

const fetchMemberships = async () => {
  const res = await fetch(MEMBERSHIP_API);
  const data = await res.json();
  setMemberships(data);
};


  // Modal states
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddMembershipModal, setShowAddMembershipModal] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
  
  const showToast = (message, ms = 3500) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), ms);
  };

  // Form states
  const [newMember, setNewMember] = useState({
    name: "", mobile: "", email: "", dob: "", address: "", zone: "", membership: ""
  });

  const [newMembership, setNewMembership] = useState({
    months: "",
    price: ""
  });

  // Disable background scroll when any modal is open
  useEffect(() => {
    if (showAddMemberModal || showAddMembershipModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showAddMemberModal, showAddMembershipModal]);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm)
  );

const handleAddMember = async (e) => {
  e.preventDefault();

  const newMemberData = {
    name: newMember.name,
    email: newMember.email,
    contact: newMember.mobile,
    password: "Member@123",
    role: "member",
    membership: newMember.membership,
    status: "active",
    otp: null,
    otpExpiry: null
  };

  await fetch(USERS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newMemberData)
  });

  fetchMembers();

  setNewMember({
    name: "", mobile: "", email: "", dob: "", address: "", zone: "", membership: ""
  });

  setShowAddMemberModal(false);
  showToast(`✅ New member "${newMemberData.name}" added!`);
};


 const handleAddMembership = async (e) => {
  e.preventDefault();

  const newPlan = {
    name: `${newMembership.months} Month${parseInt(newMembership.months) > 1 ? 's' : ''} Membership`,
    price: `₹${newMembership.price}`,
    duration: parseInt(newMembership.months)
  };

  await fetch(MEMBERSHIP_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newPlan)
  });

  fetchMemberships();

  setNewMembership({ months: "", price: "" });
  setShowAddMembershipModal(false);
  showToast(`✅ Plan added successfully!`);
};


  return (
    <>
      <div className="admin-container">
        {/* Decorative Background Overlay */}
        <div className="admin-overlay"></div>

        {/* Fixed Sidebar */}
        <nav className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h1 className="sidebar-title">GYM ADMIN</h1>
            <div className="admin-info">
              <div className="admin-avatar">👨‍💼</div>
              <div className="admin-text">
                <p className="admin-greeting">Welcome Back</p>
                <p className="admin-name">Super Admin</p>
              </div>
            </div>
          </div>

          <div className="sidebar-nav">
            <button className="nav-item">
              <span>📊</span> Dashboard
            </button>
            <button className="nav-item nav-item active">
              <span>👥</span> Members
            </button>
            <button className="nav-item">
              <span>🏋️</span> Workouts
            </button>
            <button className="nav-item">
              <span>💰</span> Payments
            </button>
            <button className="nav-item">
              <span>📈</span> Reports
            </button>
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        {!sidebarOpen && (
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            ☰
          </button>
        )}

        {/* Main Content */}
        <main className="admin-main-content">
          <header className="admin-header">
            <div className="admin-header-left">
              <h1 className="admin-title">Member Management</h1>
              <p className="admin-subtitle">Manage your gym members efficiently</p>
            </div>
            <div className="admin-header-right">
              <button className="back-dashboard-btn">
                <span>←</span> Quick Stats
              </button>
            </div>
          </header>

          {/* Stats & Search Section */}
          <div className="admin-stats-section">
            <div className="members-count">
              <h2>Total Members: {filteredMembers.length}</h2>
              <span className="memberships-count">{memberships.length} Plans Available</span>
            </div>
            <div className="search-wrapper">
              <div className="search-container">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons - Clean & Simple */}
          <div className="action-buttons">
            <button 
              className="add-button primary" 
              onClick={() => setShowAddMemberModal(true)}
            >
              ➕ Add New Member
            </button>
            <button 
              className="add-button primary" 
              onClick={() => setShowAddMembershipModal(true)}
            >
              📋 Add Membership Plan
            </button>
          </div>

          {/* Members Grid - Full Focus */}
          <section className="members-grid">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <article key={member.id} className="member-card">
                  <div className="card-header">
                    <div className={`status-indicator ${member.status}`}></div>
                    <div className="card-gradient">
                      <h3 className="card-name">{member.name}</h3>
                      <p className="card-phone">{member.phone}</p>
                      {member.email && <p className="card-phone secondary">{member.email}</p>}
                      {member.membership && (
                        <p className="card-bill">{member.membership}</p>
                      )}
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="member-avatar">👤</div>
                    <div className="card-footer-info">
                      <h4 className="footer-name">{member.name}</h4>
                      <p className="footer-phone">{member.phone}</p>
                      {member.status === 'active' ? (
                        <p className="status-text active">Active Member</p>
                      ) : (
                        <p className="status-text inactive">Inactive Member</p>
                      )}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No Members Found</h3>
                <p>{searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first member'}</p>
                <button className="add-button primary" onClick={() => setShowAddMemberModal(true)}>
                  ➕ Add First Member
                </button>
              </div>
            )}
          </section>
        </main>

        {/* Add Member Modal */}
        {showAddMemberModal && (
          <div className="modal-overlay" onClick={() => setShowAddMemberModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Add New Member</h3>
                <button 
                  className="close-button" 
                  onClick={() => setShowAddMemberModal(false)}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddMember} className="modal-form">
                <div className="form-fields">
                  <div className="form-field">
                    <label className="form-label">Full Name <span className="required">*</span></label>
                    <input 
                      className="form-input" 
                      placeholder="Enter full name"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      required 
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="form-label">Mobile Number <span className="required">*</span></label>
                    <input 
                      className="form-input" 
                      placeholder="+91 9876543210"
                      value={newMember.mobile}
                      onChange={(e) => setNewMember({ ...newMember, mobile: e.target.value })}
                      required 
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="form-label">Email (Optional)</label>
                    <input 
                      className="form-input" 
                      type="email"
                      placeholder="member@example.com"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="form-label">Date of Birth</label>
                    <input 
                      className="form-input" 
                      type="date"
                      value={newMember.dob}
                      onChange={(e) => setNewMember({ ...newMember, dob: e.target.value })}
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="form-label">Membership Plan <span className="required">*</span></label>
                    <select 
                      className="form-select" 
                      value={newMember.membership}
                      onChange={(e) => setNewMember({ ...newMember, membership: e.target.value })}
                      required
                    >
                      <option value="">Select Membership Plan</option>
                      {memberships.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name} - {m.price}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="submit" className="submit-button primary">
                    ✅ Add Member
                  </button>
                  <button 
                    type="button" 
                    className="submit-button secondary" 
                    onClick={() => setShowAddMemberModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Membership Modal - SHOWS ALL EXISTING PLANS */}
        {showAddMembershipModal && (
          <div className="modal-overlay" onClick={() => setShowAddMembershipModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Membership Plans ({memberships.length})</h3>
                <button 
                  className="close-button" 
                  onClick={() => setShowAddMembershipModal(false)}
                >
                  ✕
                </button>
              </div>
              
              {/* Existing Memberships Display INSIDE Modal */}
              <div className="modal-memberships-section">
                <div className="section-header">
                  <h4 className="section-subtitle">Current Plans</h4>
                </div>
                <div className="membership-grid">
                  {memberships.map((m) => (
                    <div key={m.id} className="membership-card">
                      <div className="membership-price">{m.price}</div>
                      <div className="membership-name">{m.name}</div>
                      <div className="membership-duration">
                        {m.duration} Month{m.duration > 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Plan Form */}
              <form onSubmit={handleAddMembership} className="modal-form">
                <div className="form-fields">
                  <div className="form-field">
                    <label className="form-label">Duration (Months) <span className="required">*</span></label>
                    <input 
                      className="form-input" 
                      type="number"
                      min="1"
                      max="12"
                      placeholder="1-12"
                      value={newMembership.months}
                      onChange={(e) => setNewMembership({ ...newMembership, months: e.target.value })}
                      required
                    />
                    <small className="form-helper">Enter duration between 1-12 months</small>
                  </div>
                  
                  <div className="form-field">
                    <label className="form-label">Price (₹) <span className="required">*</span></label>
                    <input 
                      className="form-input" 
                      type="number"
                      min="500"
                      placeholder="1000"
                      value={newMembership.price}
                      onChange={(e) => setNewMembership({ ...newMembership, price: e.target.value })}
                      required
                    />
                    <small className="form-helper">Enter price without ₹ symbol</small>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button 
                    type="submit" 
                    className="submit-button primary"
                    disabled={!newMembership.months || !newMembership.price}
                  >
                    ✅ Add New Plan
                  </button>
                  <button 
                    type="button" 
                    className="submit-button secondary" 
                    onClick={() => setShowAddMembershipModal(false)}
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast.visible && (
          <div className="toast-container">
            <div className="toast success">
              <span className="toast-icon">✅</span>
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
