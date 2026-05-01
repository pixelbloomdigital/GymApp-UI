import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffManagement.css";

export default function Stafflist() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [staffList, setStaffList] = useState([
    { id:1, fullname:"Gym Staff",    username:"@staff",  gender:"Male",   designation:"Cashier",  email:"staff@gmail.com",  address:"Sample Address", contact:"8920812"   },
    { id:2, fullname:"Test Staff",   username:"@staff2", gender:"Female", designation:"Trainer",  email:"staff2@gmail.com", address:"Sample Address", contact:"214783547" },
    { id:3, fullname:"Test Staff 2", username:"@staff3", gender:"Male",   designation:"Trainer",  email:"staff3@gmail.com", address:"Sample Address", contact:"214783547" },
    { id:4, fullname:"Test Staff 4", username:"@staff4", gender:"Male",   designation:"Manager",  email:"staff4@gmail.com", address:"Sample Address", contact:"143585788" },
  ]);

  const filtered = staffList.filter(s =>
    s.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="staff-container">
      <div className="sidebar">
        <div className="sidebar-header"><h1 className="sidebar-title">MuscleFit</h1></div>
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate('/admin-dashboard')}><i className="fas fa-home" /><span>Dashboard</span></button>
          <button className="nav-item" onClick={() => navigate('/members')}><i className="fas fa-users" /><span>Members</span></button>
          <button className="nav-item" onClick={() => navigate('/equipment')}><i className="fas fa-dumbbell" /><span>Gym Equipment</span></button>
          <button className="nav-item" onClick={() => navigate('/announcements')}><i className="fas fa-bullhorn" /><span>Announcements</span></button>
          <button className="nav-item active"><i className="fas fa-user-tie" /><span>Staff Management</span></button>
          <button className="nav-item" onClick={() => { localStorage.clear(); navigate('/login'); }}><i className="fas fa-sign-out-alt" /><span>Logout</span></button>
        </nav>
      </div>

      <div className="main-content">
        <div className="staff-header-section">
          <button className="back-dashboard-btn" onClick={() => navigate('/admin-dashboard')}><i className="fas fa-arrow-left" /> Back to Dashboard</button>
        </div>
        <div className="page-title"><h1><i className="fas fa-briefcase" /> MuscleFit Staff List</h1></div>
        <div className="staff-actions">
          <button className="add-staff-btn" onClick={() => navigate('/staff-entry')}><i className="fas fa-plus" /> Add Staff Members</button>
        </div>
        <div className="staff-table-card">
          <div className="table-header">
            <h3><i className="fas fa-list" /> Staff table</h3>
            <div className="search-box">
              <input type="text" placeholder="Search staff..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="search-input-small" />
              <i className="fas fa-search search-icon" />
            </div>
          </div>
          <div className="table-wrapper">
            <table className="staff-table">
              <thead><tr><th>#</th><th>Fullname</th><th>Username</th><th>Gender</th><th>Designation</th><th>Email</th><th>Address</th><th>Contact</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td>{i+1}</td><td>{s.fullname}</td><td className="username-cell">{s.username}</td>
                    <td>{s.gender}</td><td>{s.designation}</td><td className="email-cell">{s.email}</td>
                    <td>{s.address}</td><td>{s.contact}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="edit-btn" onClick={() => navigate('/staff-entry', { state: { staff: s, mode: 'edit' } })}><i className="fas fa-edit" /> Edit</button>
                        <button className="remove-btn" onClick={() => { if(window.confirm("Remove?")) setStaffList(p => p.filter(x => x.id !== s.id)); }}><i className="fas fa-trash" /> Remove</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="9" className="no-data"><i className="fas fa-inbox" /><p>No staff members found</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
