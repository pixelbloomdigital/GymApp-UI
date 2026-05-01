import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "./api/axios";
import { getActiveAnnouncements } from "./api/announcementService";
import { getMemberDietPlan, purchaseDietPlan } from "./api/coreService";
import MemberSidebar from "./components/MemberSidebar.jsx";
import { UserPayment } from "./Payment.jsx";

// ─── helpers ─────────────────────────────────────────────────────────────────
function parseDateTime(val) {
  if (!val) return null;
  if (Array.isArray(val)) { const [y,mo,d,h=0,mi=0,s=0]=val; return new Date(y,mo-1,d,h,mi,s); }
  return new Date(val);
}
function fmtDate(val) {
  const d = parseDateTime(val);
  if (!d || isNaN(d)) return "—";
  return d.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
}

function parseCostumeSizes(rawSize) {
  const parsed = String(rawSize || "")
    .split(/[,/|]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : ["S", "M", "L", "XL", "XXL", "FREE SIZE"];
}

const MEMBER_REGISTERED_EVENTS_KEY = "member-registered-events";
const MEMBER_PURCHASED_COSTUMES_KEY = "member-purchased-costumes";

function getMemberRegisteredEventIds(memberId) {
  if (!memberId) return [];
  try {
    const stored = localStorage.getItem(`${MEMBER_REGISTERED_EVENTS_KEY}:${memberId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveMemberRegisteredEventId(memberId, eventId) {
  if (!memberId || !eventId) return;
  const current = getMemberRegisteredEventIds(memberId).map(Number);
  const next = Array.from(new Set([Number(eventId), ...current]));
  localStorage.setItem(`${MEMBER_REGISTERED_EVENTS_KEY}:${memberId}`, JSON.stringify(next));
}

function getMemberPurchasedCostumeIds(memberId) {
  if (!memberId) return [];
  try {
    const stored = localStorage.getItem(`${MEMBER_PURCHASED_COSTUMES_KEY}:${memberId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveMemberPurchasedCostumeId(memberId, costumeId) {
  if (!memberId || !costumeId) return;
  const current = getMemberPurchasedCostumeIds(memberId).map(Number);
  const next = Array.from(new Set([Number(costumeId), ...current]));
  localStorage.setItem(`${MEMBER_PURCHASED_COSTUMES_KEY}:${memberId}`, JSON.stringify(next));
}

// ─── shared styles ────────────────────────────────────────────────────────────
const S = {
  root:    { display:"flex", minHeight:"100vh", fontFamily:"'Poppins',sans-serif", background:"#f0f6ff" },
  main:   { marginLeft:260, flex:1, padding:"2rem 2.5rem", overflowY:"auto", minHeight:"100vh" },
    header: { display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom:"2rem", paddingBottom:"1.25rem", borderBottom:"1px solid rgba(59,130,246,0.18)" },
    headerTitle: { margin:0, fontSize:"1.5rem", fontWeight:700, color:"#1e293b" },
    headerSub:   { margin:"4px 0 0", fontSize:"0.85rem", color:"#64748b" },
    card: { background:"#fff", borderRadius:14, overflow:"hidden",
      boxShadow:"0 4px 20px rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.15)",
          marginBottom:"1.25rem" },
    cardHeader: { background:"linear-gradient(135deg,#3b82f6 0%,#1e40af 100%)", padding:"1rem 1.5rem" },
  cardTitle:  { margin:0, fontSize:"1rem", fontWeight:700, color:"#fff" },
  cardBody:   { padding:"1.25rem 1.5rem" },
  statGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"1rem", marginBottom:"1.5rem" },
  statCard: { background:"#fff", borderRadius:12, padding:"1.25rem",
              border:"1px solid rgba(59,130,246,0.12)", textAlign:"center", boxShadow:"0 4px 16px rgba(59,130,246,0.07)" },
  statVal:  { fontSize:"1.8rem", fontWeight:800, color:"#1e40af", margin:"0.25rem 0 0" },
  statLbl:  { fontSize:"0.78rem", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px" },
  btn: (v) => ({
    padding:"0.6rem 1.25rem", borderRadius:8,
    fontFamily:"'Poppins',sans-serif", fontWeight:600, fontSize:"0.85rem",
    cursor:"pointer", transition:"opacity 0.2s",
    background: v==="danger" ? "linear-gradient(135deg,#dc2626,#b91c1c)"
               : v==="ghost"  ? "transparent"
               : "linear-gradient(135deg,#3b82f6,#1e40af)",
    color: v==="ghost" ? "#1e40af" : "#fff",
    border: v==="ghost" ? "1px solid rgba(59,130,246,0.18)" : "none",
  }),
  badge: (c) => ({
    display:"inline-block", padding:"2px 10px", borderRadius:20,
    fontSize:"0.75rem", fontWeight:700,
    background: c==="green"?"#dcfce7":c==="red"?"#fee2e2":c==="yellow"?"#fef9c3":"#ede9fe",
    color:       c==="green"?"#16a34a":c==="red"?"#dc2626":c==="yellow"?"#ca8a04":"#7c3aed",
  }),
  input: { width:"100%", padding:"0.65rem 0.85rem", borderRadius:8,
           border:"1.5px solid rgba(59,130,246,0.18)", fontSize:"0.9rem",
           fontFamily:"'Poppins',sans-serif", outline:"none",
           background:"#fff", color:"#1e293b", boxSizing:"border-box" },
  label: { display:"block", fontWeight:600, marginBottom:"0.4rem", color:"#1e40af", fontSize:"0.85rem" },
  alert: (t) => ({
    padding:"0.75rem 1rem", borderRadius:8, marginBottom:"1rem", fontSize:"0.88rem", fontWeight:500,
    background: t==="error"?"#fee2e2":t==="success"?"#dcfce7":"#dbeafe",
    color:       t==="error"?"#dc2626":t==="success"?"#16a34a":"#1e40af",
    border:`1px solid ${t==="error"?"#fca5a5":t==="success"?"#86efac":"#bfdbfe"}`,
  }),
  empty: { textAlign:"center", padding:"3rem 1rem", color:"#9ca3af", fontSize:"0.95rem" },
  grid:  { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:"1.25rem" },
};

// ─── Dashboard Home ───────────────────────────────────────────────────────────
function HomeTab({ memberId, memberProfile }) {
  const navigate = useNavigate();
  const [membership, setMembership] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [annLoading, setAnnLoading] = useState(true);
  const [annError, setAnnError] = useState("");
  const ym = new Date().toISOString().slice(0,7);

  useEffect(() => {
    if (!memberId) return;
    api.get(`/api/memberships/member/${memberId}`)
      .then(r => { const a=(r.data||[]).find(m=>m.status==="ACTIVE")||r.data?.[0]; setMembership(a||null); })
      .catch(()=>{});
    api.get(`/api/attendance/member/${memberId}/month/${ym}`)
      .then(r => setAttendance(r.data))
      .catch(()=>{});
  }, [memberId]);

  useEffect(() => {
    let active = true;
    setAnnLoading(true);
    setAnnError("");

    getActiveAnnouncements()
      .then((r) => {
        if (!active) return;
        const items = Array.isArray(r.data) ? r.data : [];
        const visible = items.filter((a) => {
          const audience = String(a?.targetAudience || "ALL").toUpperCase();
          return audience === "ALL" || audience === "MEMBER";
        });
        setAnnouncements(visible);
      })
      .catch(() => {
        if (!active) return;
        setAnnouncements([]);
        setAnnError("Announcements are unavailable right now.");
      })
      .finally(() => {
        if (!active) return;
        setAnnLoading(false);
      });

    return () => { active = false; };
  }, []);

  const quickLinks = [
    { icon:"✏️", label:"Edit Profile",   action:()=>navigate(`/edit-profile/${memberId || ""}`) },
    { icon:"💳", label:"Membership",     action:()=>navigate("/member-dashboard/membership") },
    { icon:"📅", label:"Attendance",     action:()=>navigate("/member-dashboard/attendance") },
    { icon:"📈", label:"My Reports",     action:()=>navigate("/member-dashboard/reports") },
    { icon:"🥗", label:"Diet Plan",      action:()=>navigate("/member-dashboard/diet") },
  ];

  return (
    <div>
      <div style={{ ...S.card, marginBottom:"1rem" }}>
        <div style={S.cardHeader}><p style={S.cardTitle}>Member Profile</p></div>
        <div style={S.cardBody}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"0.75rem 1.5rem" }}>
            <div><span style={{ color:"#64748b", fontSize:"0.8rem" }}>Name</span><div style={{ color:"#1e293b", fontWeight:600 }}>{memberProfile?.name || "—"}</div></div>
            <div><span style={{ color:"#64748b", fontSize:"0.8rem" }}>Email</span><div style={{ color:"#1e293b", fontWeight:600 }}>{memberProfile?.email || "—"}</div></div>
            <div><span style={{ color:"#64748b", fontSize:"0.8rem" }}>Phone</span><div style={{ color:"#1e293b", fontWeight:600 }}>{memberProfile?.phone || "—"}</div></div>
            <div><span style={{ color:"#64748b", fontSize:"0.8rem" }}>Status</span><div style={{ color:"#1e293b", fontWeight:600 }}>{memberProfile?.status || "—"}</div></div>
          </div>
        </div>
      </div>

      <div style={S.statGrid}>
        <div style={S.statCard}>
          <div style={S.statLbl}>Plan</div>
          <div style={{ ...S.statVal, fontSize:"1.1rem" }}>{membership?.planName || "—"}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLbl}>Days Left</div>
          <div style={S.statVal}>{membership?.daysRemaining ?? "—"}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLbl}>Present (days)</div>
          <div style={S.statVal}>{attendance?.presentDays ?? "—"}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLbl}>Attendance %</div>
          <div style={S.statVal}>{attendance?.attendancePercent != null ? `${attendance.attendancePercent}%` : "—"}</div>
        </div>
        {membership?.endDate && (
          <div style={S.statCard}>
            <div style={S.statLbl}>Expires</div>
            <div style={{ ...S.statVal, fontSize:"1rem" }}>{fmtDate(membership.endDate)}</div>
          </div>
        )}
      </div>

      <div style={{ ...S.card, marginBottom:"1rem" }}>
        <div style={S.cardHeader}><p style={S.cardTitle}>Announcements</p></div>
        <div style={S.cardBody}>
          {annLoading && <div style={{ color:"#64748b", fontSize:"0.9rem" }}>Loading announcements…</div>}
          {!annLoading && annError && <div style={S.alert("error")}>{annError}</div>}
          {!annLoading && !annError && announcements.length === 0 && (
            <div style={{ color:"#64748b", fontSize:"0.9rem" }}>No announcements for members.</div>
          )}
          {!annLoading && !annError && announcements.length > 0 && (
            <div style={{ display:"grid", gap:"0.75rem" }}>
              {announcements.slice(0, 5).map((a) => (
                <div key={a.id} style={{ border:"1px solid rgba(59,130,246,0.15)", borderRadius:10, padding:"0.75rem 0.9rem", background:"#f8fbff" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", gap:"0.75rem", alignItems:"center" }}>
                    <div style={{ fontWeight:700, color:"#1e293b", fontSize:"0.92rem" }}>{a.title || "Announcement"}</div>
                    <span style={{ ...S.badge("yellow"), whiteSpace:"nowrap" }}>{String(a.type || "GENERAL")}</span>
                  </div>
                  <div style={{ color:"#334155", marginTop:"0.35rem", fontSize:"0.88rem", lineHeight:1.5 }}>{a.message}</div>
                  {a.expiresAt && (
                    <div style={{ color:"#64748b", marginTop:"0.4rem", fontSize:"0.78rem" }}>Expires: {fmtDate(a.expiresAt)}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={S.grid}>
        {quickLinks.map(l => (
          <button key={l.label} onClick={l.action}
            style={{ background:"#fff", border:"1px solid rgba(59,130,246,0.15)", borderRadius:14,
                     padding:"1.75rem 1.25rem", cursor:"pointer", textAlign:"center",
                     color:"#1e293b", fontFamily:"'Poppins',sans-serif", transition:"all 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#3b82f6"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(59,130,246,0.15)"}
          >
            <div style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>{l.icon}</div>
            <div style={{ fontWeight:600, fontSize:"0.95rem" }}>{l.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Edit Profile ─────────────────────────────────────────────────────────────
function ProfileTab({ memberId }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!memberId) return;
    navigate(`/edit-profile/${memberId}`, { replace: true });
  }, [memberId, navigate]);

  return <div style={S.empty}>Opening profile editor…</div>;
}

// ─── Membership ───────────────────────────────────────────────────────────────
function MembershipTab({ memberId }) {
  const navigate = useNavigate();
  const [plans,   setPlans]   = useState([]);
  const [allMemberships, setAllMemberships] = useState([]);
  const [current, setCurrent] = useState(null);
  const [memberStatus, setMemberStatus] = useState("—");
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying,  setBuying]  = useState(null);
  const [msg,     setMsg]     = useState("");

  const loadMembershipData = async () => {
    if (!memberId) {
      setPlans([]);
      setAllMemberships([]);
      setCurrent(null);
      setMemberStatus("—");
      return;
    }

    const [plansRes, batchesRes, membershipsRes, memberRes] = await Promise.allSettled([
      api.get("/api/memberships/plans"),
      api.get("/api/batches"),
      api.get(`/api/memberships/member/${memberId}`),
      api.get(`/api/members/${memberId}`),
    ]);

    const memberships = membershipsRes.status === "fulfilled" && Array.isArray(membershipsRes.value.data)
      ? [...membershipsRes.value.data]
      : [];
    memberships.sort((a, b) => {
      const aTime = new Date(a?.endDate || a?.startDate || a?.createdAt || 0).getTime();
      const bTime = new Date(b?.endDate || b?.startDate || b?.createdAt || 0).getTime();
      return bTime - aTime;
    });

    const plans = plansRes.status === "fulfilled" && Array.isArray(plansRes.value.data)
      ? plansRes.value.data.filter(pl => pl.isActive !== false)
      : [];

    const batches = batchesRes.status === "fulfilled" && Array.isArray(batchesRes.value.data)
      ? batchesRes.value.data
      : [];

    setPlans(plans);
    setBatches(batches);
    setAllMemberships(memberships);
    setCurrent(memberships.find(x => (x?.status || "").toUpperCase() === "ACTIVE") || memberships[0] || null);

    if (memberRes.status === "fulfilled") {
      setMemberStatus(memberRes.value?.data?.status || "—");
    } else {
      setMemberStatus("—");
    }

    const failures = [plansRes, batchesRes, membershipsRes, memberRes].filter(r => r.status === "rejected");
    if (failures.length > 0) {
      const membershipFailed = membershipsRes.status === "rejected";
      setMsg(membershipFailed
        ? "Could not load member memberships."
        : "Some membership details are unavailable right now.");
    } else {
      setMsg("");
    }
  };

  useEffect(() => {
    setLoading(true);
    loadMembershipData()
      .catch(() => setMsg("Failed to load membership details."))
      .finally(() => setLoading(false));
  }, [memberId]);

  const purchaseOrUpgrade = async (plan) => {
    if (!memberId) { setMsg("Member ID not found. Please log in again."); return; }
    // Store plan and navigate to payment page — Razorpay checkout will handle the rest
    localStorage.setItem("pendingMembershipPlan", JSON.stringify(plan));
    navigate("/member-dashboard/payment", { state: { membershipPlan: plan } });
  };

  if (loading) return <div style={S.empty}>Loading…</div>;

  const gradients = [
    "linear-gradient(145deg,#3b82f6,#1e40af)",
    "linear-gradient(145deg,#0ea5e9,#0284c7)",
    "linear-gradient(145deg,#14b8a6,#0f766e)",
    "linear-gradient(145deg,#2563eb,#1d4ed8)",
  ];

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:"0.75rem", marginBottom:"1rem", flexWrap:"wrap" }}>
        <h2 style={{ color:"#fff", margin:0, fontWeight:700 }}>Membership</h2>
        <div style={{ display:"flex", gap:"0.6rem", flexWrap:"wrap" }}>
            <button style={S.btn("ghost")} onClick={() => navigate(`/edit-profile/${memberId || ""}`)}>
            🥗 Opt For Diet Plan
          </button>
          <button style={S.btn("primary")} onClick={() => navigate("/member-dashboard/diet") }>
            ➕ Buy / View Diet Plan
          </button>
        </div>
      </div>
      {msg && <div style={S.alert(msg.toLowerCase().includes("success")?"success":"error")}>{msg}</div>}

      {current && (
        <div style={{ background:"linear-gradient(135deg,#3b82f6,#1e40af)", borderRadius:14, padding:"1.5rem",
                marginBottom:"1.5rem", display:"flex", justifyContent:"space-between", alignItems:"center",
                boxShadow:"0 8px 24px rgba(59,130,246,0.28)" }}>
          <div>
            <div style={{ color:"rgba(255,255,255,0.75)", fontSize:"0.8rem", textTransform:"uppercase", letterSpacing:"0.5px" }}>Active Plan</div>
            <div style={{ color:"#fff", fontWeight:700, fontSize:"1.3rem", margin:"0.25rem 0" }}>{current.planName}</div>
            <div style={{ color:"rgba(255,255,255,0.8)", fontSize:"0.85rem" }}>
              Expires: {fmtDate(current.endDate)}
              {current.daysRemaining != null && ` · ${current.daysRemaining} days left`}
            </div>
          </div>
          <span style={{ fontSize:"2.5rem" }}>✅</span>
        </div>
      )}

      <div style={{ ...S.card, marginBottom:"1.5rem" }}>
        <div style={S.cardHeader}><p style={S.cardTitle}>All Memberships</p></div>
        <div style={S.cardBody}>
          {allMemberships.length === 0 ? (
            <div style={S.empty}>No memberships found for this member.</div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.88rem" }}>
                <thead>
                  <tr style={{ background:"rgba(59,130,246,0.12)" }}>
                    {["Plan", "Start Date", "Expiry Date", "Days Left", "Status"].map((h) => (
                      <th key={h} style={{ padding:"0.75rem 1rem", textAlign:"left", color:"#1e40af", fontWeight:600, borderBottom:"1px solid rgba(59,130,246,0.18)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allMemberships.map((m) => (
                    <tr key={m.membershipId} style={{ borderBottom:"1px solid rgba(59,130,246,0.08)" }}>
                      <td style={{ padding:"0.75rem 1rem", color:"#1e293b", fontWeight:600 }}>{m.planName || "—"}</td>
                      <td style={{ padding:"0.75rem 1rem", color:"#1e293b" }}>{fmtDate(m.startDate)}</td>
                      <td style={{ padding:"0.75rem 1rem", color:"#1e293b" }}>{fmtDate(m.endDate)}</td>
                      <td style={{ padding:"0.75rem 1rem", color:"#1e293b" }}>{m.daysRemaining ?? "—"}</td>
                      <td style={{ padding:"0.75rem 1rem" }}>
                        <span style={S.badge((m.status || "") === "ACTIVE" ? "green" : (m.status || "") === "EXPIRED" ? "red" : "yellow")}>
                          {m.status || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <p style={{ color:"#64748b", marginBottom:"1.25rem", fontSize:"0.9rem" }}>
        Available Plans (from membership_plans)
      </p>
      <div style={S.grid}>
        {plans.map((p,i) => (
          <div key={p.id} style={{ background:gradients[i%gradients.length], borderRadius:14, padding:"1.5rem", color:"#fff", position:"relative" }}>
            <div style={{ fontSize:"0.75rem", opacity:0.8, textTransform:"uppercase" }}>
              {p.durationMonths} month{p.durationMonths!==1?"s":""}{p.daysPerWeek?` · ${p.daysPerWeek} days/wk`:""}
            </div>
            <div style={{ fontWeight:700, fontSize:"1.1rem", margin:"0.5rem 0 0.25rem" }}>{p.name}</div>
            <div style={{ fontSize:"2rem", fontWeight:800 }}>₹{Number(p.price).toLocaleString()}</div>
            {p.description && <div style={{ fontSize:"0.8rem", opacity:0.8, marginTop:"0.5rem", lineHeight:1.5 }}>{p.description}</div>}
            <button
              style={{ ...S.btn("ghost"), marginTop:"1.25rem", width:"100%",
                       background:"rgba(255,255,255,0.15)", color:"#fff", border:"1px solid rgba(255,255,255,0.4)" }}
              disabled={buying===p.id || (current?.status === "ACTIVE" && current?.planName === p.name)}
              onClick={()=>purchaseOrUpgrade(p)}
            >
              {buying===p.id
                ? "Processing…"
                : (current?.membershipId ? "Upgrade Plan" : "Buy Membership Plan")}
            </button>
          </div>
        ))}
        {plans.length===0 && <div style={{ ...S.empty, gridColumn:"1/-1" }}>No plans available.</div>}
      </div>
    </div>
  );
}

// ─── Attendance ───────────────────────────────────────────────────────────────
function AttendanceTab({ memberId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [month,   setMonth]   = useState(new Date().toISOString().slice(0,7));

  const load = (ym) => {
    setLoading(true); setError("");
    api.get(`/api/attendance/member/${memberId}/month/${ym}`)
      .then(r => setRecords(Array.isArray(r.data?.records) ? r.data.records : Array.isArray(r.data) ? r.data : []))
      .catch(e => setError(e.response?.data?.message || "Failed to load attendance."))
      .finally(()=>setLoading(false));
  };

  useEffect(() => { if (memberId) load(month); }, [memberId, month]);

  return (
    <div>
      <h2 style={{ color:"#1e293b", marginBottom:"1rem", fontWeight:700 }}>Attendance</h2>
      <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.5rem" }}>
        <label style={{ ...S.label, margin:0 }}>Month:</label>
        <input type="month" value={month} onChange={e=>setMonth(e.target.value)}
          style={{ ...S.input, width:"auto", padding:"0.5rem 0.75rem" }} />
      </div>
      {error && <div style={S.alert("error")}>{error}</div>}
      {loading ? <div style={S.empty}>Loading…</div> : (
        records.length === 0 ? (
          <div style={S.empty}>No attendance records for this month.</div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.88rem" }}>
              <thead>
                <tr style={{ background:"rgba(59,130,246,0.12)" }}>
                  {["Date","Batch","Check In","Check Out","Status"].map(h=>(
                    <th key={h} style={{ padding:"0.75rem 1rem", textAlign:"left", color:"#1e40af", fontWeight:600, borderBottom:"1px solid rgba(59,130,246,0.18)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r,i) => (
                  <tr key={i} style={{ borderBottom:"1px solid rgba(59,130,246,0.08)" }}>
                    <td style={{ padding:"0.75rem 1rem", color:"#1e293b" }}>{fmtDate(r.date)}</td>
                    <td style={{ padding:"0.75rem 1rem", color:"#1e293b" }}>{r.timeSlot||r.batchName||"—"}</td>
                    <td style={{ padding:"0.75rem 1rem", color:"#1e293b" }}>{r.checkInTime||"—"}</td>
                    <td style={{ padding:"0.75rem 1rem", color:"#1e293b" }}>{r.checkOutTime||"—"}</td>
                    <td style={{ padding:"0.75rem 1rem" }}>
                      <span style={S.badge(r.status==="PRESENT"?"green":r.status==="ABSENT"?"red":"yellow")}>
                        {r.status||"—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────
function ReportsTab({ memberId }) {
  const navigate = useNavigate();
  const [membership, setMembership] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const ym = new Date().toISOString().slice(0,7);

  useEffect(() => {
    if (!memberId) return;
    Promise.all([
      api.get(`/api/memberships/member/${memberId}`),
      api.get(`/api/attendance/member/${memberId}/month/${ym}`),
    ]).then(([m,a]) => {
      setMembership((m.data||[]).find(x=>x.status==="ACTIVE")||null);
      setAttendance(a.data||null);
    }).catch(()=>{})
    .finally(()=>setLoading(false));
  }, [memberId]);

  if (loading) return <div style={S.empty}>Loading…</div>;

  return (
    <div>
      <h2 style={{ color:"#1e293b", marginBottom:"1.5rem", fontWeight:700 }}>My Reports</h2>

      <div style={S.statGrid}>
        <div style={S.statCard}>
          <div style={S.statLbl}>Active Plan</div>
          <div style={{ ...S.statVal, fontSize:"1rem" }}>{membership?.planName||"None"}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLbl}>Days Remaining</div>
          <div style={S.statVal}>{membership?.daysRemaining??0}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLbl}>Present Days</div>
          <div style={S.statVal}>{attendance?.presentDays??0}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLbl}>Absent Days</div>
          <div style={S.statVal}>{attendance?.absentDays??0}</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLbl}>Attendance %</div>
          <div style={S.statVal}>{attendance?.attendancePercent!=null?`${attendance.attendancePercent}%`:"—"}</div>
        </div>
      </div>

      {membership && (
        <div style={{ ...S.card, marginTop:"1rem" }}>
          <div style={S.cardHeader}><p style={S.cardTitle}>Membership Details</p></div>
          <div style={S.cardBody}>
            {[
              ["Plan",       membership.planName],
              ["Start Date", fmtDate(membership.startDate)],
              ["End Date",   fmtDate(membership.endDate)],
              ["Status",     membership.status],
            ].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"0.5rem 0", borderBottom:"1px solid rgba(59,130,246,0.08)" }}>
                <span style={{ color:"#64748b", fontSize:"0.88rem" }}>{k}</span>
                <span style={{ color:"#1e293b", fontWeight:600, fontSize:"0.88rem" }}>{v||"—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop:"1rem" }}>
        <button style={S.btn("ghost")} onClick={()=>navigate(`/member-monthly-report/${memberId}`)}>
          📊 View Full Monthly Report →
        </button>
      </div>
    </div>
  );
}

// ─── Diet Plan ────────────────────────────────────────────────────────────────
function DietTab({ memberId }) {
  const [diet, setDiet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [msg, setMsg] = useState("");

  const loadDietStatus = async () => {
    if (!memberId) {
      setDiet(null);
      return;
    }
    const r = await getMemberDietPlan(memberId);
    setDiet(r.data || null);
  };

  useEffect(() => {
    setLoading(true);
    loadDietStatus()
      .catch(() => setMsg("Failed to load diet plan status."))
      .finally(() => setLoading(false));
  }, [memberId]);

  const buyDietPlan = async () => {
    if (!memberId) {
      setMsg("Member account not found. Please log in again.");
      return;
    }

    setProcessing(true);
    setMsg("");
    try {
      const r = await purchaseDietPlan(memberId);
      setDiet(r.data || null);
      setMsg("Diet plan purchased successfully. Your trainer can now assign your plan.");
    } catch (e) {
      setMsg(e.response?.data?.message || "Failed to purchase diet plan.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div style={S.empty}>Loading diet plan…</div>;
  }

  const purchased = Boolean(diet?.purchased);

  return (
    <div>
      <h2 style={{ color:"#1e293b", marginBottom:"1rem", fontWeight:700 }}>Diet Plan</h2>
      <p style={{ color:"#64748b", marginBottom:"1.5rem", fontSize:"0.9rem" }}>
        Purchase diet plan access here. Once purchased, your trainer can assign a personalized plan.
      </p>
      {msg && (
        <div style={S.alert(msg.toLowerCase().includes("success") || msg.toLowerCase().includes("can now assign") ? "success" : "error")}>{msg}</div>
      )}
      <div style={{ background:"#fff", borderRadius:14, padding:"2rem", maxWidth:480,
            border:"1px solid rgba(59,130,246,0.15)", textAlign:"center", boxShadow:"0 4px 16px rgba(59,130,246,0.07)" }}>
        <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🥗</div>
        {!purchased ? (
          <>
            <p style={{ color:"#334155", marginBottom:"1.5rem", lineHeight:1.6 }}>
              You have not purchased the diet plan yet.
            </p>
            <button style={{ ...S.btn("primary"), padding:"0.75rem 2rem", fontSize:"0.95rem" }}
              onClick={buyDietPlan}
              disabled={processing}
            >
              {processing ? "Processing…" : "Purchase Diet Plan"}
            </button>
          </>
        ) : (
          <>
            <p style={{ color:"#16a34a", marginBottom:"1rem", lineHeight:1.6, fontWeight:600 }}>
              Diet plan purchased on {fmtDate(diet?.purchasedAt)}.
            </p>
            {diet?.assignedPlanTitle ? (
              <div style={{ textAlign:"left", marginTop:"0.75rem", background:"#f8fbff", border:"1px solid rgba(59,130,246,0.15)", borderRadius:10, padding:"0.9rem" }}>
                <div style={{ fontWeight:700, color:"#1e293b", marginBottom:"0.35rem" }}>{diet.assignedPlanTitle}</div>
                <div style={{ color:"#334155", whiteSpace:"pre-wrap", fontSize:"0.88rem", lineHeight:1.55 }}>{diet.assignedPlanDetails || "No details provided."}</div>
                {diet.assignedAt && <div style={{ marginTop:"0.5rem", color:"#64748b", fontSize:"0.8rem" }}>Assigned: {fmtDate(diet.assignedAt)}</div>}
              </div>
            ) : (
              <p style={{ color:"#64748b", marginBottom:0, lineHeight:1.6 }}>
                Waiting for trainer to assign your plan.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PaymentTab() {
  return <UserPayment />;
}

// ─── Announcements ───────────────────────────────────────────────────────────
function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    getActiveAnnouncements()
      .then((r) => {
        if (!active) return;
        const items = Array.isArray(r.data) ? r.data : [];
        const visible = items.filter((a) => {
          const audience = String(a?.targetAudience || "ALL").toUpperCase();
          return audience === "ALL" || audience === "MEMBER";
        });
        setAnnouncements(visible);
      })
      .catch(() => {
        if (!active) return;
        setAnnouncements([]);
        setError("Failed to load announcements.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return (
    <div>
      <h2 style={{ color:"#1e293b", marginBottom:"1rem", fontWeight:700 }}>Announcements</h2>

      {loading && <div style={S.empty}>Loading announcements…</div>}
      {!loading && error && <div style={S.alert("error")}>{error}</div>}

      {!loading && !error && announcements.length === 0 && (
        <div style={S.empty}>No announcements available for members.</div>
      )}

      {!loading && !error && announcements.length > 0 && (
        <div style={{ display:"grid", gap:"1rem" }}>
          {announcements.map((a) => (
            <div key={a.id} style={{ ...S.card, marginBottom:0 }}>
              <div style={S.cardBody}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:"0.75rem", alignItems:"center", marginBottom:"0.5rem" }}>
                  <div style={{ fontWeight:700, color:"#1e293b", fontSize:"1rem" }}>{a.title || "Announcement"}</div>
                  <span style={S.badge("yellow")}>{String(a.type || "GENERAL")}</span>
                </div>
                <div style={{ color:"#334155", fontSize:"0.92rem", lineHeight:1.6 }}>{a.message || "—"}</div>
                <div style={{ display:"flex", gap:"1rem", marginTop:"0.65rem", fontSize:"0.8rem", color:"#64748b" }}>
                  <span>Published: {fmtDate(a.createdAt)}</span>
                  {a.expiresAt && <span>Expires: {fmtDate(a.expiresAt)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MemberEventsTab({ memberId, memberProfile }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(null);
  const [msgs, setMsgs] = useState({});
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());

  useEffect(() => {
    setRegisteredEventIds(new Set(getMemberRegisteredEventIds(memberId).map(Number)));

    api.get("/api/public/events")
      .then((r) => setEvents(Array.isArray(r.data) ? r.data : []))
      .catch((e) => setError(e.response?.data?.message || "Failed to load events."))
      .finally(() => setLoading(false));
  }, [memberId]);

  const registerEvent = async (event) => {
    if (!memberId) {
      setMsgs((m) => ({ ...m, [event.id]: "Member account details not found. Please log in again." }));
      return;
    }

    setRegistering(event.id);
    setMsgs((m) => ({ ...m, [event.id]: "" }));
    try {
      await api.post(`/api/public/events/${event.id}/register`, {
        bookerId: memberId ? Number(memberId) : null,
        bookerType: "MEMBER",
        bookerName: memberProfile?.name || "Member",
        bookerPhone: memberProfile?.phone || "",
      });
      saveMemberRegisteredEventId(memberId, event.id);
      setRegisteredEventIds((prev) => new Set([...prev, Number(event.id)]));
      setMsgs((m) => ({ ...m, [event.id]: "Event registration successful." }));
      setEvents((prev) => prev.map((ev) => ev.id === event.id
        ? { ...ev, currentRegistrations: (ev.currentRegistrations || 0) + 1 }
        : ev));
    } catch (e) {
      setMsgs((m) => ({ ...m, [event.id]: e.response?.data?.message || "Failed to register for event." }));
    } finally {
      setRegistering(null);
    }
  };

  if (loading) return <div style={S.empty}>Loading events…</div>;
  if (error) return <div style={S.alert("error")}>{error}</div>;

  return (
    <div>
      <h2 style={{ color:"#1e293b", marginBottom:"1rem", fontWeight:700 }}>Events</h2>
      {events.length === 0 ? (
        <div style={S.empty}>No active events available.</div>
      ) : (
        <div style={S.grid}>
          {events.map((ev) => (
            <div key={ev.id} style={{ ...S.card, marginBottom:0 }}>
              <div style={S.cardHeader}>
                <p style={S.cardTitle}>{ev.title || "Gym Event"}</p>
              </div>
              <div style={S.cardBody}>
                <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", marginBottom:"0.6rem" }}>
                  <span style={S.badge("yellow")}>{String(ev.eventType || "EVENT")}</span>
                  <span style={{ fontSize:"0.8rem", color:"#64748b" }}>{fmtDate(ev.eventDate)}</span>
                </div>
                <div style={{ color:"#334155", fontSize:"0.9rem", marginBottom:"0.55rem", minHeight:48 }}>
                  {ev.description || "No description available."}
                </div>
                <div style={{ fontSize:"0.82rem", color:"#64748b", marginBottom:"0.35rem" }}>
                  Venue: {ev.venue || "TBA"}
                </div>
                <div style={{ fontSize:"0.82rem", color:"#64748b", marginBottom:"0.75rem" }}>
                  Registered: {ev.currentRegistrations || 0}{ev.maxParticipants ? ` / ${ev.maxParticipants}` : ""}
                </div>
                {msgs[ev.id] && (
                  <div style={{ ...S.alert(msgs[ev.id].toLowerCase().includes("successful") ? "success" : "error"), marginBottom:"0.75rem" }}>
                    {msgs[ev.id]}
                  </div>
                )}
                {registeredEventIds.has(Number(ev.id)) && !msgs[ev.id] && (
                  <div style={{ ...S.alert("success"), marginBottom:"0.75rem" }}>
                    You have already registered for this event.
                  </div>
                )}
                <button
                  style={S.btn("primary")}
                  disabled={registering === ev.id || registeredEventIds.has(Number(ev.id))}
                  onClick={() => registerEvent(ev)}
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

function MemberCostumesTab({ memberId, memberProfile }) {
  const [costumes, setCostumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);
  const [msgs, setMsgs] = useState({});
  const [selectedSizeByCostume, setSelectedSizeByCostume] = useState({});
  const [purchasedCostumeIds, setPurchasedCostumeIds] = useState(new Set());

  useEffect(() => {
    api.get("/api/public/costumes")
      .then((r) => setCostumes(Array.isArray(r.data) ? r.data : []))
      .catch((e) => setError(e.response?.data?.message || "Failed to load costumes."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!memberId) return;

    const localPurchased = getMemberPurchasedCostumeIds(memberId).map(Number);
    api.get("/api/public/costumes/my-bookings", {
      params: { bookerId: Number(memberId), bookerType: "MEMBER" },
    })
      .then((r) => {
        const bookings = Array.isArray(r.data) ? r.data : [];
        const activeBookingIds = bookings
          .filter((b) => String(b?.status || "").toUpperCase() !== "CANCELLED")
          .map((b) => Number(b.costumeId))
          .filter((id) => Number.isFinite(id));

        const merged = Array.from(new Set([...localPurchased, ...activeBookingIds]));
        setPurchasedCostumeIds(new Set(merged));
        localStorage.setItem(`${MEMBER_PURCHASED_COSTUMES_KEY}:${memberId}`, JSON.stringify(merged));
      })
      .catch(() => {
        setPurchasedCostumeIds(new Set(localPurchased));
      });
  }, [memberId]);

  const buyCostume = async (costume) => {
    if (!memberId) {
      setMsgs((m) => ({ ...m, [costume.id]: "Member account details not found. Please log in again." }));
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
    setMsgs((m) => ({ ...m, [costume.id]: "" }));
    try {
      await api.post("/api/public/costumes/book", {
        costumeId: costume.id,
        bookerId: memberId ? Number(memberId) : null,
        bookerType: "MEMBER",
        bookerName: memberProfile?.name || "Member",
        bookerPhone: memberProfile?.phone || "",
        bookerAddress: memberProfile?.address || localStorage.getItem("address") || "",
        selectedSize,
        pickupDate: toISO(today),
        returnDate: toISO(returnDate),
      });
      saveMemberPurchasedCostumeId(memberId, costume.id);
      setPurchasedCostumeIds((prev) => new Set([...prev, Number(costume.id)]));
      setMsgs((m) => ({ ...m, [costume.id]: "Costume booking created. Complete payment to confirm." }));
    } catch (e) {
      setMsgs((m) => ({ ...m, [costume.id]: e.response?.data?.message || "Failed to buy costume." }));
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
                  onClick={() => buyCostume(c)}
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MemberDashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const memberId  = localStorage.getItem("id");
  const loginEmail = localStorage.getItem("email") || "";
  const [resolvedMemberId, setResolvedMemberId] = useState(memberId || "");
  const [memberProfile, setMemberProfile] = useState({
    name: localStorage.getItem("name") || "Member",
    email: localStorage.getItem("email") || "",
    phone: "",
    address: localStorage.getItem("address") || "",
    status: "",
  });
  const [activeTab, setActiveTab] = useState("home");

  const getTabFromPath = (pathname) => {
    const path = pathname.replace(/\/+$/g, "");
    const base = "/member-dashboard";
    if (path === base) return "home";
    const next = path.slice(base.length + 1);
    return ["home","profile","membership","payment","attendance","reports","diet","events","costumes","announcements"].includes(next) ? next : "home";
  };

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    if (activeTab !== "profile" || !resolvedMemberId) return;
    navigate(`/edit-profile/${resolvedMemberId}`, { replace: true });
  }, [activeTab, resolvedMemberId, navigate]);

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role  = (localStorage.getItem("role")||"").toUpperCase();
    if (!token || !memberId) navigate("/login");
    else if (role === "VISITOR") navigate("/visitor-dashboard");
    else if (role === "ADMIN")   navigate("/admin-dashboard");
  }, [navigate, memberId]);

  useEffect(() => {
    let active = true;
    const resolveCoreMember = async () => {
      if (!memberId && !loginEmail) return;

      // Email is the stable identity across services; prefer it when available.
      if (loginEmail) {
        try {
          const byEmailRes = await api.get(`/api/members/by-email?email=${encodeURIComponent(loginEmail)}`);
          const found = byEmailRes.data || null;
          if (!active) return;
          if (found?.id) {
            setResolvedMemberId(String(found.id));
            setMemberProfile({
              name: found.name || localStorage.getItem("name") || "Member",
              email: found.email || localStorage.getItem("email") || "",
              phone: found.phone || "",
              address: found.address || localStorage.getItem("address") || "",
              status: found.status || "",
            });
            localStorage.setItem("memberId", String(found.id));
            return;
          }
        } catch {
          // Fall back to the stored ID below.
        }
      }

      // Fall back to the stored ID only when email lookup is unavailable.
      if (memberId) {
        try {
          const r = await api.get(`/api/members/${memberId}`);
          const data = r.data || {};
          if (!active) return;
          setResolvedMemberId(String(data.id || memberId));
          setMemberProfile({
            name: data.name || localStorage.getItem("name") || "Member",
            email: data.email || localStorage.getItem("email") || "",
            phone: data.phone || "",
            address: data.address || localStorage.getItem("address") || "",
            status: data.status || "",
          });
          localStorage.setItem("memberId", String(data.id || memberId));
          return;
        } catch {
          // Keep going to localStorage fallback values when backend lookup fails.
        }
      }
    };

    resolveCoreMember();
    return () => { active = false; };
  }, [memberId, loginEmail]);

  useEffect(() => {
    if (!resolvedMemberId) return;
    api.get(`/api/members/${resolvedMemberId}`)
      .then((r) => {
        const data = r.data || {};
        const profile = {
          name: data.name || localStorage.getItem("name") || "Member",
          email: data.email || localStorage.getItem("email") || "",
          phone: data.phone || "",
          address: data.address || localStorage.getItem("address") || "",
          status: data.status || "",
        };
        setMemberProfile(profile);
        if (profile.name) localStorage.setItem("name", profile.name);
        if (profile.email) localStorage.setItem("email", profile.email);
        if (profile.address) localStorage.setItem("address", profile.address);
      })
      .catch(() => {
        // Keep localStorage fallback values when backend fetch fails.
      });
  }, [resolvedMemberId]);

  const handleTab = (tabId) => {
    setActiveTab(tabId);
    const target = tabId === "profile"
      ? `/edit-profile/${resolvedMemberId || memberId || ""}`
      : tabId === "home"
        ? "/member-dashboard"
        : `/member-dashboard/${tabId}`;
    navigate(target, { replace: true });
  };

  const logout = () => { localStorage.clear(); navigate("/"); };

  const renderTab = () => {
    switch (activeTab) {
      case "home":       return <HomeTab memberId={resolvedMemberId} memberProfile={memberProfile} />;
      case "profile":    return <ProfileTab memberId={resolvedMemberId} />;
      case "membership": return <MembershipTab memberId={resolvedMemberId} />;
      case "payment":    return <PaymentTab />;
      case "attendance": return <AttendanceTab memberId={resolvedMemberId} />;
      case "reports":    return <ReportsTab memberId={resolvedMemberId} />;
      case "diet":       return <DietTab memberId={resolvedMemberId} />;
      case "events":     return <MemberEventsTab memberId={resolvedMemberId} memberProfile={memberProfile} />;
      case "costumes":   return <MemberCostumesTab memberId={resolvedMemberId} memberProfile={memberProfile} />;
      case "announcements": return <AnnouncementsTab />;
      default:           return null;
    }
  };

  const current = [
    { id:"home", label:"Dashboard", icon:"📊" },
    { id:"profile", label:"Edit Profile", icon:"✏️" },
    { id:"membership", label:"Membership", icon:"💳" },
    { id:"payment", label:"Payment", icon:"💰" },
    { id:"attendance", label:"Attendance", icon:"📅" },
    { id:"reports", label:"My Reports", icon:"📈" },
    { id:"diet", label:"Diet Plan", icon:"🥗" },
    { id:"events", label:"Events", icon:"🎉" },
    { id:"costumes", label:"Costume Rental", icon:"👗" },
    { id:"announcements", label:"Announcements", icon:"📢" },
  ].find(t=>t.id===activeTab);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .md-nav-btn:hover { background: rgba(59,130,246,0.12) !important; color: #fff !important; }
        .md-nav-btn-danger:hover { background: rgba(220,38,38,0.15) !important; color: #f87171 !important; }
        .md-quick-btn:hover { border-color: #3b82f6 !important; background: rgba(59,130,246,0.12) !important; }
        @media (max-width: 768px) {
          .md-sidebar { display: none !important; }
          .md-main { margin-left: 0 !important; padding: 1rem !important; }
        }
      `}</style>

      <div style={S.root}>
        <MemberSidebar
          memberProfile={memberProfile}
          activeTab={activeTab}
          onNavigate={handleTab}
          onLogout={logout}
        />

        {/* Main */}
        <main className="md-main" style={S.main}>
          <div style={S.header}>
            <div>
              <h1 style={S.headerTitle}>{current?.icon} {current?.label}</h1>
              <p style={S.headerSub}>Welcome back, {memberProfile.name}</p>
            </div>
            <div style={{ display:"flex", gap:"0.75rem", alignItems:"center" }}>
              <span style={{ fontSize:"0.8rem", color:"#98cfff", background:"rgba(62,9,148,0.2)",
                             padding:"4px 12px", borderRadius:20, border:"1px solid rgba(62,9,148,0.4)" }}>
                Member
              </span>
              <button style={{ ...S.btn("ghost"), fontSize:"0.82rem" }} onClick={logout}>Logout</button>
            </div>
          </div>

          {renderTab()}
        </main>
      </div>
    </>
  );
}
