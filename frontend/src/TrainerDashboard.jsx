import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api/axios";
import { getActiveAnnouncements } from "./api/announcementService";
import { assignDietPlanByTrainer, getTrainerDietPurchases } from "./api/coreService";
import { applyLeave, getMyLeaves, deleteLeave } from "./api/authAdminService";

// ─── helpers ──────────────────────────────────────────────────────────────────
function fmtDate(val) {
  if (!val) return "—";
  const d = Array.isArray(val) ? new Date(val[0], val[1]-1, val[2]) : new Date(val);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
}
function today() { return new Date().toISOString().slice(0,10); }
function thisMonth() { return new Date().toISOString().slice(0,7); }

function parseCostumeSizes(rawSize) {
  const parsed = String(rawSize || "")
    .split(/[,/|]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : ["S", "M", "L", "XL", "XXL", "FREE SIZE"];
}

const TRAINER_PURCHASED_COSTUMES_KEY = "booker-purchased-costumes";

function getTrainerPurchasedCostumeIds(trainerId) {
  if (!trainerId) return [];
  try {
    const stored = localStorage.getItem(`${TRAINER_PURCHASED_COSTUMES_KEY}:TRAINER:${trainerId}`);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTrainerPurchasedCostumeId(trainerId, costumeId) {
  if (!trainerId || !costumeId) return;
  const current = getTrainerPurchasedCostumeIds(trainerId).map(Number);
  const next = Array.from(new Set([Number(costumeId), ...current]));
  localStorage.setItem(`${TRAINER_PURCHASED_COSTUMES_KEY}:TRAINER:${trainerId}`, JSON.stringify(next));
}

// ─── shared styles (same theme as MemberDashboard) ────────────────────────────
const S = {
  root:    { display:"flex", minHeight:"100vh", fontFamily:"'Poppins',sans-serif", background:"#f0f6ff" },
  sidebar: { width:260, background:"#fff", display:"flex", flexDirection:"column",
             position:"fixed", top:0, left:0, height:"100vh", zIndex:100,
       borderRight:"1px solid rgba(59,130,246,0.18)", boxShadow:"4px 0 20px rgba(59,130,246,0.1)" },
  sidebarTop: { padding:"1.75rem 1.25rem 1.25rem", borderBottom:"1px solid rgba(59,130,246,0.18)" },
  avatar: { width:48, height:48, borderRadius:"50%",
      background:"linear-gradient(135deg,#3b82f6,#1e40af)",
            display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:"1.4rem", flexShrink:0, border:"2px solid #3b82f6",
      boxShadow:"0 0 12px rgba(59,130,246,0.35)" },
  nav:    { padding:"1.25rem 0.75rem", display:"flex", flexDirection:"column", gap:4, flex:1, overflowY:"auto" },
  navBtn: { display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.75rem 1rem",
      background:"transparent", border:"0px solid transparent", color:"#1e40af", fontSize:"0.9rem",
            fontFamily:"'Poppins',sans-serif", fontWeight:500, cursor:"pointer",
            borderRadius:8, textAlign:"left", transition:"all 0.2s", width:"100%" },
  navBtnActive: { background:"rgba(59,130,246,0.12)", color:"#1e293b", borderLeft:"3px solid #3b82f6" },
  logoutBtn: { margin:"0 0.75rem 1.25rem", padding:"0.65rem 1rem",
         background:"#fff", border:"1px solid rgba(59,130,246,0.2)",
         borderRadius:8, color:"#1e40af", fontFamily:"'Poppins',sans-serif",
               fontWeight:600, fontSize:"0.85rem", cursor:"pointer" },
  main:   { marginLeft:260, flex:1, padding:"2rem 2.5rem", overflowY:"auto", minHeight:"100vh" },
  header: { display:"flex", alignItems:"center", justifyContent:"space-between",
      marginBottom:"2rem", paddingBottom:"1.25rem", borderBottom:"1px solid rgba(59,130,246,0.18)" },
  headerTitle: { margin:0, fontSize:"1.5rem", fontWeight:700, color:"#1e293b" },
  headerSub:   { margin:"4px 0 0", fontSize:"0.85rem", color:"#64748b" },
  statGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"1rem", marginBottom:"1.5rem" },
  statCard: { background:"#fff", borderRadius:12, padding:"1.25rem",
        border:"1px solid rgba(59,130,246,0.12)", textAlign:"center", boxShadow:"0 4px 16px rgba(59,130,246,0.07)" },
  statVal:  { fontSize:"1.8rem", fontWeight:800, color:"#1e40af", margin:"0.25rem 0 0" },
  statLbl:  { fontSize:"0.78rem", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px" },
  card: { background:"#fff", borderRadius:14, overflow:"hidden",
    boxShadow:"0 4px 20px rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.15)",
          marginBottom:"1.25rem" },
  cardHeader: { background:"linear-gradient(135deg,#3b82f6 0%,#1e40af 100%)", padding:"1rem 1.5rem" },
  cardTitle:  { margin:0, fontSize:"1rem", fontWeight:700, color:"#fff" },
  cardBody:   { padding:"1.25rem 1.5rem" },
  btn: (v) => ({
    padding:"0.6rem 1.25rem", borderRadius:8,
    fontFamily:"'Poppins',sans-serif", fontWeight:600, fontSize:"0.85rem",
    cursor:"pointer", transition:"all 0.2s",
    background: v==="danger"  ? "linear-gradient(135deg,#dc2626,#b91c1c)"
               : v==="ghost"  ? "transparent"
               : v==="green"  ? "linear-gradient(135deg,#16a34a,#15803d)"
               : v==="yellow" ? "linear-gradient(135deg,#d97706,#b45309)"
               : "linear-gradient(135deg,#3b82f6,#1e40af)",
    color: v==="ghost" ? "#1e40af" : "#fff",
    border: v==="ghost" ? "1px solid rgba(59,130,246,0.18)" : "none",
  }),
  badge: (c) => ({
    display:"inline-block", padding:"2px 10px", borderRadius:20,
    fontSize:"0.75rem", fontWeight:700,
    background: c==="green"?"#dcfce7":c==="red"?"#fee2e2":c==="yellow"?"#fef9c3":c==="blue"?"#dbeafe":"#ede9fe",
    color:       c==="green"?"#16a34a":c==="red"?"#dc2626":c==="yellow"?"#ca8a04":c==="blue"?"#1d4ed8":"#7c3aed",
  }),
  input: { width:"100%", padding:"0.65rem 0.85rem", borderRadius:8,
           border:"1.5px solid rgba(59,130,246,0.18)", fontSize:"0.9rem",
           fontFamily:"'Poppins',sans-serif", outline:"none",
           background:"#fff", color:"#1e293b", boxSizing:"border-box" },
  label: { display:"block", fontWeight:600, marginBottom:"0.4rem", color:"#1e40af", fontSize:"0.85rem" },
  alert: (t) => ({
    padding:"0.75rem 1rem", borderRadius:8, marginBottom:"1rem", fontSize:"0.88rem", fontWeight:500,
    background: t==="error"?"#fee2e2":t==="success"?"#dcfce7":"#ede9fe",
    color:       t==="error"?"#dc2626":t==="success"?"#16a34a":"#7c3aed",
    border:`1px solid ${t==="error"?"#fca5a5":t==="success"?"#86efac":"#c4b5fd"}`,
  }),
  empty: { textAlign:"center", padding:"3rem 1rem", color:"#9ca3af", fontSize:"0.95rem" },
  grid:  { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:"1.25rem" },
  th:    { padding:"0.75rem 1rem", textAlign:"left", color:"#1e40af", fontWeight:600,
           borderBottom:"1px solid rgba(59,130,246,0.18)", fontSize:"0.85rem" },
  td:    { padding:"0.75rem 1rem", color:"#334155", borderBottom:"1px solid rgba(59,130,246,0.08)", fontSize:"0.88rem" },
};

const TABS = [
  { id:"home",        label:"Dashboard",         icon:"📊" },
  { id:"session",     label:"My Sessions",       icon:"🏋️" },
  { id:"diet",        label:"Diet Plan",         icon:"🥗" },
  { id:"costumes",    label:"Costume Rental",    icon:"👗" },
  { id:"attendance",  label:"Mark Attendance",   icon:"✅" },
  { id:"members",     label:"My Members",        icon:"👥" },
  { id:"payroll",     label:"My Salary",         icon:"💰" },
  { id:"leaves",      label:"My Leaves",          icon:"📅" },
  { id:"announcements", label:"Announcements",   icon:"📢" },
];

// ─── Dashboard Home ───────────────────────────────────────────────────────────
function HomeTab({ trainerId, name }) {
  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const ym = thisMonth();
  const from = `${ym}-01`;
  const to   = today();

  useEffect(() => {
    if (!trainerId) return;
    Promise.all([
      api.get(`/api/trainer-attendance/trainer/${trainerId}/month/${ym}`),
      api.get(`/api/trainer-attendance/trainer/${trainerId}?from=${from}&to=${to}`),
    ]).then(([s, sess]) => {
      setSummary(s.data || null);
      setSessions(Array.isArray(sess.data) ? sess.data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [trainerId]);

  const todaySessions = sessions.filter(s => {
    const raw = s.date;
    const d = Array.isArray(raw) ? `${raw[0]}-${String(raw[1]).padStart(2,'0')}-${String(raw[2]).padStart(2,'0')}` : (raw||"").slice(0,10);
    return d === today();
  });

  return (
    <div>
      <div style={S.statGrid}>
        <div style={S.statCard}>
          <div style={S.statLbl}>Sessions (month)</div>
          <div style={S.statVal}>{summary?.totalSessions ?? sessions.length}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLbl}>Hours (month)</div>
          <div style={S.statVal}>{summary?.totalHours != null ? Number(summary.totalHours).toFixed(1) : "—"}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLbl}>Earnings (month)</div>
          <div style={{ ...S.statVal, fontSize:"1.2rem" }}>
            {summary?.totalEarnings != null ? `₹${Number(summary.totalEarnings).toLocaleString()}` : "—"}
          </div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLbl}>Today's Sessions</div>
          <div style={S.statVal}>{todaySessions.length}</div>
        </div>
      </div>

      {todaySessions.length > 0 && (
        <div style={S.card}>
          <div style={S.cardHeader}><p style={S.cardTitle}>Today's Sessions</p></div>
          <div style={S.cardBody}>
            {todaySessions.map((s, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                                    padding:"0.6rem 0", borderBottom:"1px solid rgba(59,130,246,0.1)" }}>
                <span style={{ color:"#334155", fontSize:"0.9rem" }}>{s.batchName || s.batchType?.name || s.batchType || `Session ${i+1}`}</span>
                <span style={S.badge(s.status==="COMPLETED"?"green":s.status==="IN_PROGRESS"?"blue":s.status==="CANCELLED"?"red":"yellow")}>
                  {s.status || "SCHEDULED"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={S.grid}>
        {TABS.slice(1).map(t => (
          <div key={t.id} style={{ background:"#fff", border:"1px solid rgba(59,130,246,0.15)",
                                   borderRadius:14, padding:"1.5rem", textAlign:"center", color:"#1e293b", boxShadow:"0 4px 16px rgba(59,130,246,0.07)" }}>
            <div style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>{t.icon}</div>
            <div style={{ fontWeight:600, fontSize:"0.9rem", color:"#1e40af" }}>{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── My Sessions (mark session start/end + history) ───────────────────────────
function SessionTab({ trainerId }) {
  const [sessions, setSessions] = useState([]);
  const [batches,  setBatches]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [msg,      setMsg]      = useState("");
  const [starting, setStarting] = useState(false);
  const [ending,   setEnding]   = useState(null);
  const [form,     setForm]     = useState({ batchId:"" });
  const [dateRange, setDateRange] = useState({ from:`${thisMonth()}-01`, to:today() });

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get(`/api/trainer-attendance/trainer/${trainerId}?from=${dateRange.from}&to=${dateRange.to}`),
      api.get("/api/batches"),
    ]).then(([s, b]) => {
      setSessions(Array.isArray(s.data) ? s.data : []);
      setBatches(Array.isArray(b.data) ? b.data : []);
    }).catch(() => setMsg("Failed to load sessions."))
    .finally(() => setLoading(false));
  };

  useEffect(() => { if (trainerId) load(); }, [trainerId, dateRange.from, dateRange.to]);

  const startSession = async () => {
    if (!form.batchId) { setMsg("Please select a batch."); return; }
    setStarting(true); setMsg("");
    try {
      await api.post("/api/trainer-attendance/session-start", {
        trainerId: parseInt(trainerId),
        batchId:   parseInt(form.batchId),
      });
      setMsg("Session started successfully!");
      setForm({ batchId:"" });
      load();
    } catch(e) { setMsg(e.response?.data?.message || "Failed to start session."); }
    finally { setStarting(false); }
  };

  const endSession = async (sessionId) => {
    setEnding(sessionId); setMsg("");
    try {
      await api.post(`/api/trainer-attendance/session-end?sessionId=${sessionId}`);
      setMsg("Session ended successfully!");
      load();
    } catch(e) { setMsg(e.response?.data?.message || "Failed to end session."); }
    finally { setEnding(null); }
  };

  const inProgress = sessions.find(s => s.status === "IN_PROGRESS");

  return (
    <div>
      <h2 style={{ color:"#1e293b", marginBottom:"1rem", fontWeight:700 }}>My Sessions</h2>
      {msg && <div style={S.alert(msg.toLowerCase().includes("success")?"success":"error")}>{msg}</div>}

      {/* Mark session */}
      <div style={{ background:"#fff", borderRadius:14, padding:"1.5rem", marginBottom:"1.5rem",
                    border:"1px solid rgba(59,130,246,0.15)", boxShadow:"0 4px 16px rgba(59,130,246,0.07)" }}>
        <p style={{ color:"#1e293b", fontWeight:700, marginBottom:"1rem", fontSize:"0.95rem" }}>
          {inProgress ? "⏱️ Session In Progress — End it below" : "▶️ Start Today's Session"}
        </p>

        {!inProgress ? (
          <div style={{ display:"flex", flexWrap:"wrap", gap:"1rem", alignItems:"flex-end" }}>
            <div style={{ flex:"1 1 180px" }}>
              <label style={S.label}>Batch *</label>
              <select value={form.batchId} onChange={e=>setForm(f=>({...f,batchId:e.target.value}))} style={S.input}>
                <option value="">-- Select batch --</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.type} — {b.timeSlot}</option>
                ))}
              </select>
            </div>
            <button style={S.btn("green")} onClick={startSession} disabled={starting}>
              {starting ? "Starting…" : "▶ Start Session"}
            </button>
          </div>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
            <span style={{ color:"#334155", fontSize:"0.9rem" }}>
              Batch: <strong>{inProgress.batchType?.name || inProgress.batchName || `#${inProgress.sessionId}`}</strong>
            </span>
            <span style={S.badge("blue")}>IN PROGRESS</span>
            <button style={S.btn("danger")} onClick={()=>endSession(inProgress.sessionId)} disabled={ending===inProgress.sessionId}>
              {ending===inProgress.sessionId ? "Ending…" : "⏹ End Session"}
            </button>
          </div>
        )}
      </div>

      {/* Date filter */}
      <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", alignItems:"center", marginBottom:"1.25rem" }}>
        <div>
          <label style={S.label}>From</label>
          <input type="date" value={dateRange.from} style={{ ...S.input, width:"auto" }}
            onChange={e=>setDateRange(r=>({...r,from:e.target.value}))} />
        </div>
        <div>
          <label style={S.label}>To</label>
          <input type="date" value={dateRange.to} style={{ ...S.input, width:"auto" }}
            onChange={e=>setDateRange(r=>({...r,to:e.target.value}))} />
        </div>
      </div>

      {loading ? <div style={S.empty}>Loading…</div> : sessions.length === 0 ? (
        <div style={S.empty}>No sessions found for this period.</div>
      ) : (
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"rgba(59,130,246,0.1)" }}>
                {["Date","Batch","Start","End","Hours","Earnings","Status"].map(h=>(
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s,i) => (
                <tr key={s.sessionId || i}>
                  <td style={S.td}>{fmtDate(s.date)}</td>
                  <td style={S.td}>{s.batchName || s.batchType?.name || s.batchType || "—"}</td>
                  <td style={S.td}>{s.sessionStartTime || "—"}</td>
                  <td style={S.td}>{s.sessionEndTime || "—"}</td>
                  <td style={S.td}>{s.hoursWorked != null ? Number(s.hoursWorked).toFixed(1) : "—"}</td>
                  <td style={S.td}>{s.sessionEarnings != null ? `₹${Number(s.sessionEarnings).toLocaleString()}` : "—"}</td>
                  <td style={S.td}>
                    <span style={S.badge(s.status==="COMPLETED"?"green":s.status==="IN_PROGRESS"?"blue":s.status==="CANCELLED"?"red":"yellow")}>
                      {s.status || "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DietPlanTab({ trainerId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningFor, setAssigningFor] = useState(null);
  const [msg, setMsg] = useState("");
  const [formByMember, setFormByMember] = useState({});

  const load = async () => {
    if (!trainerId) {
      setMembers([]);
      return;
    }
    const r = await getTrainerDietPurchases(trainerId);
    setMembers(Array.isArray(r.data) ? r.data : []);
  };

  useEffect(() => {
    setLoading(true);
    load()
      .catch(() => setMsg("Failed to load purchased diet plans."))
      .finally(() => setLoading(false));
  }, [trainerId]);

  const updateForm = (memberId, field, value) => {
    setFormByMember((prev) => ({
      ...prev,
      [memberId]: {
        planTitle: prev[memberId]?.planTitle || "",
        planDetails: prev[memberId]?.planDetails || "",
        [field]: value,
      },
    }));
  };

  const assignPlan = async (member) => {
    const form = formByMember[member.memberId] || { planTitle: "", planDetails: "" };
    if (!form.planTitle.trim() || !form.planDetails.trim()) {
      setMsg(`Please provide title and details for ${member.memberName || "member"}.`);
      return;
    }

    setAssigningFor(member.memberId);
    setMsg("");
    try {
      await assignDietPlanByTrainer({
        trainerId: Number(trainerId),
        memberId: member.memberId,
        planTitle: form.planTitle,
        planDetails: form.planDetails,
      });
      setMsg(`Diet plan assigned to ${member.memberName || "member"}.`);
      await load();
    } catch (e) {
      setMsg(e.response?.data?.message || "Failed to assign diet plan.");
    } finally {
      setAssigningFor(null);
    }
  };

  if (loading) return <div style={S.empty}>Loading diet purchases…</div>;

  return (
    <div>
      <h2 style={{ color:"#1e293b", marginBottom:"1rem", fontWeight:700 }}>Diet Plan Assignment</h2>
      <p style={{ color:"#64748b", marginBottom:"1rem", fontSize:"0.9rem" }}>
        Members who purchased diet plan are listed below. Assign their plan from this section.
      </p>
      {msg && <div style={S.alert(msg.toLowerCase().includes("assigned") ? "success" : "error")}>{msg}</div>}

      {members.length === 0 ? (
        <div style={S.empty}>No purchased diet plans found for your active batches.</div>
      ) : (
        <div style={{ display:"grid", gap:"1rem" }}>
          {members.map((m) => {
            const form = formByMember[m.memberId] || { planTitle: m.assignedPlanTitle || "", planDetails: m.assignedPlanDetails || "" };
            return (
              <div key={m.memberId} style={{ ...S.card, marginBottom:0 }}>
                <div style={S.cardBody}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:"0.75rem", marginBottom:"0.65rem", flexWrap:"wrap" }}>
                    <div>
                      <div style={{ color:"#1e293b", fontWeight:700 }}>{m.memberName || `Member #${m.memberId}`}</div>
                      <div style={{ color:"#64748b", fontSize:"0.82rem" }}>{m.memberEmail || ""}</div>
                    </div>
                    <span style={S.badge("green")}>Purchased</span>
                  </div>

                  <div style={{ marginBottom:"0.7rem" }}>
                    <label style={S.label}>Plan Title</label>
                    <input
                      style={S.input}
                      value={form.planTitle}
                      onChange={(e) => updateForm(m.memberId, "planTitle", e.target.value)}
                      placeholder="e.g. Weight Loss Plan - 8 Weeks"
                    />
                  </div>
                  <div style={{ marginBottom:"0.7rem" }}>
                    <label style={S.label}>Plan Details</label>
                    <textarea
                      style={{ ...S.input, minHeight: 110, resize:"vertical" }}
                      value={form.planDetails}
                      onChange={(e) => updateForm(m.memberId, "planDetails", e.target.value)}
                      placeholder="Enter meal schedule, calories, macro split, and guidance"
                    />
                  </div>

                  {m.assignedAt && (
                    <div style={{ color:"#64748b", fontSize:"0.8rem", marginBottom:"0.7rem" }}>
                      Last assigned: {fmtDate(m.assignedAt)}
                    </div>
                  )}

                  <button
                    style={S.btn("primary")}
                    onClick={() => assignPlan(m)}
                    disabled={assigningFor === m.memberId}
                  >
                    {assigningFor === m.memberId ? "Assigning…" : (m.assignedAt ? "Update Diet Plan" : "Assign Diet Plan")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TrainerCostumesTab({ trainerId, trainerName }) {
  const [costumes, setCostumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msgs, setMsgs] = useState({});
  const [booking, setBooking] = useState(null);
  const [selectedSizeByCostume, setSelectedSizeByCostume] = useState({});
  const [purchasedCostumeIds, setPurchasedCostumeIds] = useState(new Set());

  useEffect(() => {
    api.get("/api/public/costumes")
      .then((r) => setCostumes(Array.isArray(r.data) ? r.data : []))
      .catch((e) => setError(e.response?.data?.message || "Failed to load costumes."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!trainerId) return;

    const localPurchased = getTrainerPurchasedCostumeIds(trainerId).map(Number);
    api.get("/api/public/costumes/my-bookings", {
      params: { bookerId: Number(trainerId), bookerType: "TRAINER" },
    })
      .then((r) => {
        const bookings = Array.isArray(r.data) ? r.data : [];
        const activeBookingIds = bookings
          .filter((b) => String(b?.status || "").toUpperCase() !== "CANCELLED")
          .map((b) => Number(b.costumeId))
          .filter((id) => Number.isFinite(id));

        const merged = Array.from(new Set([...localPurchased, ...activeBookingIds]));
        setPurchasedCostumeIds(new Set(merged));
        localStorage.setItem(`${TRAINER_PURCHASED_COSTUMES_KEY}:TRAINER:${trainerId}`, JSON.stringify(merged));
      })
      .catch(() => {
        setPurchasedCostumeIds(new Set(localPurchased));
      });
  }, [trainerId]);

  const book = async (costume) => {
    if (!trainerId) {
      setMsgs((m) => ({ ...m, [costume.id]: "Trainer account details not found. Please log in again." }));
      return;
    }

    const selectedSize = (selectedSizeByCostume[costume.id] || "").trim();
    if (!selectedSize) {
      setMsgs((m) => ({ ...m, [costume.id]: "Please select a costume size." }));
      return;
    }

    const now = new Date();
    const returnDate = new Date(now);
    returnDate.setDate(now.getDate() + 1);
    const toISO = (d) => d.toISOString().split("T")[0];

    setBooking(costume.id);
    setMsgs((m) => ({ ...m, [costume.id]: "" }));
    try {
      await api.post("/api/public/costumes/book", {
        costumeId: costume.id,
        bookerId: Number(trainerId),
        bookerType: "TRAINER",
        bookerName: trainerName || localStorage.getItem("name") || "Trainer",
        bookerPhone: localStorage.getItem("phone") || "",
        bookerAddress: localStorage.getItem("address") || "",
        selectedSize,
        pickupDate: toISO(now),
        returnDate: toISO(returnDate),
      });

      saveTrainerPurchasedCostumeId(trainerId, costume.id);
      setPurchasedCostumeIds((prev) => new Set([...prev, Number(costume.id)]));
      setMsgs((m) => ({ ...m, [costume.id]: "Costume booking created. Complete payment to confirm." }));
    } catch (e) {
      setMsgs((m) => ({ ...m, [costume.id]: e.response?.data?.message || "Booking failed. Please try again." }));
    } finally {
      setBooking(null);
    }
  };

  if (loading) return <div style={S.empty}>Loading costumes…</div>;
  if (error) return <div style={S.alert("error")}>{error}</div>;

  return (
    <div>
      <h2 style={{ color:"#1e293b", marginBottom:"1rem", fontWeight:700 }}>Costume Rental</h2>
      {costumes.length === 0 ? (
        <div style={S.empty}>No active costumes available.</div>
      ) : (
        <div style={S.grid}>
          {costumes.map((c) => (
            <div key={c.id} style={{ ...S.card, marginBottom:0 }}>
              {c.imageUrl && (
                <img src={c.imageUrl} alt={c.name} style={{ width:"100%", height:160, objectFit:"cover" }} />
              )}
              <div style={S.cardBody}>
                <div style={{ fontWeight:700, color:"#1e293b", marginBottom:"0.4rem" }}>{c.name || "Costume"}</div>
                <div style={{ color:"#64748b", fontSize:"0.88rem", marginBottom:"0.5rem", minHeight:42 }}>
                  {c.description || "No description available."}
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
                  <span style={{ fontWeight:700, color:"#1e40af" }}>₹{Number(c.rentalPrice || 0).toLocaleString()}</span>
                  <span style={S.badge((c.availableQuantity || 0) > 0 ? "green" : "red")}>{(c.availableQuantity || 0) > 0 ? "Available" : "Unavailable"}</span>
                </div>
                <div style={{ marginBottom:"0.75rem" }}>
                  <label style={{ ...S.label, marginBottom:"0.35rem" }}>Select Size *</label>
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
                  <div style={{ ...S.alert(msgs[c.id].toLowerCase().includes("created") ? "success" : "error"), marginBottom:"0.75rem" }}>
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

// ─── Announcements (Trainer + General) ──────────────────────────────────────
function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    getActiveAnnouncements()
      .then((r) => {
        const items = Array.isArray(r.data) ? r.data : [];
        const visible = items
          .filter((a) => {
            const audience = String(a?.targetAudience || "ALL").toUpperCase();
            return audience === "ALL" || audience === "TRAINERS";
          })
          .sort((a, b) => {
            const aTime = (new Date(a?.createdAt)).getTime() || 0;
            const bTime = (new Date(b?.createdAt)).getTime() || 0;
            return bTime - aTime;
          });
        setAnnouncements(visible);
      })
      .catch(() => setError("Failed to load announcements."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={S.empty}>Loading announcements…</div>;
  if (error) return <div style={S.alert("error")}>{error}</div>;

  return (
    <div>
      <h2 style={{ color:"#1e293b", marginBottom:"0.75rem", fontWeight:700 }}>Announcements</h2>
      <p style={{ color:"#64748b", marginBottom:"1rem", fontSize:"0.9rem" }}>
        Trainer notifications and general announcements.
      </p>
      {announcements.length === 0 ? (
        <div style={S.empty}>No announcements available.</div>
      ) : (
        announcements.map((a) => (
          <div key={a.id} style={S.card}>
            <div style={S.cardBody}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:"0.75rem", marginBottom:"0.6rem" }}>
                <div style={{ color:"#1e293b", fontWeight:700 }}>{a.title || "Announcement"}</div>
                <span style={S.badge(String(a.targetAudience || "ALL").toUpperCase() === "TRAINERS" ? "blue" : "purple")}>
                  {a.targetAudience || "ALL"}
                </span>
              </div>
              <div style={{ color:"#334155", lineHeight:1.6, marginBottom:"0.5rem" }}>{a.message || "—"}</div>
              <div style={{ color:"#64748b", fontSize:"0.8rem" }}>
                {a.createdAt ? `Posted: ${fmtDate(a.createdAt)}` : ""}
                {a.expiresAt ? ` · Expires: ${fmtDate(a.expiresAt)}` : ""}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function LeaveTab() {
  const [leaves, setLeaves]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState({ fromDate:"", toDate:"", reason:"" });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]         = useState({ text:"", type:"" });

  const load = async () => {
    setLoading(true);
    try { const r = await getMyLeaves(); setLeaves(r.data || []); }
    catch { setLeaves([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fromDate || !form.toDate || !form.reason.trim()) {
      setMsg({ text:"All fields are required.", type:"error" }); return;
    }
    if (form.toDate < form.fromDate) {
      setMsg({ text:"To date must be on or after From date.", type:"error" }); return;
    }
    setSubmitting(true); setMsg({ text:"", type:"" });
    try {
      await applyLeave({ fromDate: form.fromDate, toDate: form.toDate, reason: form.reason.trim() });
      setMsg({ text:"Leave application submitted successfully!", type:"success" });
      setForm({ fromDate:"", toDate:"", reason:"" });
      load();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Failed to submit leave.", type:"error" });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Withdraw this leave request?")) return;
    try { await deleteLeave(id); setMsg({ text:"Leave withdrawn.", type:"success" }); load(); }
    catch (err) { setMsg({ text: err.response?.data?.message || "Failed to withdraw.", type:"error" }); }
  };

  const statusColor = { PENDING:"yellow", APPROVED:"green", REJECTED:"red" };
  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <h2 style={{ color:"#1e293b", marginBottom:"1rem", fontWeight:700 }}>My Leaves</h2>

      {/* Apply form */}
      <div style={{ background:"#fff", borderRadius:14, padding:"1.5rem", marginBottom:"1.5rem",
                    border:"1px solid rgba(59,130,246,0.15)", boxShadow:"0 4px 16px rgba(59,130,246,0.07)" }}>
        <p style={{ color:"#1e293b", fontWeight:700, marginBottom:"1rem" }}>Apply for Leave</p>
        {msg.text && <div style={S.alert(msg.type)}>{msg.text}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
            <div>
              <label style={S.label}>From Date *</label>
              <input type="date" style={S.input} value={form.fromDate} min={today}
                onChange={e => setForm(f => ({...f, fromDate:e.target.value}))} required />
            </div>
            <div>
              <label style={S.label}>To Date *</label>
              <input type="date" style={S.input} value={form.toDate} min={form.fromDate || today}
                onChange={e => setForm(f => ({...f, toDate:e.target.value}))} required />
            </div>
          </div>
          <div style={{ marginBottom:"1rem" }}>
            <label style={S.label}>Reason *</label>
            <textarea style={{ ...S.input, minHeight:80, resize:"vertical" }}
              value={form.reason} placeholder="Reason for leave…"
              onChange={e => setForm(f => ({...f, reason:e.target.value}))} required />
          </div>
          <button type="submit" style={S.btn("primary")} disabled={submitting}>
            {submitting ? "Submitting…" : "📅 Apply for Leave"}
          </button>
        </form>
      </div>

      {/* Leave history */}
      <p style={{ color:"#1e293b", fontWeight:700, marginBottom:"0.75rem" }}>My Leave History</p>
      {loading ? <div style={S.empty}>Loading…</div> : leaves.length === 0 ? (
        <div style={S.empty}>No leave requests yet.</div>
      ) : (
        <div style={{ display:"grid", gap:"0.75rem" }}>
          {leaves.map(l => {
            const days = l.fromDate && l.toDate
              ? Math.max(1, Math.round((new Date(l.toDate) - new Date(l.fromDate)) / 86400000) + 1)
              : 1;
            return (
              <div key={l.id} style={{ background:"#fff", borderRadius:12, padding:"1rem 1.25rem",
                border:"1px solid rgba(59,130,246,0.12)", boxShadow:"0 2px 8px rgba(59,130,246,0.06)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"0.5rem" }}>
                  <div>
                    <span style={{ fontWeight:700, color:"#1e293b" }}>{l.fromDate} → {l.toDate}</span>
                    <span style={{ marginLeft:8, color:"#64748b", fontSize:"0.82rem" }}>({days} day{days>1?"s":""})</span>
                  </div>
                  <span style={S.badge(statusColor[l.status] || "yellow")}>{l.status}</span>
                </div>
                <p style={{ color:"#334155", margin:"0.5rem 0 0.25rem", fontSize:"0.9rem" }}>{l.reason}</p>
                {l.adminRemark && (
                  <p style={{ color:"#64748b", fontSize:"0.82rem", margin:"0.25rem 0 0" }}>
                    Admin note: <em>{l.adminRemark}</em>
                  </p>
                )}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"0.5rem" }}>
                  <span style={{ color:"#94a3b8", fontSize:"0.78rem" }}>
                    Applied: {l.appliedAt ? new Date(l.appliedAt).toLocaleDateString("en-IN") : "—"}
                  </span>
                  {l.status === "PENDING" && (
                    <button style={{ ...S.btn("danger"), padding:"0.3rem 0.75rem", fontSize:"0.78rem" }}
                      onClick={() => handleDelete(l.id)}>
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const trainerId = localStorage.getItem("trainerId") || localStorage.getItem("memberId") || localStorage.getItem("id") || "";
  const name = localStorage.getItem("name") || "Trainer";
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    if (!trainerId || trainerId === "null") navigate("/login");
  }, [trainerId, navigate]);

  const handleTab = (tabId) => setActiveTab(tabId);

  const renderTab = () => {
    switch (activeTab) {
      case "home": return <HomeTab trainerId={trainerId} name={name} />;
      case "session": return <SessionTab trainerId={trainerId} />;
      case "diet": return <DietPlanTab trainerId={trainerId} />;
      case "costumes": return <TrainerCostumesTab trainerId={trainerId} trainerName={name} />;
      case "leaves": return <LeaveTab />;
      case "announcements": return <AnnouncementsTab />;
      default:
        return (
          <div style={{ color: "#1e293b", padding: "2rem" }}>
            This section is coming soon.
          </div>
        );
    }
  };

  const current = TABS.find(t => t.id === activeTab);

  return (
    <div style={S.root}>
      <aside style={S.sidebar}>
        <div style={S.sidebarTop}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", background:"rgba(59,130,246,0.08)", padding:"0.85rem 1rem", borderRadius:10, border:"1px solid rgba(59,130,246,0.2)" }}>
            <div style={S.avatar}>👤</div>
            <div style={{ flex:1, overflow:"hidden" }}>
              <p style={{ margin:0, fontSize:"0.95rem", fontWeight:700, color:"#1e293b", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{name}</p>
            </div>
          </div>
        </div>
        <nav style={S.nav}>
          {TABS.map(tab => (
            <button key={tab.id} style={{ ...S.navBtn, ...(activeTab===tab.id ? S.navBtnActive : {}) }} onClick={() => handleTab(tab.id)}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <button style={S.logoutBtn} onClick={() => { localStorage.clear(); navigate('/'); }}>🚪 Logout</button>
      </aside>
      <main style={S.main}>
        <div style={S.header}>
          <div>
            <h1 style={S.headerTitle}>{current?.icon} {current?.label}</h1>
            <p style={S.headerSub}>Welcome back, {name}</p>
          </div>
        </div>
        {renderTab()}
      </main>
    </div>
  );
}