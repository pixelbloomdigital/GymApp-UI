import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api/axios";
import { getPlans } from "./api/coreService";
import { getActiveAnnouncements } from "./api/announcementService";

// Parse Java LocalDateTime array [year,month,day,hour,min,sec] or ISO string
function parseDateTime(val) {
  if (!val) return null;
  if (Array.isArray(val)) {
    const [y, mo, d, h = 0, mi = 0, s = 0] = val;
    return new Date(y, mo - 1, d, h, mi, s);
  }
  return new Date(val);
}

function formatDateTime(val) {
  const dt = parseDateTime(val);
  if (!dt || isNaN(dt)) return "—";
  return dt.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function parseCostumeSizes(rawSize) {
  const parsed = String(rawSize || "")
    .split(/[,/|]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : ["S", "M", "L", "XL", "XXL", "FREE SIZE"];
}

const REGISTERED_EVENTS_KEY = "visitor-registered-events";
const PURCHASED_COSTUMES_KEY = "booker-purchased-costumes";

function getRegisteredEvents(visitorId) {
  if (!visitorId) return [];
  try {
    const stored = localStorage.getItem(`${REGISTERED_EVENTS_KEY}:${visitorId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRegisteredEvent(visitorId, event) {
  if (!visitorId || !event?.id) return;

  const entry = {
    id: `event-${event.id}`,
    eventId: event.id,
    bookingType: "EVENT",
    title: event.title || event.name || "Event",
    description: event.description || "",
    eventDate: event.eventDate || null,
    timeSlot: event.timeSlot || "",
    venue: event.venue || "",
    price: event.price ?? null,
    status: "REGISTERED",
    registeredAt: new Date().toISOString(),
  };

  const current = getRegisteredEvents(visitorId);
  const next = [entry, ...current.filter((item) => item.eventId !== event.id)];
  localStorage.setItem(`${REGISTERED_EVENTS_KEY}:${visitorId}`, JSON.stringify(next));
}

function getPurchasedCostumeIds(bookerType, bookerId) {
  if (!bookerType || !bookerId) return [];
  try {
    const stored = localStorage.getItem(`${PURCHASED_COSTUMES_KEY}:${bookerType}:${bookerId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePurchasedCostumeId(bookerType, bookerId, costumeId) {
  if (!bookerType || !bookerId || !costumeId) return;
  const current = getPurchasedCostumeIds(bookerType, bookerId).map(Number);
  const next = Array.from(new Set([Number(costumeId), ...current]));
  localStorage.setItem(`${PURCHASED_COSTUMES_KEY}:${bookerType}:${bookerId}`, JSON.stringify(next));
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = {
  root: {
    display: "flex", minHeight: "100vh",
    fontFamily: "'Poppins', sans-serif", background: "#f0f6ff",
  },
  sidebar: {
    width: 260, background: "#fff", display: "flex",
    flexDirection: "column", position: "fixed", top: 0, left: 0,
    height: "100vh", zIndex: 100,
    borderRight: "1px solid rgba(59,130,246,0.18)",
    boxShadow: "4px 0 20px rgba(59,130,246,0.1)",
  },
  sidebarTop: {
    padding: "1.75rem 1.25rem 1.25rem",
    borderBottom: "1px solid rgba(59,130,246,0.18)",
  },
  avatar: {
    width: 48, height: 48, borderRadius: "50%",
    background: "linear-gradient(135deg,#3b82f6,#1e40af)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.4rem", flexShrink: 0,
    border: "2px solid #3b82f6",
    boxShadow: "0 0 12px rgba(59,130,246,0.35)",
  },
  userInfo: { flex: 1, overflow: "hidden" },
  userName: {
    margin: 0, fontSize: "0.95rem", fontWeight: 700,
    color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  userEmail: {
    margin: "2px 0 0", fontSize: "0.72rem", color: "#64748b",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  nav: { padding: "1.25rem 0.75rem", display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  navBtn: {
    display: "flex", alignItems: "center", gap: "0.75rem",
    padding: "0.75rem 1rem", background: "transparent", border: "none",
    color: "#1e40af", fontSize: "0.9rem", fontFamily: "'Poppins',sans-serif",
    fontWeight: 500, cursor: "pointer", borderRadius: 8,
    textAlign: "left", transition: "all 0.2s",
  },
  navBtnActive: {
    background: "rgba(59,130,246,0.12)", color: "#1e293b",
    borderLeft: "3px solid #3b82f6",
  },
  navBtnDanger: { color: "#f87171" },
  logoutBtn: {
    margin: "0 0.75rem 1.25rem",
    padding: "0.65rem 1rem",
    background: "#fff",
    border: "1px solid rgba(59,130,246,0.2)",
    borderRadius: 8, color: "#1e40af",
    fontFamily: "'Poppins',sans-serif", fontWeight: 600,
    fontSize: "0.85rem", cursor: "pointer",
  },
  main: {
    marginLeft: 260, flex: 1, padding: "2rem 2.5rem",
    overflowY: "auto", minHeight: "100vh",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: "2rem", paddingBottom: "1.25rem",
    borderBottom: "1px solid rgba(59,130,246,0.18)",
  },
  headerTitle: {
    margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#1e293b",
  },
  headerSub: { margin: "4px 0 0", fontSize: "0.85rem", color: "#64748b" },
  card: {
    background: "#fff", borderRadius: 14, overflow: "hidden",
    boxShadow: "0 4px 20px rgba(59,130,246,0.08)",
    border: "1px solid rgba(59,130,246,0.15)",
    marginBottom: "1.25rem",
  },
  cardHeader: {
    background: "linear-gradient(135deg,#3b82f6 0%,#1e40af 100%)",
    padding: "1rem 1.5rem",
  },
  cardTitle: { margin: 0, fontSize: "1rem", fontWeight: 700, color: "#fff" },
  cardBody: { padding: "1.25rem 1.5rem" },
  row: { display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginBottom: "0.5rem" },
  label: { fontSize: "0.78rem", color: "#1e40af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" },
  value: { fontSize: "0.95rem", color: "#111827", fontWeight: 500 },
  badge: (color) => ({
    display: "inline-block", padding: "2px 10px", borderRadius: 20,
    fontSize: "0.75rem", fontWeight: 700,
    background: color === "green" ? "#dcfce7" : color === "red" ? "#fee2e2" : color === "yellow" ? "#fef9c3" : "#ede9fe",
    color: color === "green" ? "#16a34a" : color === "red" ? "#dc2626" : color === "yellow" ? "#ca8a04" : "#7c3aed",
  }),
  btn: (variant) => ({
    padding: "0.55rem 1.2rem", borderRadius: 8,
    fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: "0.85rem",
    cursor: "pointer", transition: "opacity 0.2s",
    background: variant === "danger"
      ? "linear-gradient(135deg,#dc2626,#b91c1c)"
      : variant === "ghost"
      ? "transparent"
      : "linear-gradient(135deg,#3b82f6,#1e40af)",
    color: variant === "ghost" ? "#1e40af" : "#fff",
    border: variant === "ghost" ? "1px solid rgba(59,130,246,0.18)" : "none",
  }),
  grid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
    gap: "1.25rem",
  },
  planCard: (selected) => ({
    borderRadius: 14, padding: "1.5rem", cursor: "pointer",
    background: "linear-gradient(145deg,#3e0994,#8e2bbd)",
    border: selected ? "3px solid #fff" : "3px solid transparent",
    transform: selected ? "scale(1.03)" : "scale(1)",
    transition: "all 0.2s", color: "#fff", position: "relative",
  }),
  eventCard: {
    background: "#fff", borderRadius: 14, overflow: "hidden",
    boxShadow: "0 4px 16px rgba(59,130,246,0.08)",
    border: "1px solid rgba(59,130,246,0.15)",
  },
  costumeCard: {
    background: "#fff", borderRadius: 14, overflow: "hidden",
    boxShadow: "0 4px 16px rgba(59,130,246,0.08)",
    border: "1px solid rgba(59,130,246,0.15)",
  },
  empty: {
    textAlign: "center", padding: "3rem 1rem",
    color: "#9ca3af", fontSize: "0.95rem",
  },
  alert: (type) => ({
    padding: "0.75rem 1rem", borderRadius: 8, marginBottom: "1rem",
    fontSize: "0.88rem", fontWeight: 500,
    background: type === "error" ? "#fee2e2" : type === "success" ? "#dcfce7" : "#ede9fe",
    color: type === "error" ? "#dc2626" : type === "success" ? "#16a34a" : "#7c3aed",
    border: `1px solid ${type === "error" ? "#fca5a5" : type === "success" ? "#86efac" : "#c4b5fd"}`,
  }),
  spinner: {
    display: "inline-block", width: 18, height: 18,
    border: "3px solid rgba(59,130,246,0.2)",
    borderTopColor: "#1e40af", borderRadius: "50%",
    animation: "spin 0.7s linear infinite", marginRight: 8,
  },
  divider: { height: 1, background: "rgba(59,130,246,0.1)", margin: "1rem 0" },
  deleteBox: {
    background: "#fff", borderRadius: 14, padding: "2.5rem",
    maxWidth: 480, margin: "0 auto", textAlign: "center",
    boxShadow: "0 4px 24px rgba(220,38,38,0.1)",
    border: "1px solid #fca5a5",
  },
};

const TABS = [
  { id: "booking",    label: "My Booking",       icon: "📋" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "book-demo",  label: "Book Demo",         icon: "🏋️" },
  { id: "plans",      label: "Membership Plans",  icon: "💳" },
  { id: "events",     label: "Events",            icon: "🎉" },
  { id: "costumes",   label: "Costume Rental",    icon: "👗" },
  { id: "delete",     label: "Delete Account",    icon: "🗑️" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const s = (status || "").toUpperCase();
  const color = s === "CONFIRMED" || s === "ACTIVE" ? "green"
    : s === "CANCELLED" || s === "REJECTED" ? "red"
    : s === "PENDING" ? "yellow" : "purple";
  return <span style={S.badge(color)}>{status || "—"}</span>;
}

// ─── Tab: Book Demo ───────────────────────────────────────────────────────────

function BookDemoTab({ visitorId, onBooked }) {
  const [slots, setSlots]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [msg, setMsg]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]         = useState({ slotId: "", couponCode: "", demoDate: "" });

  useEffect(() => {
    api.get("/api/demo/slots")
      .then(r => setSlots(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError("Failed to load available slots."))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.slotId) { setMsg("Please select a slot."); return; }
    setSubmitting(true); setMsg(""); setError("");
    try {
      const slot = slots.find(s => String(s.slotId) === String(form.slotId));
      await api.post("/api/demo/book", {
        visitorId: parseInt(visitorId),
        batchType:  slot?.batchType  || null,
        slotType:   slot?.slotType   || null,
        startTime:  slot?.startTime  || null,
        endTime:    slot?.endTime    || null,
        demoDate:   form.demoDate    || null,
        couponCode: form.couponCode  || null,
      });
      setMsg("Demo booked successfully! Check 'My Booking' tab for details.");
      setForm({ slotId: "", couponCode: "", demoDate: "" });
      if (onBooked) onBooked();
    } catch (e) {
      setMsg(e.response?.data?.message || e.response?.data || "Booking failed. Please try again.");
    } finally { setSubmitting(false); }
  };

  if (loading) return <div style={S.empty}>Loading slots…</div>;

  return (
    <div>
      <h2 style={{ color: "#1e293b", marginBottom: "0.5rem", fontWeight: 700 }}>Book a Demo Session</h2>
      <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
        Choose a batch slot and book your free demo session.
      </p>
      {error && <div style={S.alert("error")}>{error}</div>}
      {msg && (
        <div style={S.alert(msg.toLowerCase().includes("success") ? "success" : "error")}>
          {msg}
        </div>
      )}
      <div style={{ background: "#fff", borderRadius: 14, padding: "1.75rem", maxWidth: 520, boxShadow: "0 4px 20px rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem", color: "#1e40af", fontSize: "0.9rem" }}>
              Select Batch / Slot *
            </label>
            <select
              value={form.slotId}
              onChange={e => setForm(f => ({ ...f, slotId: e.target.value }))}
              style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: 8, border: "1.5px solid rgba(59,130,246,0.18)", fontSize: "0.9rem", fontFamily: "'Poppins',sans-serif", outline: "none", background: "#fff" }}
              required
            >
              <option value="">-- Choose a slot --</option>
              {slots.map(s => (
                <option key={s.slotId} value={s.slotId}>
                  {s.batchType} — {s.slotType} ({s.startTime} - {s.endTime})
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem", color: "#1e40af", fontSize: "0.9rem" }}>
              Preferred Demo Date
            </label>
            <input
              type="date"
              value={form.demoDate}
              onChange={e => setForm(f => ({ ...f, demoDate: e.target.value }))}
              style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: 8, border: "1.5px solid rgba(59,130,246,0.18)", fontSize: "0.9rem", fontFamily: "'Poppins',sans-serif", outline: "none", background: "#fff", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem", color: "#1e40af", fontSize: "0.9rem" }}>
              Coupon Code (optional)
            </label>
            <input
              type="text"
              value={form.couponCode}
              onChange={e => setForm(f => ({ ...f, couponCode: e.target.value }))}
              placeholder="e.g. FREEDEMO"
              style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: 8, border: "1.5px solid rgba(59,130,246,0.18)", fontSize: "0.9rem", fontFamily: "'Poppins',sans-serif", outline: "none", background: "#fff", boxSizing: "border-box" }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{ ...S.btn("primary"), width: "100%", padding: "0.75rem", fontSize: "0.95rem", opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? "Booking…" : "🏋️ Book Demo Session"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Tab: My Booking ─────────────────────────────────────────────────────────

function BookingTab({ visitorId }) {
  const [bookings, setBookings] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [slots, setSlots]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [cancelling, setCancelling] = useState(null);
  const [msg, setMsg]           = useState("");
  const [filterType, setFilterType] = useState("all");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [bRes, sRes] = await Promise.all([
        api.get(`/api/demo/bookings/visitor/${visitorId}`),
        api.get("/api/demo/slots"),
      ]);
      setBookings(Array.isArray(bRes.data) ? bRes.data : []);
      setSlots(Array.isArray(sRes.data) ? sRes.data : []);
      setRegisteredEvents(getRegisteredEvents(visitorId));
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load bookings.");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (visitorId) load(); }, [visitorId]);

  const slotMap = {};
  slots.forEach(s => { slotMap[s.slotId] = s; });

  const cancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    setCancelling(id); setMsg("");
    try {
      await api.delete(`/api/demo/bookings/${id}/visitor`);
      setMsg("Booking cancelled successfully.");
      load();
    } catch (e) {
      setMsg(e.response?.data?.message || "Failed to cancel booking.");
    } finally { setCancelling(null); }
  };

  if (loading) return <div style={S.empty}>Loading bookings…</div>;
  if (error)   return <div style={S.alert("error")}>{error}</div>;

  const bookingEntries = [
    ...bookings.map((booking) => ({
      kind: "booking",
      sortKey: parseDateTime(booking.confirmedAt || booking.bookedAt)?.getTime?.() || 0,
      booking,
    })),
    ...registeredEvents.map((event) => ({
      kind: "event",
      sortKey: parseDateTime(event.registeredAt || event.eventDate)?.getTime?.() || 0,
      event,
    })),
  ].sort((a, b) => b.sortKey - a.sortKey);

  const filteredEntries = bookingEntries.filter((entry) => {
    if (filterType === "all") return true;
    if (filterType === "event") return entry.kind === "event";
    if (entry.kind !== "booking") return false;

    const status = (entry.booking?.status || "").toUpperCase();
    if (filterType === "cancelled") {
      return status === "CANCELLED" || status === "REJECTED";
    }
    if (filterType === "booked") {
      return status !== "CANCELLED" && status !== "REJECTED";
    }
    return true;
  });

  return (
    <div>
      <h2 style={{ color: "#1e293b", marginBottom: "1.25rem", fontWeight: 700 }}>My Bookings</h2>
      <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.7rem", flexWrap: "wrap" }}>
        <label style={{ ...S.label, marginBottom: 0 }}>Filter</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: 8,
            border: "1px solid rgba(59,130,246,0.25)",
            fontSize: "0.9rem",
            color: "#1e293b",
            background: "#fff",
            fontFamily: "'Poppins',sans-serif",
          }}
        >
          <option value="all">All</option>
          <option value="booked">Booked</option>
          <option value="cancelled">Cancelled</option>
          <option value="event">Event</option>
        </select>
      </div>
      {msg && <div style={S.alert(msg.includes("success") ? "success" : "error")}>{msg}</div>}
      {filteredEntries.length === 0 ? (
        <div style={S.empty}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📋</div>
          <p>No bookings found for this filter. Try a different booking type.</p>
        </div>
      ) : (
        filteredEntries.map((entry) => {
          if (entry.kind === "event") {
            const event = entry.event;
            return (
              <div key={event.id} style={S.card}>
                <div style={S.cardHeader}>
                  <p style={S.cardTitle}>Registered Event</p>
                </div>
                <div style={S.cardBody}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem 1.5rem" }}>
                    <div>
                      <div style={S.label}>Event</div>
                      <div style={S.value}>{event.title}</div>
                    </div>
                    <div>
                      <div style={S.label}>Status</div>
                      <StatusBadge status={event.status} />
                    </div>
                    {event.eventDate && (
                      <div>
                        <div style={S.label}>Event Date</div>
                        <div style={S.value}>{formatDateTime(event.eventDate)}</div>
                      </div>
                    )}
                    {event.timeSlot && (
                      <div>
                        <div style={S.label}>Time Slot</div>
                        <div style={S.value}>{event.timeSlot}</div>
                      </div>
                    )}
                    {event.venue && (
                      <div>
                        <div style={S.label}>Venue</div>
                        <div style={S.value}>{event.venue}</div>
                      </div>
                    )}
                    {event.registeredAt && (
                      <div>
                        <div style={S.label}>Registered At</div>
                        <div style={S.value}>{formatDateTime(event.registeredAt)}</div>
                      </div>
                    )}
                  </div>
                  {event.description && (
                    <p style={{ marginTop: "1rem", marginBottom: 0, color: "#475569", lineHeight: 1.6 }}>
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            );
          }

          const b = entry.booking;
          const slot = slotMap[b.slotId] || {};
          const canCancel = !["CANCELLED","REJECTED"].includes((b.status || "").toUpperCase());
          return (
            <div key={b.bookingId} style={S.card}>
              <div style={S.cardHeader}>
                <p style={S.cardTitle}>Booking #{b.bookingId}</p>
              </div>
              <div style={S.cardBody}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem 1.5rem" }}>
                  <div>
                    <div style={S.label}>Batch Type</div>
                    <div style={S.value}>{slot.batchType || b.batchType || "—"}</div>
                  </div>
                  <div>
                    <div style={S.label}>Slot Type</div>
                    <div style={S.value}>{slot.slotType || b.slotType || "—"}</div>
                  </div>
                  <div>
                    <div style={S.label}>Time</div>
                    <div style={S.value}>{slot.startTime || b.startTime || "—"}</div>
                  </div>
                  {b.demoDate && (
                    <div>
                      <div style={S.label}>Demo Date</div>
                      <div style={S.value}>{formatDateTime(b.demoDate)}</div>
                    </div>
                  )}
                  <div>
                    <div style={S.label}>Status</div>
                    <StatusBadge status={b.status} />
                  </div>
                  {b.confirmedAt && (
                    <div>
                      <div style={S.label}>Confirmed At</div>
                      <div style={S.value}>{formatDateTime(b.confirmedAt)}</div>
                    </div>
                  )}
                  {b.bookedAt && (
                    <div>
                      <div style={S.label}>Booked At</div>
                      <div style={S.value}>{formatDateTime(b.bookedAt)}</div>
                    </div>
                  )}
                </div>
                {canCancel && (
                  <div style={{ marginTop: "1rem" }}>
                    <button
                      style={S.btn("danger")}
                      disabled={cancelling === b.bookingId}
                      onClick={() => cancel(b.bookingId)}
                    >
                      {cancelling === b.bookingId ? "Cancelling…" : "Cancel Booking"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Tab: Notifications ─────────────────────────────────────────────────────

function NotificationsTab({ visitorId }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.allSettled([
      api.get(`/api/visitors/${visitorId}/notifications`),
      getActiveAnnouncements(),
    ])
      .then(([visitorNotesRes, announcementsRes]) => {
        const visitorNotes = visitorNotesRes.status === "fulfilled" && Array.isArray(visitorNotesRes.value?.data)
          ? visitorNotesRes.value.data
          : [];

        const activeAnnouncements = announcementsRes.status === "fulfilled" && Array.isArray(announcementsRes.value?.data)
          ? announcementsRes.value.data
          : [];

        const visitorAnnouncements = activeAnnouncements
          .filter((a) => {
            const audience = String(a?.targetAudience || "ALL").toUpperCase();
            // No VISITORS enum exists in backend; visitors can see ALL and MEMBERS-targeted notices.
            return audience === "ALL" || audience === "MEMBERS";
          })
          .map((a) => ({
            id: `announcement-${a.id}`,
            type: a.type || "Announcement",
            message: a.message || "",
            createdAt: a.createdAt,
            source: "announcement",
            title: a.title || "Announcement",
          }));

        const visitorSystemNotes = visitorNotes.map((n) => ({
          ...n,
          id: n.id ?? `notification-${Math.random()}`,
          source: "notification",
        }));

        const merged = [...visitorSystemNotes, ...visitorAnnouncements]
          .sort((a, b) => {
            const aTime = parseDateTime(a?.createdAt)?.getTime() || 0;
            const bTime = parseDateTime(b?.createdAt)?.getTime() || 0;
            return bTime - aTime;
          });

        setNotifications(merged);

        if (visitorNotesRes.status === "rejected" && announcementsRes.status === "rejected") {
          setError("Failed to load notifications.");
        }
      })
      .catch(() => setError("Failed to load notifications."))
      .finally(() => setLoading(false));
  }, [visitorId]);

  if (loading) return <div style={S.empty}>Loading notifications…</div>;
  if (error) return <div style={S.alert("error")}>{error}</div>;

  return (
    <div>
      <h2 style={{ color: "#1e293b", marginBottom: "0.75rem", fontWeight: 700 }}>Notifications</h2>
      {notifications.length === 0 ? (
        <div style={S.empty}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🔔</div>
          <p>No notifications yet. Any schedule or membership updates will appear here.</p>
        </div>
      ) : (
        notifications.map(note => (
          <div key={note.id} style={{ ...S.card, marginBottom: "1rem" }}>
            <div style={S.cardBody}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <div style={{ fontWeight: 700, color: "#111827" }}>
                  {note.source === "announcement" ? (note.title || "Announcement") : (note.type || "Update")}
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.82rem" }}>{formatDateTime(note.createdAt)}</div>
              </div>
              <p style={{ color: "#334155", lineHeight: 1.6 }}>{note.message}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Tab: Membership Plans ────────────────────────────────────────────────────

function PlansTab() {
  const [plans, setPlans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [msg, setMsg]         = useState("");
  const [buying, setBuying]   = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getPlans()
      .then((p) => {
        setPlans(Array.isArray(p.data) ? p.data : []);
      })
      .catch(e => setError(e.response?.data?.message || "Failed to load plans."))
      .finally(() => setLoading(false));
  }, []);

  const purchase = async (plan) => {
    setBuying(plan.id);
    setMsg("");
    const payload = {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      durationMonths: plan.durationMonths,
      daysPerWeek: plan.daysPerWeek,
      description: plan.description || "",
    };
    localStorage.setItem("pendingMembershipPlan", JSON.stringify(payload));
    navigate("/member-dashboard/payment", { state: { membershipPlan: payload } });
    setBuying(null);
  };

  if (loading) return <div style={S.empty}>Loading plans…</div>;
  if (error)   return <div style={S.alert("error")}>{error}</div>;

  const gradients = [
    "linear-gradient(145deg,#3e0994,#8e2bbd)",
    "linear-gradient(145deg,#1d4ed8,#2563eb)",
    "linear-gradient(145deg,#7c3aed,#6d28d9)",
    "linear-gradient(145deg,#0f766e,#0d9488)",
  ];

  return (
    <div>
      <h2 style={{ color: "#1e293b", marginBottom: "0.5rem", fontWeight: 700 }}>Membership Plans</h2>
      <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
        Choose a plan from membership_plans and continue to payment when you are ready.
      </p>
      {msg && <div style={S.alert(msg.toLowerCase().includes("success") ? "success" : "error")}>{msg}</div>}
      <div style={S.grid}>
        {plans.filter(p => p.isActive !== false).map((p, i) => (
          <div key={p.id} style={{ ...S.planCard(false), background: gradients[i % gradients.length] }}>
            <div style={{ fontSize: "0.72rem", opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {p.durationMonths} month{p.durationMonths !== 1 ? "s" : ""}
              {p.daysPerWeek ? ` · ${p.daysPerWeek} days/week` : ""}
            </div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", margin: "0.5rem 0 0.25rem" }}>{p.name}</div>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>₹{Number(p.price).toLocaleString()}</div>
            {p.description && (
              <div style={{ fontSize: "0.8rem", opacity: 0.8, marginTop: "0.5rem", lineHeight: 1.5 }}>{p.description}</div>
            )}
            <button
              style={{ ...S.btn("ghost"), marginTop: "1.25rem", width: "100%", background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)" }}
              disabled={buying === p.id}
              onClick={() => purchase(p)}
            >
              {buying === p.id ? "Opening Payment…" : "Buy Membership"}
            </button>
          </div>
        ))}
        {plans.filter(p => p.isActive !== false).length === 0 && (
          <div style={{ ...S.empty, gridColumn: "1/-1" }}>No active plans available.</div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Events ──────────────────────────────────────────────────────────────

function EventsTab() {
  const visitorId = localStorage.getItem("visitorId") || localStorage.getItem("id");
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [msgs, setMsgs]       = useState({});
  const [registering, setRegistering] = useState(null);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());

  useEffect(() => {
    const persistedIds = new Set(getRegisteredEvents(visitorId).map((e) => Number(e.eventId)));
    setRegisteredEventIds(persistedIds);

    api.get("/api/public/events")
      .then(r => setEvents(Array.isArray(r.data) ? r.data : []))
      .catch(e => setError(e.response?.data?.message || "Failed to load events."))
      .finally(() => setLoading(false));
  }, [visitorId]);

  const register = async (event) => {
    if (!visitorId) {
      setMsgs(m => ({ ...m, [event.id]: "Visitor account details not found. Please log in again." }));
      return;
    }

    setRegistering(event.id);
    setMsgs(m => ({ ...m, [event.id]: "" }));
    try {
      await api.post(`/api/public/events/${event.id}/register`, {
        bookerId: visitorId ? Number(visitorId) : null,
        bookerType: "VISITOR",
        bookerName: localStorage.getItem("name") || "Visitor",
      });
      saveRegisteredEvent(visitorId, event);
      setRegisteredEventIds((prev) => new Set([...prev, Number(event.id)]));
      setMsgs(m => ({ ...m, [event.id]: "Event registration successful." }));
      setEvents(prev => prev.map(ev => ev.id === event.id
        ? { ...ev, currentRegistrations: (ev.currentRegistrations || 0) + 1 }
        : ev));
    } catch (e) {
      setMsgs(m => ({ ...m, [event.id]: e.response?.data?.message || "Failed to register for event." }));
    } finally { setRegistering(null); }
  };

  if (loading) return <div style={S.empty}>Loading events…</div>;
  if (error)   return <div style={S.alert("error")}>{error}</div>;

  return (
    <div>
      <h2 style={{ color: "#1e293b", marginBottom: "1.25rem", fontWeight: 700 }}>Upcoming Events</h2>
      {events.length === 0 ? (
        <div style={S.empty}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🎉</div>
          <p>No events scheduled right now. Check back soon!</p>
        </div>
      ) : (
        <div style={S.grid}>
          {events.map(ev => (
            <div key={ev.id} style={S.eventCard}>
              <div style={{ background: "linear-gradient(135deg,#3b82f6,#1e40af)", padding: "1rem 1.25rem" }}>
                <p style={{ margin: 0, fontWeight: 700, color: "#fff", fontSize: "1rem" }}>{ev.title || ev.name}</p>
                {ev.eventDate && (
                  <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "rgba(255,255,255,0.8)" }}>
                    {formatDateTime(ev.eventDate)}
                  </p>
                )}
              </div>
              <div style={{ padding: "1rem 1.25rem" }}>
                {ev.description && (
                  <p style={{ margin: "0 0 0.75rem", fontSize: "0.88rem", color: "#374151", lineHeight: 1.6 }}>
                    {ev.description}
                  </p>
                )}
                {ev.venue && (
                  <p style={{ margin: "0 0 0.75rem", fontSize: "0.82rem", color: "#6b7280" }}>
                    📍 {ev.venue}
                  </p>
                )}
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={S.badge("yellow")}>{String(ev.eventType || "EVENT")}</span>
                  <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                    Registered: {ev.currentRegistrations || 0}{ev.maxParticipants ? ` / ${ev.maxParticipants}` : ""}
                  </span>
                </div>
                {msgs[ev.id] && (
                  <div style={{ ...S.alert(msgs[ev.id].toLowerCase().includes("successful") ? "success" : "error"), marginBottom: "0.75rem" }}>{msgs[ev.id]}</div>
                )}
                {registeredEventIds.has(Number(ev.id)) && !msgs[ev.id] && (
                  <div style={{ ...S.alert("success"), marginBottom: "0.75rem" }}>
                    You have already registered for this event.
                  </div>
                )}
                <button
                  style={S.btn("primary")}
                  disabled={registering === ev.id || registeredEventIds.has(Number(ev.id))}
                  onClick={() => register(ev)}
                >
                  {registeredEventIds.has(Number(ev.id)) ? "Already Registered" : registering === ev.id ? "Registering…" : "Register Event"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Costume Rental ──────────────────────────────────────────────────────

function CostumesTab() {
  const visitorId = localStorage.getItem("visitorId") || localStorage.getItem("id");
  const [costumes, setCostumes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [msgs, setMsgs]         = useState({});
  const [booking, setBooking]   = useState(null);
  const [selectedSizeByCostume, setSelectedSizeByCostume] = useState({});
  const [visitorProfile, setVisitorProfile] = useState({
    name: localStorage.getItem("name") || "Visitor",
    phone: localStorage.getItem("phone") || "",
    address: localStorage.getItem("address") || "",
  });
  const [purchasedCostumeIds, setPurchasedCostumeIds] = useState(new Set());

  useEffect(() => {
    api.get("/api/public/costumes")
      .then(r => setCostumes(Array.isArray(r.data) ? r.data : []))
      .catch(e => setError(e.response?.data?.message || "Failed to load costumes."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!visitorId) return;

    api.get(`/api/visitors/${visitorId}`)
      .then((r) => {
        const data = r.data || {};
        setVisitorProfile({
          name: data.name || localStorage.getItem("name") || "Visitor",
          phone: data.phone || localStorage.getItem("phone") || "",
          address: data.address || localStorage.getItem("address") || "",
        });
      })
      .catch(() => {
        setVisitorProfile({
          name: localStorage.getItem("name") || "Visitor",
          phone: localStorage.getItem("phone") || "",
          address: localStorage.getItem("address") || "",
        });
      });

    const localPurchased = getPurchasedCostumeIds("VISITOR", visitorId).map(Number);
    api.get("/api/public/costumes/my-bookings", {
      params: { bookerId: Number(visitorId), bookerType: "VISITOR" },
    })
      .then((r) => {
        const bookings = Array.isArray(r.data) ? r.data : [];
        const activeBookingIds = bookings
          .filter((b) => String(b?.status || "").toUpperCase() !== "CANCELLED")
          .map((b) => Number(b.costumeId))
          .filter((id) => Number.isFinite(id));

        const merged = Array.from(new Set([...localPurchased, ...activeBookingIds]));
        setPurchasedCostumeIds(new Set(merged));
        localStorage.setItem(`${PURCHASED_COSTUMES_KEY}:VISITOR:${visitorId}`, JSON.stringify(merged));
      })
      .catch(() => {
        setPurchasedCostumeIds(new Set(localPurchased));
      });
  }, [visitorId]);

  const book = async (costume) => {
    if (!visitorId) {
      setMsgs((m) => ({ ...m, [costume.id]: "Visitor account details not found. Please log in again." }));
      return;
    }

    const selectedSize = (selectedSizeByCostume[costume.id] || "").trim();
    if (!selectedSize) {
      setMsgs((m) => ({ ...m, [costume.id]: "Please select a costume size." }));
      return;
    }

    const today = new Date();
    const returnDate = new Date(today);
    returnDate.setDate(today.getDate() + 1);
    const toISO = (d) => d.toISOString().split("T")[0];

    setBooking(costume.id);
    setMsgs(m => ({ ...m, [costume.id]: "" }));
    try {
      await api.post("/api/public/costumes/book", {
        costumeId: costume.id,
        bookerId: visitorId ? Number(visitorId) : null,
        bookerType: "VISITOR",
        bookerName: visitorProfile?.name || localStorage.getItem("name") || "Visitor",
        bookerPhone: visitorProfile?.phone || localStorage.getItem("phone") || "",
        bookerAddress: visitorProfile?.address || localStorage.getItem("address") || "",
        selectedSize,
        pickupDate: toISO(today),
        returnDate: toISO(returnDate),
      });
      savePurchasedCostumeId("VISITOR", visitorId, costume.id);
      setPurchasedCostumeIds((prev) => new Set([...prev, Number(costume.id)]));
      setMsgs(m => ({ ...m, [costume.id]: "Costume booking created. Complete payment to confirm." }));
    } catch (e) {
      setMsgs(m => ({ ...m, [costume.id]: e.response?.data?.message || "Booking failed. Please try again." }));
    } finally { setBooking(null); }
  };

  if (loading) return <div style={S.empty}>Loading costumes…</div>;
  if (error)   return <div style={S.alert("error")}>{error}</div>;

  return (
    <div>
      <h2 style={{ color: "#1e293b", marginBottom: "1.25rem", fontWeight: 700 }}>Costume Rental</h2>
      {costumes.length === 0 ? (
        <div style={S.empty}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>👗</div>
          <p>No costumes available for rental right now.</p>
        </div>
      ) : (
        <div style={S.grid}>
          {costumes.map(c => (
            <div key={c.id} style={S.costumeCard}>
              {c.imageUrl && (
                <img
                  src={c.imageUrl} alt={c.name}
                  style={{ width: "100%", height: 160, objectFit: "cover" }}
                />
              )}
              <div style={{ padding: "1rem 1.25rem" }}>
                <p style={{ margin: "0 0 0.25rem", fontWeight: 700, fontSize: "1rem", color: "#111827" }}>{c.name}</p>
                {c.description && (
                  <p style={{ margin: "0 0 0.5rem", fontSize: "0.83rem", color: "#6b7280", lineHeight: 1.5 }}>{c.description}</p>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  {c.rentalPrice != null && (
                    <span style={{ fontWeight: 700, color: "#3e0994", fontSize: "1.1rem" }}>
                      ₹{Number(c.rentalPrice).toLocaleString()}
                    </span>
                  )}
                  <span style={S.badge((c.availableQuantity || 0) > 0 ? "green" : "red")}>
                    {(c.availableQuantity || 0) > 0 ? "Available" : "Unavailable"}
                  </span>
                </div>
                <div style={{ marginBottom: "0.75rem" }}>
                  <label style={{ ...S.label, marginBottom: "0.35rem" }}>Select Size *</label>
                  <select
                    style={S.input}
                    value={selectedSizeByCostume[c.id] || ""}
                    onChange={(e) => setSelectedSizeByCostume((prev) => ({ ...prev, [c.id]: e.target.value }))}
                    disabled={purchasedCostumeIds.has(Number(c.id))}
                  >
                    <option value="">-- Select size --</option>
                    {parseCostumeSizes(c.size).map((sz) => (
                      <option key={sz} value={sz}>{sz}</option>
                    ))}
                  </select>
                </div>
                {msgs[c.id] && (
                  <div style={{ ...S.alert(msgs[c.id].includes("success") ? "success" : "error"), marginBottom: "0.75rem" }}>
                    {msgs[c.id]}
                  </div>
                )}
                <button
                  style={S.btn("primary")}
                  disabled={booking === c.id || (c.availableQuantity || 0) < 1 || purchasedCostumeIds.has(Number(c.id))}
                  onClick={() => book(c)}
                >
                  {purchasedCostumeIds.has(Number(c.id)) ? "Already Purchased" : booking === c.id ? "Booking…" : "Costume - Buy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Delete Account ──────────────────────────────────────────────────────

function DeleteTab({ visitorId, navigate }) {
  const [confirmed, setConfirmed] = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [error, setError]         = useState("");

  const handleDelete = async () => {
    if (!confirmed) return;
    setDeleting(true); setError("");
    try {
      await api.delete(`/api/visitors/${visitorId}/self`);
      localStorage.clear();
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to delete account. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <div>
      <h2 style={{ color: "#1e293b", marginBottom: "1.25rem", fontWeight: 700 }}>Delete Account</h2>
      <div style={S.deleteBox}>
        <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>⚠️</div>
        <h3 style={{ margin: "0 0 0.75rem", color: "#dc2626", fontWeight: 700 }}>Delete Your Account</h3>
        <p style={{ color: "#6b7280", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          This action is <strong>permanent and irreversible</strong>. All your bookings, data, and account information will be deleted immediately.
        </p>
        {error && <div style={{ ...S.alert("error"), marginBottom: "1rem" }}>{error}</div>}
        <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", justifyContent: "center", marginBottom: "1.5rem", cursor: "pointer", fontSize: "0.9rem", color: "#374151" }}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: "#dc2626" }}
          />
          I understand this action cannot be undone
        </label>
        <button
          style={{ ...S.btn("danger"), width: "100%", padding: "0.75rem", fontSize: "0.95rem", opacity: (!confirmed || deleting) ? 0.5 : 1 }}
          disabled={!confirmed || deleting}
          onClick={handleDelete}
        >
          {deleting ? "Deleting…" : "Delete My Account"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VisitorDashboard() {
  const navigate  = useNavigate();
  const visitorId = localStorage.getItem("visitorId");
  const name      = localStorage.getItem("name") || "Visitor";
  const email     = localStorage.getItem("email") || "";

  const [activeTab, setActiveTab] = useState("booking");

  // Redirect if not logged in as visitor
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");
    if (!token || !visitorId) {
      navigate("/");
    } else if (role && role.toUpperCase() !== "VISITOR") {
      // Already a member — redirect to member dashboard
      navigate("/member-dashboard");
    }
  }, [navigate, visitorId]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const renderTab = () => {
    switch (activeTab) {
      case "booking":       return <BookingTab visitorId={visitorId} />;
      case "notifications": return <NotificationsTab visitorId={visitorId} />;
      case "book-demo":     return <BookDemoTab visitorId={visitorId} onBooked={() => setActiveTab("booking")} />;
      case "plans":         return <PlansTab />;
      case "events":        return <EventsTab />;
      case "costumes":      return <CostumesTab />;
      case "delete":        return <DeleteTab visitorId={visitorId} navigate={navigate} />;
      default:               return null;
    }
  };

  const currentTab = TABS.find(t => t.id === activeTab);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .vd-nav-btn:hover { background: rgba(59,130,246,0.12) !important; color: #1e293b !important; }
        .vd-nav-btn-danger:hover { background: rgba(220,38,38,0.15) !important; color: #f87171 !important; }
        @media (max-width: 768px) {
          .vd-sidebar { display: none !important; }
          .vd-main { margin-left: 0 !important; padding: 1rem !important; }
        }
      `}</style>

      <div style={S.root}>
        {/* Sidebar */}
        <aside className="vd-sidebar" style={S.sidebar}>
          {/* User info */}
          <div style={S.sidebarTop}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "rgba(59,130,246,0.08)", padding: "0.85rem 1rem", borderRadius: 10, border: "1px solid rgba(59,130,246,0.2)" }}>
              <div style={S.avatar}>👤</div>
              <div style={S.userInfo}>
                <p style={S.userName}>{name}</p>
                <p style={S.userEmail}>{email}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={S.nav}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`vd-nav-btn${tab.id === "delete" ? " vd-nav-btn-danger" : ""}`}
                style={{
                  ...S.navBtn,
                  ...(activeTab === tab.id ? S.navBtnActive : {}),
                  ...(tab.id === "delete" ? S.navBtnDanger : {}),
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button style={S.logoutBtn} onClick={logout}>
            🚪 Logout
          </button>
        </aside>

        {/* Main content */}
        <main className="vd-main" style={S.main}>
          {/* Header */}
          <div style={S.header}>
            <div>
              <h1 style={S.headerTitle}>
                {currentTab?.icon} {currentTab?.label}
              </h1>
              <p style={S.headerSub}>Welcome back, {name}</p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "#1e40af", background: "rgba(59,130,246,0.1)", padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(59,130,246,0.2)" }}>
                Visitor
              </span>
              <button style={{ ...S.btn("ghost"), fontSize: "0.82rem" }} onClick={logout}>
                Logout
              </button>
            </div>
          </div>

          {/* Tab content */}
          {renderTab()}
        </main>
      </div>
    </>
  );
}
