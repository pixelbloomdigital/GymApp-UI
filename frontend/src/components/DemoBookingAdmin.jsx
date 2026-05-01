import { useState, useEffect, useCallback } from "react";
import "./DemoBookingAdmin.css";
import { getAllDemoBookings, getDemoStats, confirmDemoDate, cancelDemoBooking, deleteVisitor, getAllVisitors, registerVisitor, changeMemberRole, getMemberIdByVisitorId, markVisitorAttended } from "../api/authAdminService";
import api from "../api/axios";
import PasswordField from "./PasswordField.jsx";

// ── Helpers ───────────────────────────────────────────────────────────────────

// Java LocalDateTime comes as [year,month,day,hour,min,sec,nano] array
const parseJavaDate = (d) => {
  if (!d) return null;
  if (Array.isArray(d)) {
    const [y, mo, day, h, m] = d;
    return new Date(y, mo - 1, day, h, m);
  }
  return new Date(d);
};

const fmtDate = (d) => {
  const dt = parseJavaDate(d);
  if (!dt) return null;
  return dt.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
};

const statusBadge = (status) => {
  const map = { FREE:"dba-badge-free", CONFIRMED:"dba-badge-confirmed", PENDING_PAYMENT:"dba-badge-pending", CANCELLED:"dba-badge-cancelled", EXPIRED:"dba-badge-expired" };
  return <span className={`dba-badge ${map[status] || "dba-badge-pending"}`}>{status?.replace("_"," ")}</span>;
};

const dateBadge = (confirmedAtDate) => {
  if (!confirmedAtDate) return <span className="dba-badge dba-badge-unassigned">⏳ Not Assigned</span>;
  return <span className="dba-badge dba-badge-assigned">📅 {confirmedAtDate.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span>;
};

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="dba-modal-overlay" onClick={onClose}>
      <div className="dba-modal" onClick={e => e.stopPropagation()}>
        <div className="dba-modal-header">
          <h3 className="dba-modal-title">{title}</h3>
          <button className="dba-modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DemoBookingAdmin() {
  const [bookings, setBookings]   = useState([]);
  const [visitors, setVisitors]   = useState([]);
  const [slots, setSlots]         = useState([]);
  const [stats, setStats]         = useState({});
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [tab, setTab] = useState("all"); // all | no-booking | unassigned | upcoming | past | cancelled
  const [toast, setToast]         = useState({ msg:"", type:"" });
  const [selectedBookingIds, setSelectedBookingIds] = useState(new Set());
  const [actionMode, setActionMode] = useState(null); // null | 'assign' | 'reschedule' | 'cancel' | 'promote' | 'delete'
  const [topActionsOpen, setTopActionsOpen] = useState(false);
  const [newVisitorModal, setNewVisitorModal] = useState(false);
  const [newVisitorName, setNewVisitorName] = useState("");
  const [newVisitorEmail, setNewVisitorEmail] = useState("");
  const [newVisitorPhone, setNewVisitorPhone] = useState("");
  const [newVisitorGymCenter, setNewVisitorGymCenter] = useState("");
  const [newVisitorPassword, setNewVisitorPassword] = useState("");
const [currentPage, setCurrentPage] = useState(0);
const RECORDS_PER_PAGE = 5;

  // Modals
  const [assignModal, setAssignModal]     = useState(null); // booking to assign date
  const [rescheduleModal, setRescheduleModal] = useState(null); // booking to reschedule
  const [deleteModal, setDeleteModal]     = useState(null); // visitor to delete

  // Form states
  const [assignDate, setAssignDate]       = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");

  const notify = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:"", type:"" }), 3500);
  };

  const toggleBookingSelection = (bookingId) => {
    setSelectedBookingIds(prev => {
      const next = new Set(prev);
      if (next.has(bookingId)) next.delete(bookingId);
      else next.add(bookingId);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedBookingIds(new Set(filtered.map(b => b.bookingId)));
  };

  const clearSelection = () => setSelectedBookingIds(new Set());

  const handleCancelAction = () => {
    setActionMode(null);
    clearSelection();
  };

  const handleApplyAction = async () => {
    if (!actionMode) return;
    if (!selectedBookingIds.size) {
      notify("Select at least one booking using the checkboxes", "error");
      return;
    }

    const selected = filtered.filter(b => selectedBookingIds.has(b.bookingId));

    if (actionMode === "assign") {
      if (selected.length !== 1) {
        notify("Select exactly one booking to assign a date", "error");
        return;
      }
      setAssignModal(selected[0]);
      setAssignDate("");
      return;
    }

    if (actionMode === "reschedule") {
      if (selected.length !== 1) {
        notify("Select exactly one booking to reschedule", "error");
        return;
      }
      setRescheduleModal(selected[0]);
      setRescheduleDate(selected[0].confirmedAtDate ? selected[0].confirmedAtDate.toISOString().split("T")[0] : "");
      return;
    }

    if (actionMode === "cancel") {
      if (!window.confirm(`Cancel ${selected.length} booking(s)?`)) return;
      try {
        await Promise.all(selected.map(b => cancelDemoBooking(b.bookingId).catch(() => {})));
        notify(`Cancelled ${selected.length} booking(s)`);
        clearSelection();
        setActionMode(null);
        load();
      } catch (err) {
        notify("Failed to cancel bookings", "error");
      }
      return;
    }

    if (actionMode === "promote") {
      const promotable = selected.filter(b => b.visitor && !["MEMBER","ADMIN","TRAINER"].includes(b.visitor.role));
      if (!promotable.length) {
        notify("No promotable visitors selected", "error");
        return;
      }
      try {
        await Promise.all(promotable.map(b => handleConvertVisitor(b.visitor, true)));
        notify(`Promoted ${promotable.length} visitor(s) to member`);
        clearSelection();
        setActionMode(null);
        load();
      } catch (err) {
        notify("Failed to promote visitors", "error");
      }
      return;
    }

    if (actionMode === "delete") {
      if (!window.confirm(`Delete ${selected.length} visitor(s)? This cannot be undone.`)) return;
      try {
        await Promise.all(selected.map(b => deleteVisitor(b.visitorId).catch(() => {})));
        notify(`Deleted ${selected.length} visitor(s)`);
        clearSelection();
        setActionMode(null);
        load();
      } catch (err) {
        notify("Failed to delete visitors", "error");
      }
      return;
    }
  };

  const resetNewVisitorForm = () => {
    setNewVisitorName("");
    setNewVisitorEmail("");
    setNewVisitorPhone("");
    setNewVisitorGymCenter("");
    setNewVisitorPassword("");
  };

  const handleAddVisitor = async () => {
    if (!newVisitorName.trim() || !newVisitorEmail.trim() || !newVisitorPhone.trim()) {
      notify("Name, email, and phone are required", "error");
      return;
    }
    try {
      await registerVisitor({
        name: newVisitorName.trim(),
        email: newVisitorEmail.trim(),
        phone: newVisitorPhone.trim(),
        gymCenter: newVisitorGymCenter.trim() || undefined,
        password: newVisitorPassword.trim() || undefined,
      });
      notify("Visitor created successfully. SMS sent to " + newVisitorPhone.trim());
      setNewVisitorModal(false);
      resetNewVisitorForm();
      setCurrentPage(0);
      load();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to add visitor", "error");
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction) {
      notify("Select a bulk action first", "error");
      return;
    }
    if (!selectedBookingIds.size) {
      notify("Select at least one visitor using the checkboxes", "error");
      return;
    }
    const selected = filtered.filter(b => selectedBookingIds.has(b.bookingId));
    if (bulkAction === "cancel") {
      if (!window.confirm(`Cancel ${selected.length} selected booking(s)?`)) return;
      await Promise.all(selected.map(b => cancelDemoBooking(b.bookingId).catch(() => {})));
      notify(`Cancelled ${selected.length} booking(s)`);
      clearSelection();
      load();
      return;
    }
    if (bulkAction === "promote") {
      const promotable = selected.filter(b => b.visitor && !["MEMBER","ADMIN","TRAINER"].includes(b.visitor.role));
      if (!promotable.length) {
        notify("No promotable visitors selected", "error");
        return;
      }
      await Promise.all(promotable.map(b => handleConvertVisitor(b.visitor, true)));
      clearSelection();
      load();
      return;
    }
    if (bulkAction === "delete") {
      if (!window.confirm(`Delete ${selected.length} selected visitor(s)? This cannot be undone.`)) return;
      await Promise.all(selected.map(b => deleteVisitor(b.visitorId).catch(() => {})));
      notify(`Deleted ${selected.length} visitor(s)`);
      clearSelection();
      load();
      return;
    }
    if (bulkAction === "assign") {
      if (selected.length !== 1) {
        notify("Choose exactly one visitor to assign a date", "error");
        return;
      }
      setAssignModal(selected[0]);
      setAssignDate("");
      return;
    }
    if (bulkAction === "reschedule") {
      if (selected.length !== 1) {
        notify("Choose exactly one visitor to reschedule", "error");
        return;
      }
      setRescheduleModal(selected[0]);
      setRescheduleDate(selected[0].confirmedAtDate ? selected[0].confirmedAtDate.toISOString().split("T")[0] : "");
      return;
    }
  };

  const handleConvertVisitor = async (visitor, isBulk = false) => {
    if (!visitor) return;
    if (!isBulk && !window.confirm(`Convert visitor ${visitor.name} to MEMBER role?`)) return;
    try {
      const memberIdRes = await getMemberIdByVisitorId(visitor.visitorId);
      const memberId = memberIdRes.data?.memberId;
      if (!memberId) {
        notify(`Unable to determine member id for ${visitor.email}`, "error");
        return;
      }

      await changeMemberRole(memberId, "MEMBER", visitor.visitorId);
      notify(`${visitor.name} is now a Member and has been notified`);
      if (!isBulk) load();
    } catch (err) {
      notify(err.response?.data?.message || err.message || "Failed to convert visitor", "error");
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, s, v, slotsRes] = await Promise.all([
        getAllDemoBookings(),
        getDemoStats(),
        getAllVisitors(),
        api.get('/api/demo/slots'),
      ]);
      setBookings(b.data || []);
      setStats(s.data || {});
      setVisitors(v.data || []);
      setSlots(slotsRes.data || []);
    } catch (err) {
      notify("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Enrich bookings with visitor + slot info
  const enriched = bookings.map(b => {
    const visitor = visitors.find(v => v.visitorId === b.visitorId);
    const slot    = slots.find(s => s.slotId === b.slotId);
    return {
      ...b,
      visitorName:  visitor?.name  || `Visitor #${b.visitorId}`,
      visitorEmail: visitor?.email || "",
      visitorPhone: visitor?.phone || "",
      visitor,
      batchType:  slot?.batchType  || "—",
      slotType:   slot?.slotType   || "—",
      startTime:  slot?.startTime  || "",
      endTime:    slot?.endTime    || "",
      confirmedAtDate: parseJavaDate(b.confirmedAt),
      bookedAtDate:    parseJavaDate(b.bookedAt),
      _hasBooking: true,
    };
  });

  // Visitors with no demo booking at all
  const bookedVisitorIds = new Set(bookings.map(b => b.visitorId));
  const noBookingRows = visitors
    .filter(v => !bookedVisitorIds.has(v.visitorId))
    .map(v => ({
      bookingId: null,
      visitorId: v.visitorId,
      visitorName: v.name,
      visitorEmail: v.email || "",
      visitorPhone: v.phone || "",
      visitor: v,
      batchType: "—", slotType: "—", startTime: "", endTime: "",
      status: null,
      confirmedAtDate: null,
      bookedAtDate: null,
      _hasBooking: false,
    }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Tab filter
  const tabFiltered = (() => {
    if (tab === "no-booking")  return noBookingRows;
    if (tab === "unassigned")  return enriched.filter(b => !b.confirmedAtDate && b.status !== "CANCELLED");
    if (tab === "upcoming")    return enriched.filter(b => b.confirmedAtDate && b.confirmedAtDate >= today && b.status !== "CANCELLED");
    if (tab === "past")        return enriched.filter(b => b.confirmedAtDate && b.confirmedAtDate < today && b.status !== "CANCELLED");
    if (tab === "cancelled")   return enriched.filter(b => b.status === "CANCELLED");
    // all = bookings + no-booking visitors
    return [...enriched, ...noBookingRows];
  })();

  // Search filter
  const filtered = tabFiltered.filter(b =>
    b.visitorName.toLowerCase().includes(search.toLowerCase()) ||
    b.visitorEmail.toLowerCase().includes(search.toLowerCase()) ||
    b.visitorPhone.includes(search) ||
    (b.bookingId && String(b.bookingId).includes(search))
  );

  // Pagination
  const paginatedFiltered = filtered.slice(
    currentPage * RECORDS_PER_PAGE,
    (currentPage + 1) * RECORDS_PER_PAGE
  );
  const totalPages = Math.ceil(filtered.length / RECORDS_PER_PAGE);
  const canGoNext = currentPage < totalPages - 1;
  const canGoPrev = currentPage > 0;

  // ── Assign Date ─────────────────────────────────────────────────────────────
  const handleAssignDate = async () => {
    if (!assignModal?.bookingId) { notify("No booking selected for assignment", "error"); return; }
    if (!assignDate) { notify("Please select a date", "error"); return; }
    try {
      await confirmDemoDate(assignModal.bookingId, assignDate);
      notify(`Demo date assigned: ${new Date(assignDate).toLocaleDateString('en-IN')}`);
      setAssignModal(null); setAssignDate(""); load();
    } catch (err) { notify(err.response?.data?.message || "Failed to assign date", "error"); }
  };

  // ── Reschedule ──────────────────────────────────────────────────────────────
  const handleReschedule = async () => {
    if (!rescheduleModal?.bookingId) { notify("No booking selected for reschedule", "error"); return; }
    if (!rescheduleDate) { notify("Please select a new date", "error"); return; }
    try {
      await confirmDemoDate(rescheduleModal.bookingId, rescheduleDate);
      notify(`Demo rescheduled to ${new Date(rescheduleDate).toLocaleDateString('en-IN')}`);
      setRescheduleModal(null); setRescheduleDate(""); load();
    } catch (err) { notify(err.response?.data?.message || "Failed to reschedule", "error"); }
  };

  // ── Cancel Booking ──────────────────────────────────────────────────────────
  const handleCancel = async (booking) => {
    if (!window.confirm(`Cancel demo booking for ${booking.visitorName}?`)) return;
    try {
      await cancelDemoBooking(booking.bookingId);
      notify(`Booking #${booking.bookingId} cancelled`);
      load();
    } catch (err) { notify(err.response?.data?.message || "Failed to cancel", "error"); }
  };

  // ── Notify Visitor ──────────────────────────────────────────────────────────

  // ── Delete Visitor ──────────────────────────────────────────────────────────
  const handleDeleteVisitor = async () => {
    try {
      await deleteVisitor(deleteModal.visitorId);
      notify(`Visitor "${deleteModal.visitorName}" removed`);
      setDeleteModal(null); load();
    } catch (err) { notify(err.response?.data?.message || "Failed to delete visitor", "error"); }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="dba-root">
      {/* Toast */}
      {toast.msg && (
        <div className="dba-toast" style={{ background: toast.type === "error" ? "#ef4444" : "#22c55e" }}>
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      <div className="dba-header">
        <div>
          <p className="dba-subtitle">Manage demo bookings, dates, and visitor actions from one organized screen.</p>
        </div>
        <div className="dba-header-meta">
          <span className="dba-inline-stat">{filtered.length} visible</span>
          <span className="dba-inline-stat">{selectedBookingIds.size} selected</span>
        </div>
      </div>

      {/* Stats */}
      <div className="dba-stats">
        {[
          { label:"Total Booked",    val:stats.total          ?? "—", color:"#3e0994" },
          { label:"Confirmed/Free",  val:(stats.confirmed??0)+(stats.free??0), color:"#22c55e" },
          { label:"No Booking",      val:noBookingRows.length, color:"#f59e0b" },
          { label:"Upcoming Demo",   val:enriched.filter(b=>b.confirmedAtDate&&b.confirmedAtDate>=today&&b.status!=="CANCELLED").length, color:"#6366f1" },
          { label:"Past / Attended", val:enriched.filter(b=>b.confirmedAtDate&&b.confirmedAtDate<today&&b.status!=="CANCELLED").length, color:"#10b981" },
          { label:"Cancelled",       val:stats.cancelled      ?? "—", color:"#ef4444" },
        ].map(s => (
          <div key={s.label} className="dba-stat">
            <div className="dba-stat-val" style={{ color:s.color }}>{s.val}</div>
            <div className="dba-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="dba-tabs">
        {[
          ["all",         "All"],
          ["no-booking",  "No Booking"],
          ["unassigned",  "Awaiting Date"],
          ["upcoming",    "Upcoming Demo"],
          ["past",        "Past / Attended"],
          ["cancelled",   "Cancelled"],
        ].map(([k,l]) => (
          <button key={k} className={`dba-tab ${tab===k?"active":""}`} onClick={() => { setTab(k); setCurrentPage(0); }}>{l}</button>
        ))}
      </div>

      {/* Controls */}
      <div className="dba-toolbar-card">
        <div className="dba-controls">
          <div className="dba-controls-group">
            <input className="dba-search" placeholder="Search by name, email, phone or booking ID" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="dba-controls-group" style={{ display:"flex", gap:"0.5rem", alignItems:"center" }}>
            {!actionMode ? (
              <>
                <div style={{ position:"relative" }}>
                  <button className="dba-btn dba-btn-primary" onClick={() => setTopActionsOpen(prev => !prev)}>
                    <i className="fas fa-check-circle" /> Actions {selectedBookingIds.size > 0 && `(${selectedBookingIds.size})`}
                  </button>
                  {topActionsOpen && (
                    <div className="dba-action-menu dba-top-action-menu" onMouseLeave={() => setTopActionsOpen(false)}>
                      <button className="dba-action-item" onClick={() => { setActionMode("assign"); setTopActionsOpen(false); clearSelection(); }}>
                        <i className="fas fa-calendar-plus" /> Assign Date
                      </button>
                      <button className="dba-action-item" onClick={() => { setActionMode("reschedule"); setTopActionsOpen(false); clearSelection(); }}>
                        <i className="fas fa-calendar-alt" /> Reschedule
                      </button>
                      <button className="dba-action-item" onClick={() => { setActionMode("cancel"); setTopActionsOpen(false); clearSelection(); }}>
                        <i className="fas fa-times" /> Cancel Booking
                      </button>
                      <button className="dba-action-item" onClick={() => { setActionMode("promote"); setTopActionsOpen(false); clearSelection(); }}>
                        <i className="fas fa-user-plus" /> Promote to Member
                      </button>
                      <button className="dba-action-item" onClick={() => { setActionMode("delete"); setTopActionsOpen(false); clearSelection(); }}>
                        <i className="fas fa-user-times" /> Delete Visitor
                      </button>
                      <div style={{ borderTop:"1px solid #e2e8f0", marginTop:"0.5rem", paddingTop:"0.5rem" }}>
                        <button className="dba-action-item" onClick={() => { setNewVisitorModal(true); setTopActionsOpen(false); }}>
                          <i className="fas fa-user-plus" /> Add Visitor
                        </button>
                        <button className="dba-action-item" onClick={() => { selectAllVisible(); setTopActionsOpen(false); }}>
                          <i className="fas fa-check-square" /> Select All Visible
                        </button>
                        <button className="dba-action-item" onClick={() => { clearSelection(); setTopActionsOpen(false); }}>
                          <i className="fas fa-ban" /> Clear Selection
                        </button>
                        <button className="dba-action-item" onClick={() => { load(); setTopActionsOpen(false); }}>
                          <i className="fas fa-sync-alt" /> Refresh Data
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button className="dba-btn dba-btn-warning" style={{ minWidth:"120px" }}>
                  <i className="fas fa-check" /> {actionMode.charAt(0).toUpperCase() + actionMode.slice(1)}
                </button>
                <button className="dba-btn dba-btn-primary" onClick={handleApplyAction}>
                  <i className="fas fa-check-circle" /> Apply
                </button>
                <button className="dba-btn dba-btn-ghost" onClick={handleCancelAction}>
                  <i className="fas fa-ban" /> Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="dba-card">
        <div className="dba-table-wrap">
          {loading ? (
            <div className="dba-empty"><div className="dba-empty-icon">⏳</div><p>Loading bookings…</p></div>
          ) : filtered.length === 0 ? (
            <div className="dba-empty"><div className="dba-empty-icon">📋</div><p>No bookings found</p></div>
          ) : (
            <table className="dba-table">
              <thead>
                <tr>
                  {actionMode && <th style={{ width:"1%" }}><input type="checkbox" checked={filtered.length > 0 && filtered.every(b => selectedBookingIds.has(b.bookingId))} onChange={e => e.target.checked ? selectAllVisible() : clearSelection()} /></th>}
                  <th>#</th>
                  <th>Visitor</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Batch / Slot</th>
                  <th>Booking Status</th>
                  <th>Demo Date</th>
                  <th>Booked On</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFiltered.map((b) => (
                  <tr key={b.bookingId ?? `v-${b.visitorId}`} style={{ opacity: b._hasBooking === false ? 0.75 : 1 }}>
                    {actionMode && <td><input type="checkbox" checked={b.bookingId ? selectedBookingIds.has(b.bookingId) : false} onChange={() => b.bookingId && toggleBookingSelection(b.bookingId)} disabled={!b.bookingId} /></td>}
                    <td><strong>{b.bookingId ? `#${b.bookingId}` : <span style={{color:"#94a3b8",fontSize:"0.78rem"}}>No booking</span>}</strong></td>
                    <td>
                      <div className="dba-cell-title">{b.visitorName}</div>
                      <div className="dba-cell-sub">{b.visitorEmail || "—"}</div>
                    </td>
                    <td>{b.visitorPhone || "—"}</td>
                    <td><span className="dba-role-pill">{b.visitor?.role || "VISITOR"}</span></td>
                    <td>
                      <div className="dba-cell-title dba-accent-text">{b.batchType}</div>
                      <div className="dba-cell-sub">{b.slotType} {b.startTime ? `· ${b.startTime}–${b.endTime}` : ""}</div>
                      {b.couponUsed && <div className="dba-cell-meta">{b.couponUsed}</div>}
                    </td>
                    <td>
                      {b._hasBooking === false
                        ? <span className="dba-badge dba-badge-unassigned">No Booking</span>
                        : statusBadge(b.status)
                      }
                    </td>
                    <td>
                      {b._hasBooking === false ? (
                        <span className="dba-badge dba-badge-unassigned">—</span>
                      ) : b.confirmedAtDate ? (
                        <div style={{ display:"flex", flexDirection:"column", gap:"0.35rem" }}>
                          {dateBadge(b.confirmedAtDate)}
                          {b.status !== "CANCELLED" && (
                            b.visitor?.visitedAt != null
                              ? <span className="dba-badge dba-badge-confirmed" style={{fontSize:"0.72rem"}}>✅ Attended</span>
                              : <button
                                  className="dba-btn dba-btn-success"
                                  style={{ fontSize:"0.72rem", padding:"0.25rem 0.55rem" }}
                                  onClick={async () => {
                                    try {
                                      await markVisitorAttended(b.visitorId);
                                      notify(`${b.visitorName} marked as attended`);
                                      load();
                                    } catch { notify("Failed to mark attended", "error"); }
                                  }}
                                >
                                  <i className="fas fa-check" /> Mark Attended
                                </button>
                          )}
                        </div>
                      ) : b.status !== "CANCELLED" ? (
                        <input type="date" className="dba-date-input" min={todayStr}
                          onChange={async (e) => {
                            if (!e.target.value) return;
                            try {
                              await confirmDemoDate(b.bookingId, e.target.value);
                              notify(`Demo date assigned: ${new Date(e.target.value).toLocaleDateString('en-IN')}`);
                              load();
                            } catch { notify("Failed to assign date", "error"); }
                          }} placeholder="Assign date" />
                      ) : dateBadge(null)}
                    </td>
                    <td className="dba-booked-on">
                      {b.bookedAtDate ? b.bookedAtDate.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Add Visitor Modal ── */}
      {newVisitorModal && (
        <Modal title="Add New Visitor" onClose={() => setNewVisitorModal(false)}>
          <div className="dba-field">
            <label className="dba-label">Name *</label>
            <input className="dba-input" value={newVisitorName} onChange={e => setNewVisitorName(e.target.value)} placeholder="Visitor name" />
          </div>
          <div className="dba-field">
            <label className="dba-label">Email *</label>
            <input className="dba-input" type="email" value={newVisitorEmail} onChange={e => setNewVisitorEmail(e.target.value)} placeholder="visitor@example.com" />
          </div>
          <div className="dba-field">
            <label className="dba-label">Phone *</label>
            <input className="dba-input" type="tel" value={newVisitorPhone} onChange={e => setNewVisitorPhone(e.target.value)} placeholder="10-digit phone number" />
          </div>
          <div className="dba-field">
            <label className="dba-label">Gym Center</label>
            <input className="dba-input" value={newVisitorGymCenter} onChange={e => setNewVisitorGymCenter(e.target.value)} placeholder="Gym branch or center" />
          </div>
          <div className="dba-field">
            <label className="dba-label">Password</label>
            <PasswordField
              value={newVisitorPassword}
              onChange={e => setNewVisitorPassword(e.target.value)}
              placeholder="Optional — leave blank to let visitor set via Forgot Password"
              inputClassName="dba-input"
            />
          </div>
          <div style={{ background:"#eff6ff", borderRadius:8, padding:"0.95rem", marginBottom:"1rem", fontSize:"0.88rem", color:"#1e40af" }}>
            <strong>SMS will be sent automatically:</strong><br />
            • With password → visitor receives login email + password via SMS<br />
            • Without password → visitor receives SMS to set password via Forgot Password
          </div>
          <div style={{ display:"flex", gap:"0.75rem" }}>
            <button className="dba-btn dba-btn-primary" style={{ flex:1, padding:"0.75rem" }} onClick={handleAddVisitor}>
              <i className="fas fa-user-plus" /> Create Visitor
            </button>
            <button className="dba-btn dba-btn-ghost" style={{ flex:1, padding:"0.75rem" }} onClick={() => { setNewVisitorModal(false); resetNewVisitorForm(); }}>
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* ── Assign Date Modal ── */}
      {assignModal && (
        <Modal title="Assign Demo Date" onClose={() => setAssignModal(null)}>
          <div className="dba-visitor-info">
            <div><strong>Visitor:</strong> {assignModal.visitorName}</div>
            <div><strong>Email:</strong> {assignModal.visitorEmail || "—"}</div>
            <div><strong>Phone:</strong> {assignModal.visitorPhone || "—"}</div>
            <div><strong>Booking #:</strong> {assignModal.bookingId}</div>
            <div><strong>Status:</strong> {assignModal.status}</div>
          </div>
          <div className="dba-field">
            <label className="dba-label">Select Demo Date *</label>
            <input type="date" className="dba-input" value={assignDate} min={todayStr} onChange={e => setAssignDate(e.target.value)} />
          </div>
          <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.5rem" }}>
            <button className="dba-btn dba-btn-primary" style={{ flex:1, padding:"0.75rem" }} onClick={handleAssignDate}>
              <i className="fas fa-calendar-check" /> Assign Date
            </button>
            <button className="dba-btn dba-btn-ghost" style={{ flex:1, padding:"0.75rem" }} onClick={() => setAssignModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* ── Reschedule Modal ── */}
      {rescheduleModal && (
        <Modal title="Reschedule Demo" onClose={() => setRescheduleModal(null)}>
          <div className="dba-visitor-info">
            <div><strong>Visitor:</strong> {rescheduleModal.visitorName}</div>
            <div><strong>Current Date:</strong> {rescheduleModal.confirmedAtDate ? rescheduleModal.confirmedAtDate.toLocaleDateString('en-IN') : "Not set"}</div>
          </div>
          <div className="dba-field">
            <label className="dba-label">New Demo Date *</label>
            <input type="date" className="dba-input" value={rescheduleDate} min={todayStr} onChange={e => setRescheduleDate(e.target.value)} />
          </div>
          <div style={{ background:"#ecfdf5", borderRadius:8, padding:"0.75rem", marginBottom:"1rem", fontSize:"0.85rem", color:"#166534" }}>
            ✅ Visitor will be notified automatically by SMS and dashboard message when the demo date is updated.
          </div>
          <div style={{ display:"flex", gap:"0.75rem" }}>
            <button className="dba-btn dba-btn-warning" style={{ flex:1, padding:"0.75rem" }} onClick={handleReschedule}>
              <i className="fas fa-calendar-alt" /> Reschedule
            </button>
            <button className="dba-btn dba-btn-ghost" style={{ flex:1, padding:"0.75rem" }} onClick={() => setRescheduleModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* ── Notify Modal ── */}

      {/* ── Delete Visitor Modal ── */}
      {deleteModal && (
        <Modal title="Delete Visitor" onClose={() => setDeleteModal(null)}>
          <div style={{ textAlign:"center", padding:"1rem 0" }}>
            <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>⚠️</div>
            <p style={{ fontWeight:600, color:"#1e293b", marginBottom:"0.5rem" }}>
              Are you sure you want to delete visitor <strong>"{deleteModal.visitorName}"</strong>?
            </p>
            <p style={{ color:"#64748b", fontSize:"0.88rem", marginBottom:"1.5rem" }}>
              This will permanently remove the visitor and their booking data. This action cannot be undone.
            </p>
          </div>
          <div style={{ display:"flex", gap:"0.75rem" }}>
            <button className="dba-btn dba-btn-danger" style={{ flex:1, padding:"0.75rem" }} onClick={handleDeleteVisitor}>
              <i className="fas fa-trash" /> Yes, Delete Visitor
            </button>
            <button className="dba-btn dba-btn-ghost" style={{ flex:1, padding:"0.75rem" }} onClick={() => setDeleteModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
