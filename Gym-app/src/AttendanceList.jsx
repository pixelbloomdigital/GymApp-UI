import React, { useState, useEffect, useCallback } from 'react';
import './AttendanceList.css';

const AttendanceList = () => {
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // ✅ CRITICAL FIX: Properly reset timestamps to NULL on load
  const fetchMembers = useCallback(() => {
    try {
      setLoading(true);
      const stored = localStorage.getItem("members");
      
      let membersWithAttendance = [];
      
      if (stored) {
        const parsedMembers = JSON.parse(stored);
        // ✅ FORCE timestamps to NULL unless explicitly set for TODAY
        membersWithAttendance = parsedMembers.map(member => ({
          ...member,
          checked: member.checked || false,
          checkinTime: null,        // ✅ ALWAYS NULL by default
          checkoutTime: null,       // ✅ ALWAYS NULL by default
          checkinDate: member.checkinDate || null,
          service: member.membership
        }));
      } else {
        membersWithAttendance = [{
          id: "1", name: "Viny DQ", phone: "+91 9876543210", 
          membership: "1 Month Membership", status: "active",
          checked: false, checkinTime: null, checkoutTime: null,
          service: "1 Month Membership"
        }];
        localStorage.setItem("members", JSON.stringify(membersWithAttendance));
      }

      setMembers(membersWithAttendance);
      setFilteredMembers(membersWithAttendance);
      
      const total = membersWithAttendance.length;
      const present = membersWithAttendance.filter(m => m.checked).length;
      setStats({ total, present, absent: total - present });
      
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Check-in: Set timestamp + increment present
  const checkInMember = (memberId) => {
    const now = new Date().toLocaleString('en-IN', {
      hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short'
    });

    const updatedMembers = members.map(member =>
      member.id === memberId ? {
        ...member,
        checked: true,
        checkinTime: now,        // ✅ Set timestamp NOW
        checkoutTime: null,
        checkinDate: selectedDate
      } : member
    );
    
    // Update localStorage
    const allMembers = JSON.parse(localStorage.getItem("members") || "[]");
    const updatedAllMembers = allMembers.map(member =>
      member.id === memberId ? {
        ...member,
        checked: true,
        checkinTime: now,
        checkoutTime: null,
        checkinDate: selectedDate
      } : member
    );
    
    localStorage.setItem("members", JSON.stringify(updatedAllMembers));
    setMembers(updatedMembers);
    setFilteredMembers(updatedMembers);
    setStats(prev => ({ 
      ...prev, 
      present: prev.present + 1, 
      absent: prev.absent - 1 
    }));
  };

  // ✅ Check-out: Set timestamp ONLY, NO count change
  const checkOutMember = (memberId) => {
    const now = new Date().toLocaleString('en-IN', {
      hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short'
    });

    const updatedMembers = members.map(member =>
      member.id === memberId ? {
        ...member,
        checked: false,
        checkoutTime: now      // ✅ Set timestamp NOW
      } : member
    );
    
    // Update localStorage
    const allMembers = JSON.parse(localStorage.getItem("members") || "[]");
    const updatedAllMembers = allMembers.map(member =>
      member.id === memberId ? {
        ...member,
        checked: false,
        checkoutTime: now
      } : member
    );
    
    localStorage.setItem("members", JSON.stringify(updatedAllMembers));
    setMembers(updatedMembers);
    setFilteredMembers(updatedMembers);
    setStats(prev => ({ ...prev, present: prev.present })); // ✅ No count change
  };

  // Search filter
  useEffect(() => {
    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone?.includes(searchTerm)
    );
    setFilteredMembers(filtered);
  }, [searchTerm, members]);

  // Effects
  useEffect(() => { fetchMembers(); }, [fetchMembers]);
  
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'members') fetchMembers();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchMembers]);

  const changeDate = (daysOffset) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + daysOffset);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#98cfff' }}>
      🔄 Loading...
    </div>;
  }

  return (
    <div className="attendance-container">
      {/* Sidebar with date */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">🏋️ GYM SYSTEM</h1>
          <div className="admin-info">
            <div className="admin-avatar">👨‍💼</div>
            <div className="admin-text">
              <p className="admin-greeting">Attendance Manager</p>
              <p style={{ fontSize: '0.85rem', color: '#98cfff' }}>
                {new Date(selectedDate).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item active">📋 Attendance</button>
          <button className="nav-item">👥 Members</button>
        </nav>
      </div>

      <div className="main-content">
        {/* Date Navigation */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => changeDate(-1)} style={{
            padding: '0.5rem 1rem', background: '#3e0994', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
          }}>← Previous</button>
          
          <input type="date" value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '0.5rem', border: '2px solid #3e0994', borderRadius: '8px' }}
          />
          
          <button onClick={() => changeDate(1)} style={{
            padding: '0.5rem 1rem', background: '#3e0994', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
          }}>Next →</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ padding: '1rem 1.5rem', border: '2px solid #3e0994', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', minWidth: '120px' }}>
            <div style={{ fontSize: '1.8rem', color: '#3e0994', fontWeight: 'bold' }}>{stats.total}</div>
            <div style={{ color: '#98cfff', fontSize: '0.9rem' }}>Total</div>
          </div>
          <div style={{ padding: '1rem 1.5rem', border: '2px solid #22c55e', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', minWidth: '120px' }}>
            <div style={{ fontSize: '1.8rem', color: '#22c55e', fontWeight: 'bold' }}>{stats.present}</div>
            <div style={{ color: '#22c55e', fontSize: '0.9rem' }}>Present</div>
          </div>
          <div style={{ padding: '1rem 1.5rem', border: '2px solid #ef4444', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', minWidth: '120px' }}>
            <div style={{ fontSize: '1.8rem', color: '#ef4444', fontWeight: 'bold' }}>{stats.absent}</div>
            <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>Absent</div>
          </div>
        </div>

        {/* Search */}
        <div className="search-section">
          <div className="search-wrapper">
            <input className="search-input" placeholder="Search name or phone..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* Table */}
        <div className="attendance-table-container">
          <table className="attendance-table">
            <thead><tr><th>Name</th><th>Contact</th><th>Service</th><th>Action</th></tr></thead>
            <tbody>
              {filteredMembers.map(member => (
                <tr key={member.id} className={member.checked ? 'present-row' : ''}>
                  <td>
                    <strong>{member.name}</strong>
                    {member.status === 'active' && (
                      <span style={{ color: '#10b981', fontSize: '0.8rem', marginLeft: '0.5rem' }}>● Active</span>
                    )}
                  </td>
                  <td>{member.phone}</td>
                  <td>
                    <span style={{ 
                      padding: '0.3rem 0.6rem', background: 'rgba(62,9,148,0.1)',
                      color: '#3e0994', borderRadius: '12px', fontSize: '0.8rem'
                    }}>
                      {member.membership}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {/* ✅ FIXED: Timestamps ONLY show if they exist */}
                    {member.checkinTime && (
                      <div style={{ color: '#22c55e', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        📥 {member.checkinTime}
                      </div>
                    )}
                    {member.checkoutTime && (
                      <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>
                        📤 {member.checkoutTime}
                      </div>
                    )}
                    <div style={{ marginTop: '0.5rem' }}>
                      {!member.checked ? (
                        <button onClick={() => checkInMember(member.id)} style={{
                          background: '#22c55e', color: 'white', border: 'none',
                          padding: '0.6rem 1.2rem', borderRadius: '20px', cursor: 'pointer',
                          fontSize: '0.85rem', fontWeight: '600'
                        }}>
                          📥 Check In
                        </button>
                      ) : (
                        <button onClick={() => checkOutMember(member.id)} style={{
                          background: '#ef4444', color: 'white', border: 'none',
                          padding: '0.6rem 1.2rem', borderRadius: '20px', cursor: 'pointer',
                          fontSize: '0.85rem', fontWeight: '600'
                        }}>
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
      </div>
    </div>
  );
};

export default AttendanceList;
