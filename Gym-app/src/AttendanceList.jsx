import React, { useState, useEffect, useCallback } from 'react';

const AttendanceList = () => {
  const today = new Date().toISOString().split('T')[0];
  const [viewMode, setViewMode] = useState('today');
  const [selectedDate, setSelectedDate] = useState(today);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);

      const [usersRes, membershipsRes, attendanceRes] = await Promise.all([
        fetch('http://localhost:3001/users'),
        fetch('http://localhost:3001/memberships'),
        fetch(`http://localhost:3001/dailyAttendance?date=${selectedDate}`)
      ]);

      const users = await usersRes.json();
      const memberships = await membershipsRes.json();
      const todayAttendance = await attendanceRes.json();

      const memberUsers = users.filter(user => user.role === 'member');

      const membersWithAttendance = memberUsers.map(user => {
        const membership = memberships.find(m => m.id === user.membershipId);
        const todayRecord = todayAttendance.find(record => record.userId === user.id);

        return {
          id: user.id,
          name: user.name,
          phone: user.contact,
          membership: membership?.name || '1 Month Membership',
          status: user.membershipStatus || 'active',
          checked: todayRecord?.status === 'present',
          checkinTime: todayRecord?.checkinTime || null,
          checkoutTime: todayRecord?.checkoutTime || null,
          trainer: user.trainer,
          totalAttendanceDays: user.totalAttendanceDays || 0,
          attendance: user.attendance || '0%'
        };
      });

      setMembers(membersWithAttendance);
      setFilteredMembers(membersWithAttendance);

      const total = membersWithAttendance.length;
      const present = membersWithAttendance.filter(m => m.checked).length;
      setStats({ total, present, absent: total - present });

    } catch (error) {
      console.error('Fetch error:', error);
      const fallback = [{
        id: "1", name: "Rahul Sharma", phone: "+91 7656491083",
        membership: "1 Month Membership", status: "Active", checked: false,
        trainer: "Priya", totalAttendanceDays: 15, attendance: "74%"
      }];
      setMembers(fallback);
      setFilteredMembers(fallback);
      setStats({ total: 1, present: 0, absent: 1 });
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const checkInMember = async (memberId) => {
    if (selectedDate !== today) {
      alert('Check-in allowed only for TODAY!');
      return;
    }

    const now = new Date().toLocaleString('en-IN', {
      hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short'
    });

    try {
      const userRes = await fetch(`http://localhost:3001/users/${memberId}`);
      const user = await userRes.json();

      const existingRecordRes = await fetch(`http://localhost:3001/dailyAttendance?userId=${memberId}&date=${today}`);
      const existingRecords = await existingRecordRes.json();

      if (existingRecords.length > 0) {
        await fetch(`http://localhost:3001/dailyAttendance/${existingRecords[0].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'present', checkinTime: now, checkoutTime: null })
        });
      } else {
        await fetch('http://localhost:3001/dailyAttendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: memberId, date: today, status: 'present', checkinTime: now, checkoutTime: null })
        });
      }

      const newTotalDays = (user.totalAttendanceDays || 0) + 1;
      await fetch(`http://localhost:3001/users/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAttendanceDays: newTotalDays,
          attendance: `${Math.round(newTotalDays / 30 * 100)}%`
        })
      });

      const updatedMembers = members.map(m =>
        m.id === memberId ? { ...m, checked: true, checkinTime: now } : m
      );
      setMembers(updatedMembers);
      setFilteredMembers(updatedMembers);
      setStats(prev => ({ ...prev, present: prev.present + 1, absent: prev.absent - 1 }));

    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  const checkOutMember = async (memberId) => {
    if (selectedDate !== today) {
      alert('Check-out allowed only for TODAY!');
      return;
    }

    const now = new Date().toLocaleString('en-IN', {
      hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short'
    });

    try {
      const existingRecordRes = await fetch(`http://localhost:3001/dailyAttendance?userId=${memberId}&date=${today}`);
      const existingRecords = await existingRecordRes.json();

      if (existingRecords.length > 0) {
        await fetch(`http://localhost:3001/dailyAttendance/${existingRecords[0].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutTime: now })
        });
      }

      const updatedMembers = members.map(m =>
        m.id === memberId ? { ...m, checkoutTime: now } : m
      );
      setMembers(updatedMembers);
      setFilteredMembers(updatedMembers);

    } catch (error) {
      console.error('Check-out failed:', error);
    }
  };

  useEffect(() => {
    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone?.includes(searchTerm)
    );
    setFilteredMembers(filtered);
  }, [searchTerm, members]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  if (loading) {
    return (
      <>
        <style>{inlineStyles}</style>
        <div className="al-loading-container">🔄 Loading...</div>
      </>
    );
  }

  return (
    <>
      <style>{inlineStyles}</style>

      <div className="al-container">

        {/* Sidebar */}
        <div className="al-sidebar">
          <div className="al-sidebar-header">
            <h1 className="al-sidebar-title">🏋️ GYM SYSTEM</h1>
            <div className="al-admin-info">
              <div className="al-admin-avatar">👨‍💼</div>
              <div className="al-admin-text">
                <p className="al-admin-greeting">Attendance Manager</p>
                <p style={{ fontSize: '1rem', color: viewMode === 'today' ? '#22c55e' : '#98cfff', margin: 0 }}>
                  {viewMode === 'today' ? '📅 TODAY' : `📅 ${new Date(selectedDate).toLocaleDateString('en-IN')}`}
                </p>
              </div>
            </div>
          </div>
          <nav className="al-sidebar-nav">
            <button
              className={`al-nav-item ${viewMode === 'today' ? 'active' : ''}`}
              onClick={() => setViewMode('today')}
            >
              📋 Today
            </button>
            <button
              className={`al-nav-item ${viewMode === 'history' ? 'active' : ''}`}
              onClick={() => setViewMode('history')}
            >
              📊 History
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="al-main-content">
          {viewMode === 'today' ? (
            <>
              {/* Stats */}
              <div className="al-stats-grid">
                <div className="al-stat-card al-stat-total">
                  <div className="al-stat-number">{stats.total}</div>
                  <div className="al-stat-label">Total</div>
                </div>
                <div className="al-stat-card al-stat-present">
                  <div className="al-stat-number">{stats.present}</div>
                  <div className="al-stat-label">Present</div>
                </div>
                <div className="al-stat-card al-stat-absent">
                  <div className="al-stat-number">{stats.absent}</div>
                  <div className="al-stat-label">Absent</div>
                </div>
              </div>

              {/* Search */}
              <div className="al-search-section">
                <div className="al-search-wrapper">
                  <input
                    className="al-search-input"
                    placeholder="🔍 Search name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Table */}
              <div className="al-table-container">
                <table className="al-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Plan</th>
                      <th>Trainer</th>
                      <th style={{ minWidth: '120px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map(member => (
                      <tr key={member.id} className={member.checked ? 'al-present-row' : ''}>
                        <td>
                          <strong>{member.name}</strong>
                          {member.status === 'Active' && (
                            <span className="al-status-badge al-status-active">● Active</span>
                          )}
                        </td>
                        <td>{member.phone}</td>
                        <td>
                          <span className="al-membership-badge">{member.membership}</span>
                        </td>
                        <td>{member.trainer}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {member.checkinTime && (
                            <div className="al-timestamp al-checkin">📥 {member.checkinTime}</div>
                          )}
                          {member.checkoutTime && (
                            <div className="al-timestamp al-checkout">📤 {member.checkoutTime}</div>
                          )}
                          <div style={{ marginTop: '0.5rem' }}>
                            {!member.checked ? (
                              <button
                                className="al-action-btn"
                                onClick={() => checkInMember(member.id)}
                                disabled={selectedDate !== today}
                              >
                                📥 Check In
                              </button>
                            ) : (
                              <button
                                className="al-action-btn al-action-btn-checkout"
                                onClick={() => checkOutMember(member.id)}
                                disabled={selectedDate !== today}
                              >
                                📤 Check Out
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div>History view coming soon...</div>
          )}
        </div>
      </div>
    </>
  );
};

const inlineStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .al-container {
    display: flex;
    min-height: 100vh;
    background: linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 50%, #dce7ff 100%);
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  /* ── Sidebar ── */
  .al-sidebar {
    width: 220px;
    background: #1A1A1D;
    position: fixed;
    height: 100vh;
    padding: 0.85rem 0;
    box-shadow: 4px 0 10px rgba(62, 9, 148, 0.12);
    z-index: 100;
    overflow: auto;
  }

  .al-sidebar-header {
    padding: 0 0.9rem 0.7rem;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .al-sidebar-title {
    color: white;
    font-size: 1.05rem;
    font-weight: 700;
    margin: 0 0 0.7rem 0;
    text-align: center;
    line-height: 1.15;
  }

  .al-admin-info {
    display: flex;
    gap: 0.55rem;
    align-items: center;
  }

  .al-admin-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3e0994, #7c3aed);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .al-admin-text .al-admin-greeting {
    color: #e2e8f0;
    font-size: 0.84rem;
    margin: 0 0 0.1rem 0;
    font-weight: 500;
  }

  .al-sidebar-nav {
    margin-top: 1rem;
  }

  .al-nav-item {
    display: block;
    width: 100%;
    padding: 0.75rem 1.25rem;
    background: none;
    border: none;
    color: #94a3b8;
    font-size: 0.88rem;
    font-weight: 500;
    text-align: left;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Poppins', sans-serif;
  }

  .al-nav-item:hover,
  .al-nav-item.active {
    background: rgba(62, 9, 148, 0.25);
    color: #c4b5fd;
  }

  /* ── Main Content ── */
  .al-main-content {
    margin-left: 220px;
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
  }

  /* ── Stats Grid ── */
  .al-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.8rem;
    margin-bottom: 1rem;
  }

  .al-stat-card {
    background: rgba(255, 255, 255, 0.95);
    padding: 0.85rem;
    border-radius: 12px;
    text-align: center;
    border: 1.5px solid;
    transition: transform 0.2s ease;
    min-height: 96px;
  }

  .al-stat-card:hover { transform: translateY(-4px); }
  .al-stat-total   { border-color: #3e0994; }
  .al-stat-present { border-color: #22c55e; }
  .al-stat-absent  { border-color: #ef4444; }

  .al-stat-number {
    font-size: 2.4rem;
    font-weight: 800;
    margin-bottom: 0.3rem;
    line-height: 1;
  }

  .al-stat-total   .al-stat-number { color: #3e0994; }
  .al-stat-present .al-stat-number { color: #16a34a; }
  .al-stat-absent  .al-stat-number { color: #dc2626; }

  .al-stat-label {
    font-size: 0.8rem;
    color: #475569;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* ── Search ── */
  .al-search-section { margin-bottom: 1rem; }

  .al-search-wrapper { max-width: 320px; }

  .al-search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1.5px solid #3e0994;
    border-radius: 12px;
    background: rgba(255,255,255,0.9);
    font-size: 1rem;
    transition: all 0.3s ease;
    font-family: 'Poppins', sans-serif;
    box-sizing: border-box;
  }

  .al-search-input:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(62,9,148,0.1);
  }

  /* ── Table ── */
  .al-table-container {
    background: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    border: 1px solid rgba(62,9,148,0.1);
    min-height: 400px;
  }

  .al-table {
    width: 100%;
    border-collapse: collapse;
  }

  .al-table th {
    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
    color: white;
    padding: 1.2rem 1rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .al-table td {
    padding: 1.2rem 1rem;
    border-bottom: 1px solid rgba(62,9,148,0.05);
    background: #ffffff;
    color: #1e293b;
    vertical-align: middle;
  }

  .al-table tr:hover td { background: rgba(62,9,148,0.03); }

  .al-present-row td { background: rgba(34,197,94,0.04); }

  /* ── Badges ── */
  .al-status-badge {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    margin-left: 0.4rem;
  }

  .al-status-active {
    background: rgba(16,185,129,0.2);
    color: #10b981;
    border: 1px solid #10b981;
  }

  .al-membership-badge {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    background: rgba(62,9,148,0.1);
    color: #3e0994;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  /* ── Action Buttons ── */
  .al-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 104px;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.88rem;
    font-weight: 600;
    transition: all 0.3s ease;
    white-space: nowrap;
    background: #22c55e;
    color: white;
    font-family: 'Poppins', sans-serif;
  }

  .al-action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .al-action-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  }

  .al-action-btn-checkout {
    background: #ef4444;
    color: white;
  }

  /* ── Timestamps ── */
  .al-timestamp {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
    font-family: 'Monaco', 'Menlo', monospace;
  }

  .al-checkin  { color: #22c55e; }
  .al-checkout { color: #ef4444; }

  /* ── Loading ── */
  .al-loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
    font-family: 'Poppins', sans-serif;
    font-size: 1.2rem;
  }

  /* ── Animations ── */
  @keyframes alPulse {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  .al-action-btn.checked { animation: alPulse 0.6s ease; }

  /* ── Responsive: tablet ── */
  @media (max-width: 1024px) {
    .al-sidebar {
      position: fixed;
      top: 0;
      left: -280px;
      z-index: 250;
      transition: left 0.3s ease;
    }
    .al-sidebar.open { left: 0; }
    .al-main-content { margin-left: 0; width: 100%; padding: 1rem; }
    .al-stats-grid { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
  }

  /* ── Responsive: mobile ── */
  @media (max-width: 768px) {
    .al-container { flex-direction: column; min-height: auto; }

    .al-sidebar {
      position: relative;
      top: 0; left: 0;
      width: 100%; height: auto;
      padding: 0.6rem 0.45rem;
      box-shadow: none;
      border-bottom: 1px solid rgba(62,9,148,0.15);
    }

    .al-main-content { margin-left: 0; width: 100%; padding: 0.6rem; min-height: auto; }

    .al-stats-grid { grid-template-columns: 1fr; gap: 1rem; }

    .al-search-wrapper, .al-search-input { max-width: 100%; width: 100%; }

    .al-table-container { overflow-x: auto; width: 100%; -webkit-overflow-scrolling: touch; }

    .al-table {
      min-width: 620px;
      width: 100%;
      table-layout: fixed;
    }

    .al-table th:nth-child(1), .al-table td:nth-child(1) { width: 25%; }
    .al-table th:nth-child(2), .al-table td:nth-child(2) { width: 20%; }
    .al-table th:nth-child(3), .al-table td:nth-child(3) { width: 22%; }
    .al-table th:nth-child(4), .al-table td:nth-child(4) { width: 15%; }
    .al-table th:nth-child(5), .al-table td:nth-child(5) { width: 18%; min-width: 120px; }

    .al-table th, .al-table td {
      padding: 0.75rem 0.65rem;
      font-size: 0.78rem;
      white-space: normal;
      word-break: break-word;
    }

    .al-table td:last-child {
      white-space: nowrap !important;
      padding: 0.8rem 0.4rem !important;
      vertical-align: middle;
    }

    .al-action-btn {
      padding: 0.4rem 0.8rem !important;
      font-size: 0.75rem !important;
      min-width: 80px !important;
      width: 100% !important;
      justify-content: center;
      margin-bottom: 0.2rem;
    }

    .al-timestamp {
      font-size: 0.7rem !important;
      margin-bottom: 0.2rem;
      line-height: 1.2;
    }
  }

  /* ── Extra-small mobile ── */
  @media (max-width: 480px) {
    .al-table th, .al-table td {
      padding: 0.6rem 0.3rem !important;
      font-size: 0.75rem !important;
    }
    .al-action-btn {
      padding: 0.35rem 0.6rem !important;
      font-size: 0.7rem !important;
      min-width: 70px !important;
    }
  }
`;

export default AttendanceList;
