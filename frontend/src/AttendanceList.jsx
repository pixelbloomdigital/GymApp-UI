import React, { useState, useEffect, useCallback } from 'react';
import { getTodayAttendance, getAttendanceByDate, getAllMembers, markAttendance, checkOut, getMemberMemberships } from './api/coreService';

const AttendanceList = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [members, setMembers]           = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [stats, setStats]               = useState({ total:0, present:0, absent:0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [membersRes, attendanceRes] = await Promise.all([
        getAllMembers(),
        selectedDate === today ? getTodayAttendance() : getAttendanceByDate(selectedDate),
      ]);
      const allMembers       = membersRes.data || [];
      const attendanceRecords = attendanceRes.data || [];

      // CustomerResponse from /api/members does not include plan details.
      // Fetch memberships per member and derive active plan for Attendance table.
      const membershipsByMember = {};
      await Promise.all(
        allMembers.map(async (m) => {
          const memberId = m.memberId || m.id;
          if (!memberId) return;
          try {
            const res = await getMemberMemberships(memberId);
            membershipsByMember[memberId] = Array.isArray(res.data) ? res.data : [];
          } catch {
            membershipsByMember[memberId] = [];
          }
        })
      );

      // Accept strings, arrays, objects, or numeric values from the API
      const fmtTime = (t) => {
        if (!t) return null;
        if (Array.isArray(t)) return `${String(t[0]).padStart(2,'0')}:${String(t[1]).padStart(2,'0')}`;
        if (typeof t === 'object') {
          if (t.hour != null && t.minute != null) {
            return `${String(t.hour).padStart(2,'0')}:${String(t.minute).padStart(2,'0')}`;
          }
          if (t.hours != null && t.minutes != null) {
            return `${String(t.hours).padStart(2,'0')}:${String(t.minutes).padStart(2,'0')}`;
          }
        }
        if (typeof t === 'number') {
          const text = String(t).padStart(4, '0');
          return `${text.slice(0, 2)}:${text.slice(2, 4)}`;
        }
        const text = String(t).trim();
        if (text.includes(':')) return text.substring(0, 5);
        return text.length >= 4 ? `${text.slice(0, 2)}:${text.slice(2, 4)}` : text;
      };

      const enriched = allMembers.map(m => {
        const memberId = m.memberId || m.id;
        const rec = attendanceRecords.find(a => a.memberId === (m.memberId || m.id));
        const memberships = membershipsByMember[memberId] || [];
        const activeMembership = memberships.find(mm => (mm.status || '').toUpperCase() === 'ACTIVE') || memberships[0] || null;
        return {
          id:           memberId,
          name:         m.name,
          phone:        m.phone,
          membership:   activeMembership?.planName || m.membershipPlan || 'N/A',
          memberStatus: activeMembership?.status || m.status || m.memberStatus || 'INACTIVE',
          checked:      rec?.status === 'PRESENT',
          checkinTime:  fmtTime(rec?.checkInTime),
          checkoutTime: fmtTime(rec?.checkOutTime),
          batchId:      m.batchId || null,
          attendanceId: rec?.attendanceId || null,
        };
      });
      setMembers(enriched);
      setFilteredMembers(enriched);
      const present = enriched.filter(m => m.checked).length;
      setStats({ total:enriched.length, present, absent:enriched.length - present });
    } catch (err) {
      console.error('Fetch error:', err);
      setMembers([]); setFilteredMembers([]); setStats({ total:0, present:0, absent:0 });
    } finally { setLoading(false); }
  }, [selectedDate, today]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    setFilteredMembers(members.filter(m =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone?.includes(searchTerm)
    ));
  }, [searchTerm, members]);

  const currentRole = (localStorage.getItem("role") || "").toUpperCase();
  const canOverrideMembership = currentRole === "ADMIN" || currentRole === "TRAINER";

  const handleCheckIn = async (member) => {
    if (selectedDate !== today) { alert('Check-in only allowed for today!'); return; }
    try {
      const response = await markAttendance({
        memberId:    member.id,
        batchId:     member.batchId || 1,
        date:        selectedDate,
        status:      "PRESENT",
        markedById:  parseInt(localStorage.getItem("memberId") || "1"),
        timeSlot:    new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }),
      });
      const checkinTime = response?.data?.checkInTime || new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
      const updated = members.map(m => m.id === member.id ? {
        ...m,
        checked: true,
        checkinTime,
        attendanceId: response?.data?.attendanceId || m.attendanceId,
      } : m);
      setMembers(updated);
      setStats(p => ({ ...p, present: p.present + 1, absent: Math.max(0, p.absent - 1) }));
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data || e.message;
      if (typeof msg === "string" && msg.toLowerCase().includes("already")) {
        alert("Already marked present today");
        fetchData();
      } else if (typeof msg === "string" && msg.toLowerCase().includes("membership")) {
        alert(`Cannot mark attendance: ${msg}\n\nPlease assign an active membership to this member first.`);
      } else {
        alert(typeof msg === "string" ? msg : "Check-in failed");
      }
    }
  };

  const handleCheckOut = async (member) => {
    if (selectedDate !== today) { alert('Check-out only allowed for today!'); return; }
    try {
      const response = await checkOut(member.id, member.batchId || 1);
      const checkoutTime = response?.data?.checkOutTime || new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
      setMembers(members.map(m => m.id === member.id ? { ...m, checkoutTime } : m));
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data || e.message;
      alert(typeof msg === "string" ? msg : "Check-out failed");
    }
  };

  const isToday = selectedDate === today;

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif" }}>
      {/* Controls row */}
      <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", alignItems:"center", marginBottom:"1.5rem" }}>
        <input
          style={{ padding:"0.65rem 1rem", borderRadius:8, border:"1.5px solid #3e0994", fontSize:"0.9rem", fontFamily:"inherit", minWidth:220 }}
          placeholder="🔍 Search name or phone…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
          <label style={{ fontWeight:600, color:"#3e0994", fontSize:"0.9rem" }}>📅 Date:</label>
          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={e => setSelectedDate(e.target.value)}
            style={{ padding:"0.65rem 1rem", borderRadius:8, border:"1.5px solid #3e0994", fontSize:"0.9rem", fontFamily:"inherit" }}
          />
        </div>
        <button
          onClick={() => setSelectedDate(today)}
          style={{ padding:"0.65rem 1.25rem", borderRadius:8, border:"none", background: isToday ? "#3e0994" : "rgba(62,9,148,0.1)", color: isToday ? "#fff" : "#3e0994", fontWeight:600, cursor:"pointer", fontSize:"0.9rem", fontFamily:"inherit" }}>
          Today
        </button>
        {!isToday && (
          <span style={{ color:"#f59e0b", fontSize:"0.85rem", fontWeight:500 }}>
            ⚠️ Viewing {new Date(selectedDate).toLocaleDateString('en-IN')} — marking disabled
          </span>
        )}
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.5rem" }}>
        {[{ label:"Total", val:stats.total, color:"#3e0994", border:"#3e0994" },{ label:"Present", val:stats.present, color:"#16a34a", border:"#22c55e" },{ label:"Absent", val:stats.absent, color:"#dc2626", border:"#ef4444" }].map(s => (
          <div key={s.label} style={{ background:"#fff", borderRadius:12, padding:"1.25rem", textAlign:"center", border:`1.5px solid ${s.border}`, boxShadow:"0 4px 16px rgba(62,9,148,0.08)" }}>
            <div style={{ fontSize:"2.4rem", fontWeight:800, color:s.color, lineHeight:1 }}>{s.val}</div>
            <div style={{ fontSize:"0.8rem", color:"#475569", fontWeight:600, textTransform:"uppercase", letterSpacing:"1px", marginTop:"0.3rem" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:"#fff", borderRadius:16, overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.1)", border:"1px solid rgba(62,9,148,0.1)" }}>
        {loading ? (
          <div style={{ padding:"3rem", textAlign:"center", color:"#64748b" }}>🔄 Loading attendance…</div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"linear-gradient(135deg,#1e3a8a,#3b82f6)" }}>
                {["Name","Phone","Plan","Check-In","Check-Out","Status","Action"].map(h => (
                  <th key={h} style={{ padding:"1rem", textAlign:"left", color:"#fff", fontWeight:600, fontSize:"0.85rem", textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(member => (
                <tr key={member.id} style={{ background: member.checked ? "rgba(34,197,94,0.04)" : "transparent", borderBottom:"1px solid rgba(62,9,148,0.05)" }}>
                  <td style={{ padding:"1rem", fontWeight:600, color:"#1e293b" }}>
                    {member.name}
                    {member.memberStatus !== 'ACTIVE' && (
                      <div style={{ fontSize:"0.72rem", color:"#ef4444", marginTop:"0.2rem" }}>
                        ⚠️ No active membership{canOverrideMembership ? ' — admin can still mark present' : ''}
                      </div>
                    )}
                  </td>
                  <td style={{ padding:"1rem", color:"#475569" }}>{member.phone || "—"}</td>
                  <td style={{ padding:"1rem" }}>
                    <span style={{ padding:"0.3rem 0.7rem", borderRadius:12, background:"rgba(62,9,148,0.1)", color:"#3e0994", fontSize:"0.8rem", fontWeight:500 }}>{member.membership}</span>
                  </td>
                  <td style={{ padding:"1rem", color:"#22c55e", fontFamily:"monospace", fontSize:"0.9rem" }}>{member.checkinTime || "—"}</td>
                  <td style={{ padding:"1rem", color:"#ef4444", fontFamily:"monospace", fontSize:"0.9rem" }}>{member.checkoutTime || "—"}</td>
                  <td style={{ padding:"1rem" }}>
                    <span style={{ padding:"0.3rem 0.8rem", borderRadius:20, fontSize:"0.8rem", fontWeight:600, background:member.checked?"#dcfce7":"#fee2e2", color:member.checked?"#166534":"#dc2626" }}>
                      {member.checked ? "✅ Present" : "❌ Absent"}
                    </span>
                  </td>
                  <td style={{ padding:"1rem", whiteSpace:"nowrap" }}>
                    {!member.checked ? (
                      <button
                        onClick={() => handleCheckIn(member)}
                        disabled={!isToday || (!canOverrideMembership && member.memberStatus !== 'ACTIVE')}
                        title={!isToday ? 'Check-in allowed only for today' : (!canOverrideMembership && member.memberStatus !== 'ACTIVE') ? 'Member has no active membership' : 'Mark present'}
                        style={{ padding:"0.5rem 1rem", borderRadius:20, border:"none", background: !isToday || (!canOverrideMembership && member.memberStatus !== 'ACTIVE') ? "#d1d5db" : "#22c55e", color:"#fff", fontWeight:600, cursor: !isToday || (!canOverrideMembership && member.memberStatus !== 'ACTIVE') ? "not-allowed" : "pointer", fontSize:"0.85rem", fontFamily:"inherit" }}>
                        📥 Check In
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCheckOut(member)}
                        disabled={!isToday || !!member.checkoutTime}
                        style={{ padding:"0.5rem 1rem", borderRadius:20, border:"none", background:isToday&&!member.checkoutTime?"#ef4444":"#d1d5db", color:"#fff", fontWeight:600, cursor:isToday&&!member.checkoutTime?"pointer":"not-allowed", fontSize:"0.85rem", fontFamily:"inherit" }}>
                        📤 Check Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr><td colSpan={7} style={{ padding:"3rem", textAlign:"center", color:"#94a3b8" }}>No members found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AttendanceList;
