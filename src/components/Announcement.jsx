import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnnouncements } from "../contexts/AnnouncementContext";
import "./Announcement.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Announcement() {
  const navigate = useNavigate();
  const { announcements, addAnnouncement, deleteAnnouncement, togglePublish } = useAnnouncements();
  
  const [showForm, setShowForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    message: "",
    date: "",
  });

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
    console.log("Navigate to Dashboard");
  };

  const handleNavigateToMembers = () => {
    navigate('/members');
    console.log("Navigate to Members");
  };

  const handleNavigateToEquipment = () => {
    navigate('/equipment');
    console.log("Navigate to Equipment");
  };

   const handleNavigateToStaffList = () =>{
    navigate('/staff-list')
  };

  const handleLogout = () => {
    console.log("Logout");
    navigate('/');
  };

  const handlePublish = () => {
    if (!newAnnouncement.message.trim() || !newAnnouncement.date) {
      alert("Please fill in all fields");
      return;
    }

    addAnnouncement({
      date: newAnnouncement.date,
      message: newAnnouncement.message,
      published: true,
    });

    setNewAnnouncement({ message: "", date: "" });
    setShowForm(false);
  };

  const handleRemove = (id) => {
    if (window.confirm("Are you sure you want to remove this announcement?")) {
      deleteAnnouncement(id);
    }
  };

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
          <button className="nav-item" onClick={handleNavigateToMembers}>
            <i className="fas fa-users"></i>
            <span>Members</span>
          </button>
          <button className="nav-item" onClick={handleNavigateToEquipment}>
            <i className="fas fa-dumbbell"></i>
            <span>Gym Equipment</span>
          </button>
          <button className="nav-item active">
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

      {/* Main Content */}
      <div className="main-content">
        <div className="announcement-page">
          <div className="members-header-section">
            <button className="back-dashboard-btn" onClick={handleNavigateToDashboard}>
              <i className="fas fa-arrow-left"></i> Back to Dashboard
            </button>
          </div>

          <div className="announcement-header">
            <h1>
              <i className="fas fa-bullhorn"></i> Announcement
            </h1>
          </div>

          <div className="announcement-actions">
            <button
              className="manage-announcement-btn"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancel" : "Manage Your Announcements"}
            </button>
          </div>

          {showForm && (
            <div className="announcement-form-card">
              <h3>
                <i className="fas fa-plus-circle"></i> Make Announcements
              </h3>
              <div className="form-group">
                <label>Enter text</label>
                <textarea
                  placeholder="Enter announcement text..."
                  value={newAnnouncement.message}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, message: e.target.value })
                  }
                  rows="6"
                />
              </div>
              <div className="form-group">
                <label>Applied Date:</label>
                <input
                  type="date"
                  value={newAnnouncement.date}
                  onChange={(e) =>
                    setNewAnnouncement({ ...newAnnouncement, date: e.target.value })
                  }
                />
              </div>
              <button className="publish-btn" onClick={handlePublish}>
                Publish Now
              </button>
            </div>
          )}

          <div className="announcement-table-card">
            <h3>
              <i className="fas fa-list"></i> Announcement table
            </h3>
            <table className="announcement-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((announcement, index) => (
                  <tr key={announcement.id}>
                    <td>{index + 1}</td>
                    <td>{announcement.date}</td>
                    <td className="message-cell">{announcement.message}</td>
                    <td>
                      <button
                        className={`status-toggle ${
                          announcement.published ? "published" : "draft"
                        }`}
                        onClick={() => togglePublish(announcement.id)}
                      >
                        {announcement.published ? (
                          <>
                            <i className="fas fa-check-circle"></i> Published
                          </>
                        ) : (
                          <>
                            <i className="fas fa-clock"></i> Draft
                          </>
                        )}
                      </button>
                    </td>
                    <td>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemove(announcement.id)}
                      >
                        <i className="fas fa-trash"></i> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}