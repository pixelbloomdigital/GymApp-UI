import React, { useState, useEffect } from 'react';

const styles = `
.member-reports-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.reports-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #64748b;
}

.search-filter-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  max-width: 500px;
}

.search-input, .filter-select {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
}

.search-input:focus, .filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.members-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.members-table th {
  background: linear-gradient(135deg, #3b82f6, #1e40af) !important;
  color: white !important;
  padding: 1.2rem 1rem !important;
  text-align: left !important;
  font-weight: 600 !important;
  font-size: 1rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
}

.members-table td {
  padding: 1.2rem 1rem !important;
  border-bottom: 1px solid #e2e8f0 !important;
  color: #1e293b !important;
  font-weight: 500 !important;
}

.view-report-btn {
  background: #10b981 !important;
  color: white !important;
  border: none !important;
  padding: 0.6rem 1.2rem !important;
  border-radius: 8px !important;
  cursor: pointer !important;
  font-weight: 600 !important;
  font-size: 0.9rem !important;
  transition: all 0.3s ease !important;
}

.view-report-btn:hover {
  background: #059669 !important;
  transform: translateY(-1px) !important;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem;
}

.pagination-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #3b82f6;
  background: white;
  color: #3b82f6;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-badge {
  padding: 0.4rem 0.8rem !important;
  border-radius: 20px !important;
  font-size: 0.85rem !important;
  font-weight: 600 !important;
}

.status-active {
  background: #dcfce7 !important;
  color: #166534 !important;
  border: 1px solid #22c55e !important;
}

.status-expired {
  background: #fee2e2 !important;
  color: #dc2626 !important;
  border: 1px solid #ef4444 !important;
}

.no-data {
  text-align: center;
  color: #64748b;
  font-style: italic;
  padding: 3rem;
}

.member-reports-container .modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0,0,0,0.8) !important;
  z-index: 10000 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 2rem !important;
}

.member-reports-container .modal-content {
  background: #ffffff !important;
  border-radius: 24px !important;
  width: 95% !important;
  max-width: 900px !important;
  max-height: 90vh !important;
  overflow-y: auto !important;
  box-shadow: 0 40px 80px rgba(0,0,0,0.4) !important;
  border: 1px solid #e2e8f0 !important;
  animation: modalSlideIn 0.3s ease !important;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.member-reports-container .modal-header {
  padding: 2.5rem 2.5rem 2rem !important;
  border-bottom: 2px solid #f1f5f9 !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: flex-start !important;
}

.member-reports-container .modal-title-section {
  flex: 1 !important;
}

.member-reports-container .modal-title {
  font-size: 2.5rem !important;
  font-weight: 800 !important;
  color: #1e293b !important;
  margin: 0 0 0.5rem 0 !important;
  line-height: 1.2 !important;
  -webkit-background-clip: initial !important;
  background: none !important;
}

.member-reports-container .modal-subtitle {
  font-size: 1.2rem !important;
  color: #64748b !important;
  margin: 0 !important;
}

.member-reports-container .close-btn {
  background: #f8fafc !important;
  border: 2px solid #e2e8f0 !important;
  border-radius: 50% !important;
  width: 48px !important;
  height: 48px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 1.5rem !important;
  color: #64748b !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  flex-shrink: 0 !important;
}

.member-reports-container .close-btn:hover {
  background: #fee2e2 !important;
  border-color: #ef4444 !important;
  color: #dc2626 !important;
}

.member-reports-container .profile-card {
  padding: 2.5rem !important;
  display: flex !important;
  gap: 2rem !important;
  align-items: center !important;
  border-bottom: 1px solid #f1f5f9 !important;
}

.member-reports-container .avatar-large {
  width: 100px !important;
  height: 100px !important;
  border-radius: 20px !important;
  background: linear-gradient(135deg, #3b82f6, #1e40af) !important;
  color: white !important;
  font-size: 2.5rem !important;
  font-weight: 800 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  text-transform: uppercase !important;
}

.member-reports-container .profile-details h2 {
  font-size: 1.8rem !important;
  color: #1e293b !important;
  margin: 0 0 1rem 0 !important;
  font-weight: 700 !important;
}

.member-reports-container .profile-meta {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 1.5rem !important;
}

.member-reports-container .meta-item {
  font-size: 1rem !important;
  color: #374151 !important;
  font-weight: 600 !important;
}

.member-reports-container .status-badge {
  padding: 0.5rem 1rem !important;
  border-radius: 25px !important;
  font-size: 0.9rem !important;
  font-weight: 700 !important;
  border: 2px solid !important;
}

.member-reports-container .metrics-dashboard {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important;
  gap: 1.5rem !important;
  padding: 2.5rem !important;
}

.member-reports-container .metric-card {
  padding: 2rem 1.5rem !important;
  border-radius: 20px !important;
  border: 2px solid #e2e8f0 !important;
  background: #ffffff !important;
  text-align: center !important;
  transition: all 0.3s ease !important;
  position: relative !important;
}

.member-reports-container .metric-card:hover {
  border-color: #3b82f6 !important;
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15) !important;
}

.member-reports-container .metric-card h3 {
  font-size: 1.1rem !important;
  color: #374151 !important;
  margin: 0 0 1rem 0 !important;
  font-weight: 600 !important;
}

.member-reports-container .metric-value {
  font-size: 2.5rem !important;
  font-weight: 800 !important;
  color: #3b82f6 !important;
  margin: 0.5rem 0 !important;
  line-height: 1 !important;
}

.member-reports-container .metric-subtext {
  font-size: 1rem !important;
  color: #64748b !important;
  font-weight: 500 !important;
}

.member-reports-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #64748b;
}

.member-reports-container .status-active {
  background: #dcfce7 !important;
  color: #166534 !important;
}

.member-reports-container .status-expired {
  background: #fee2e2 !important;
  color: #dc2626 !important;
}

.member-reports-container .metric-value {
  color: #3b82f6 !important;
  font-weight: 800 !important;
}

.member-reports-container .view-report-btn {
  background: #10b981 !important;
  color: white !important;
}

div.modal-overlay:has(.member-reports-container .modal-content) {
  z-index: 999999 !important;
  background: rgba(0,0,0,0.9) !important;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .member-reports-container {
    padding: 1rem !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
  }

  .reports-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-stats {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .search-filter-section {
    flex-direction: column;
    gap: 0.75rem;
    max-width: 100%;
  }

  .members-table {
    width: 100%;
    overflow-x: auto;
  }

  .members-table th,
  .members-table td {
    padding: 0.8rem 0.75rem !important;
    font-size: 0.88rem !important;
    white-space: normal !important;
    word-break: break-word !important;
    min-width: 120px !important;
  }

  .view-report-btn {
    width: 100% !important;
    padding: 0.65rem 0.9rem !important;
    font-size: 0.85rem !important;
  }

  .pagination-container {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
  }

  .pagination-btn {
    width: 100%;
    padding: 0.65rem 1rem;
  }

  .member-reports-container .modal-content {
    width: 100% !important;
    max-width: 95% !important;
    padding: 1rem !important;
  }

  .member-reports-container .modal-header,
  .member-reports-container .profile-card,
  .member-reports-container .metrics-dashboard {
    padding: 1rem !important;
  }

  .member-reports-container .profile-card {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 1rem !important;
  }

  .member-reports-container .metric-card {
    padding: 1rem !important;
  }
}

@media (max-width: 768px) {
  .member-reports-container .reports-header h1 {
    font-size: 1.8rem;
  }

  .member-reports-container .search-input,
  .member-reports-container .filter-select {
    font-size: 0.95rem;
  }

  .member-reports-container .members-table th,
  .member-reports-container .members-table td {
    font-size: 0.8rem !important;
    padding: 0.65rem 0.6rem !important;
  }

  .member-reports-container .metric-card {
    padding: 0.85rem !important;
  }

  .member-reports-container .modal-overlay {
    padding: 1rem !important;
  }

  .member-reports-container .modal-content {
    width: 98% !important;
    max-width: none !important;
    border-radius: 16px !important;
    margin: 1rem !important;
    max-height: 95vh !important;
  }

  .member-reports-container .modal-header {
    padding: 1.5rem 1.5rem 1.2rem !important;
    flex-direction: column !important;
    gap: 1rem !important;
    text-align: center !important;
  }

  .member-reports-container .modal-title {
    font-size: 1.8rem !important;
  }

  .member-reports-container .modal-subtitle {
    font-size: 1rem !important;
  }

  .member-reports-container .profile-card {
    flex-direction: column !important;
    text-align: center !important;
    padding: 2rem 1.5rem !important;
    gap: 1.5rem !important;
  }

  .member-reports-container .avatar-large {
    width: 80px !important;
    height: 80px !important;
    font-size: 2rem !important;
  }

  .member-reports-container .profile-details h2 {
    font-size: 1.5rem !important;
  }

  .member-reports-container .profile-meta {
    flex-direction: column !important;
    gap: 0.8rem !important;
    text-align: center !important;
  }

  .member-reports-container .metrics-dashboard {
    grid-template-columns: 1fr !important;
    gap: 1rem !important;
    padding: 1.5rem !important;
  }

  .member-reports-container .metric-card {
    padding: 1.5rem 1rem !important;
  }

  .member-reports-container .metric-value {
    font-size: 2rem !important;
  }

  .member-reports-container .metric-card h3 {
    font-size: 1rem !important;
  }

  .members-table {
    display: block !important;
    overflow-x: auto !important;
    white-space: nowrap !important;
  }

  .members-table th,
  .members-table td {
    padding: 0.8rem 0.6rem !important;
    font-size: 0.9rem !important;
  }

  .view-report-btn {
    padding: 0.4rem 0.8rem !important;
    font-size: 0.85rem !important;
  }

  .member-reports-container .close-btn {
    width: 42px !important;
    height: 42px !important;
    font-size: 1.3rem !important;
  }
}

@media (max-width: 480px) {
  .member-reports-container .modal-content {
    border-radius: 12px !important;
    margin: 0.5rem !important;
  }

  .member-reports-container .modal-header {
    padding: 1.2rem 1.2rem 1rem !important;
  }

  .member-reports-container .modal-title {
    font-size: 1.5rem !important;
  }

  .search-filter-section {
    flex-direction: column !important;
    max-width: none !important;
  }

  .search-input, .filter-select {
    width: 100% !important;
  }

  .reports-header {
    flex-direction: column !important;
    gap: 1rem !important;
    text-align: center !important;
  }

  .reports-header h1 {
    font-size: 2rem !important;
  }
}

@media (max-width: 360px) {
  .member-reports-container {
    padding: 1rem !important;
  }

  .members-table th,
  .members-table td {
    padding: 0.6rem 0.4rem !important;
    font-size: 0.85rem !important;
  }
}
`;

const MonthlyReportModal = ({ member, monthlyReports = [], onClose }) => {
  const safeMember = member || {};
  const safeStatus = safeMember.membershipStatus || 'Unknown';
  const memberReport = monthlyReports?.find(r => r.memberId === safeMember.id) || null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <h1 className="modal-title">{safeMember.name || 'Unknown'}</h1>
            <p className="modal-subtitle">February 2026 Report</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

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

      const usersRes = await fetch('http://localhost:3001/users');
      const users = await usersRes.json();
      const membersOnly = users.filter(user => user.role === 'member');

      const membershipsRes = await fetch('http://localhost:3001/memberships');
      const memberships = await membershipsRes.json();

      const reportsRes = await fetch('http://localhost:3001/monthlyReports');
      const monthlyReportsData = await reportsRes.json();

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
      <>
        <style>{styles}</style>
        <div className="member-reports-loading">
          <div className="spinner"></div>
          <p>Loading member reports...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
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
            onClick={() => setCurrentPage(p => p - 1)}
            className="pagination-btn"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {Math.ceil(filteredMembers.length / MEMBERS_PER_PAGE)}
          </span>
          <button
            disabled={currentPage === Math.ceil(filteredMembers.length / MEMBERS_PER_PAGE)}
            onClick={() => setCurrentPage(p => p + 1)}
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
    </>
  );
};

export default MemberReports;
