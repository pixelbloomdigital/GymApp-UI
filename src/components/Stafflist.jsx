import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffManagement.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Stafflist() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [staffList, setStaffList] = useState([
    {
      id: 1,
      fullname: "Gym Staff",
      username: "@staff",
      gender: "Male",
      designation: "Cashier",
      email: "staff@gmail.com",
      address: "Sample Address",
      contact: "8920812",
    },
    {
      id: 2,
      fullname: "Test Staff",
      username: "@staff2",
      gender: "Female",
      designation: "Trainer",
      email: "staff2@gmail.com",
      address: "Sample Address",
      contact: "214783547",
    },
    {
      id: 3,
      fullname: "Test Staff 2",
      username: "@staff3",
      gender: "Male",
      designation: "Trainer",
      email: "staff3@gmail.com",
      address: "Sample Address",
      contact: "214783547",
    },
    {
      id: 4,
      fullname: "Test Staff 4",
      username: "@staff4",
      gender: "Male",
      designation: "Manager",
      email: "staff4@gmail.com",
      address: "Sample Address",
      contact: "143585788",
    },
  ]);

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };

  const handleNavigateToMembers = () => {
    navigate('/members');
  };

  const handleNavigateToEquipment = () => {
    navigate('/equipment');
  };

  const handleNavigateToAnnouncements = () => {
    navigate('/announcements');
  };

  const handleNavigateToStaffEntry = () => {
    navigate('/staff-entry');
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleEdit = (staff) => {
    // Navigate to edit page with staff data
    navigate('/staff-entry', { state: { staff, mode: 'edit' } });
  };

  const handleRemove = (id) => {
    if (window.confirm("Are you sure you want to remove this staff member?")) {
      setStaffList(staffList.filter(staff => staff.id !== id));
    }
  };

  const filteredStaff = staffList.filter(
    (staff) =>
      staff.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="staff-container">
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
          <button className="nav-item" onClick={handleNavigateToMembers}>
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
          <button className="nav-item active">
            <i className="fas fa-user-tie"></i>
            <span>Staff Management</span>
          </button>
          <button className="nav-item" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header Section */}
        <div className="staff-header-section">
          <button className="back-dashboard-btn" onClick={handleNavigateToDashboard}>
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>

        {/* Page Title */}
        <div className="page-title">
          <h1>
            <i className="fas fa-briefcase"></i> Fit Nexus's Staff List
          </h1>
        </div>

        {/* Add Staff Button */}
        <div className="staff-actions">
          <button className="add-staff-btn" onClick={handleNavigateToStaffEntry}>
            <i className="fas fa-plus"></i> Add Staff Members
          </button>
        </div>

        {/* Staff Table Card */}
        <div className="staff-table-card">
          <div className="table-header">
            <h3>
              <i className="fas fa-list"></i> Staff table
            </h3>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-small"
              />
              <i className="fas fa-search search-icon"></i>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fullname</th>
                  <th>Username</th>
                  <th>Gender</th>
                  <th>Designation</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((staff, index) => (
                    <tr key={staff.id}>
                      <td>{index + 1}</td>
                      <td>{staff.fullname}</td>
                      <td className="username-cell">{staff.username}</td>
                      <td>{staff.gender}</td>
                      <td>{staff.designation}</td>
                      <td className="email-cell">{staff.email}</td>
                      <td>{staff.address}</td>
                      <td>{staff.contact}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(staff)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button
                            className="remove-btn"
                            onClick={() => handleRemove(staff.id)}
                            title="Remove"
                          >
                            <i className="fas fa-trash"></i> Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="no-data">
                      <i className="fas fa-inbox"></i>
                      <p>No staff members found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}