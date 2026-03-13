import React, { useState, useEffect } from 'react';
import './MemberReports.css';

// ✅ MonthlyReportModal COMPONENT (KEEP SAME)
const MonthlyReportModal = ({ member, monthlyReports = [], onClose }) => {
  const safeMember = member || {};
  const safeStatus = safeMember.membershipStatus || 'Unknown';
  const memberReport = monthlyReports?.find(r => r.memberId === safeMember.id) || null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* HEADER */}
        <div className="modal-header">
          <div className="modal-title-section">
            <h1 className="modal-title">{safeMember.name || 'Unknown'}</h1>
            <p className="modal-subtitle">February 2026 Report</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* ALL OTHER MODAL CONTENT REMAINS SAME */}
        <div className="profile-card">
          <div className="avatar-large">
            {(safeMember.name || '').charAt(0)?.toUpperCase() || 'M'}
          </div>
          <div className="profile-details">
            <h2>{safeMember.name || 'N/A'}</h2>
            <div className="profile-meta">
              <span className="meta-item"><strong>ID:</strong> {safeMember.id || 'N/A'}</span>
              <span className="meta-item"><strong>Trainer:</strong> {safeMember.trainer || 'N/A'}</span>
              <span className="meta-item">
                <strong>Status:</strong> 
                <span className={`status-badge status-${(safeMember.membershipStatus || 'Expired').toLowerCase()}`}>
                  {safeMember.membershipStatus || 'Expired'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* METRICS - SIMPLIFIED */}
        <div className="metrics-dashboard">
          <div className="metric-card attendance-metric">
            <h3>📊 Attendance</h3>
            <div className="metric-value">{safeMember.attendance || 'N/A'}</div>
            <div className="metric-subtext">
              {safeMember.totalAttendanceDays || 0}/{safeMember.totalPossibleDays || 0} days
            </div>
          </div>
          <div className="metric-card weight-metric">
            <h3>⚖️ Weight</h3>
            <div className="metric-value">{(safeMember.currentWeight || 0)}kg</div>
            <div className="metric-subtext">Target: {(safeMember.targetWeight || 0)}kg</div>
          </div>
          <div className="metric-card height-metric">
            <h3>📏 Height</h3>
            <div className="metric-value">{(safeMember.height || 0)}cm</div>
          </div>
          <div className="metric-card fat-metric">
            <h3>💪 Body Fat</h3>
            <div className="metric-value">{safeMember.bodyFat || 'N/A'}</div>
          </div>
        </div>

        {/* MONTHLY REPORT */}
        {memberReport && (
          <div className="monthly-report-section">
            <h3>📈 February 2026 Summary</h3>
            <div className="report-grid">
              <div className="report-item"><span>Attendance:</span><span>{memberReport.attendancePercentage}</span></div>
              <div className="report-item"><span>Weight:</span><span>{memberReport.currentWeight}kg</span></div>
              <div className="report-item"><span>Payment:</span><span>{memberReport.paymentStatus}</span></div>
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="report-actions">
          <button className="download-btn">📥 View Full Report</button>
          <button className="share-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const MemberReports = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [monthlyReports, setMonthlyReports] = useState([]);
  const MEMBERS_PER_PAGE = 10;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSearchMembers();
  }, [searchTerm, filterStatus, members]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch members
      const usersRes = await fetch('http://localhost:3001/users');
      const users = await usersRes.json();
      const membersOnly = users.filter(user => user.role === 'member');

      // Fetch memberships
      const membershipsRes = await fetch('http://localhost:3001/memberships');
      const memberships = await membershipsRes.json();

      // Fetch monthly reports
      const reportsRes = await fetch('http://localhost:3001/monthlyReports');
      const monthlyReportsData = await reportsRes.json();

      // Enrich members with membership names
      const enrichedMembers = membersOnly.map(member => ({
        ...member,
        plan: memberships.find(m => m.id === member.membershipId)?.name || 'Unknown'
      }));

      setMembers(enrichedMembers);
      setFilteredMembers(enrichedMembers);
      setMonthlyReports(monthlyReportsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSearchMembers = () => {
    let filtered = [...members];
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.contact?.includes(searchTerm)
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(member => 
        (member.membershipStatus || 'Expired') === filterStatus
      );
    }
    setFilteredMembers(filtered);
    setCurrentPage(1);
  };

  const handleViewReport = (member) => {
    setSelectedMember(member);
    setShowReportModal(true);
  };

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * MEMBERS_PER_PAGE,
    currentPage * MEMBERS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="member-reports-loading">
        <div className="spinner"></div>
        <p>Loading member reports...</p>
      </div>
    );
  }

  return (
    <div className="member-reports-container">
      <div className="reports-header">
        <h1>Member Monthly Reports</h1>
        <div className="header-stats">
          <span>Total Members: {members.length}</span>
          <span>Reports: {monthlyReports.length}</span>
        </div>
      </div>

      <div className="search-filter-section">
        <input
          type="text"
          placeholder="Search members by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
        </select>
      </div>

      <div className="members-table-container">
        <table className="members-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Plan</th>
              <th>Attendance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMembers.length > 0 ? (
              paginatedMembers.map((member) => (
                <tr key={member.id}>
                  <td>{member.id}</td>
                  <td>{member.name}</td>
                  <td>{member.plan}</td>
                  <td>{member.attendance || 'N/A'}</td>
                  <td>
                    <span className={`status-badge status-${(member.membershipStatus || 'Expired').toLowerCase()}`}>
                      {member.membershipStatus || 'Expired'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="view-report-btn" 
                      onClick={() => handleViewReport(member)}
                    >
                      📊 View Report
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No members found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <button 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p-1)}
          className="pagination-btn"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {Math.ceil(filteredMembers.length / MEMBERS_PER_PAGE)}
        </span>
        <button 
          disabled={currentPage === Math.ceil(filteredMembers.length / MEMBERS_PER_PAGE)}
          onClick={() => setCurrentPage(p => p+1)}
          className="pagination-btn"
        >
          Next
        </button>
      </div>

      {showReportModal && selectedMember && (
        <MonthlyReportModal 
          member={selectedMember} 
          monthlyReports={monthlyReports}
          onClose={() => setShowReportModal(false)} 
        />
      )}
    </div>
  );
};

export default MemberReports;
