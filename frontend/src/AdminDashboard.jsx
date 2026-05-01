import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import MembersAdmin          from "./MembersAdmin.jsx";
import AttendanceList        from "./AttendanceList.jsx";
import MemberReports         from "./MemberReports.jsx";
import { FinanceManagement } from "./Finance.jsx";
import Announcement          from "./components/Announcement.jsx";
import Gymequipment          from "./components/Gymequipment.jsx";
import DemoBookingAdmin      from "./components/DemoBookingAdmin.jsx";
import PasswordField          from "./components/PasswordField.jsx";
import api                   from "./api/axios";
import { getDashboardSummary, getMonthlyIncome, getPlans, getBatches, createBatch, updateBatch, deleteBatch, getEventRegistrations } from "./api/coreService";
import { getDemoStats, getAllStaff, getMemberIdByVisitorId, changeMemberRole, deleteStaff, getAllDemoBookings, getAllVisitors, confirmDemoDate, cancelDemoBooking, deleteVisitor, getAllLeaves, approveLeave, rejectLeave, deleteLeave } from "./api/authAdminService";

const EVENT_TYPES = ["WORKSHOP", "COMPETITION", "SPECIAL_CLASS", "DANDIYA", "GARBA", "WEDDING_CHOREOGRAPHY","OTHER"];
const COSTUME_CATEGORIES = ["DANDIYA", "GARBA", "WEDDING", "ZUMBA", "GENERAL"];

const uploadImageToMediaService = async (file, category) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);
  formData.append("visibility", "PUBLIC");
  const response = await api.post("/api/media/upload", formData);
  const fileUrl = response?.data?.fileUrl;
  if (!fileUrl) throw new Error("Upload succeeded but no fileUrl returned: " + JSON.stringify(response.data));
  return fileUrl;
};

const S = {
  root:      { display:"flex", minHeight:"100vh", fontFamily:"'Poppins',sans-serif", background:"#f0f4ff" },
  sidebar:   (collapsed) => ({ width:collapsed?64:260, background:"#1A1A1D", display:"flex", flexDirection:"column", position:"fixed", height:"100vh", overflowY:"auto", overflowX:"hidden", zIndex:100, transition:"width 0.25s ease" }),
  brand:     (collapsed) => ({ padding:"1rem", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:collapsed?"center":"space-between", gap:"0.5rem" }),
  brandTxt:  { fontSize:"1.2rem", fontWeight:700, background:"linear-gradient(135deg,#8e2bbd,#98cfff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", margin:0, whiteSpace:"nowrap", overflow:"hidden" },
  hamburger: { background:"transparent", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:"1.2rem", padding:"0.25rem", flexShrink:0, lineHeight:1 },
  adminBox:  (collapsed) => ({ padding:"0.75rem", margin:"0.75rem", background:"rgba(62,9,148,0.15)", borderRadius:10, border:"1px solid rgba(62,9,148,0.3)", textAlign:"center", display:collapsed?"none":"block" }),
  nav:       { padding:"0.5rem", flex:1 },
  navBtn:    (collapsed) => ({ display:"flex", alignItems:"center", gap:collapsed?0:"0.75rem", justifyContent:collapsed?"center":"flex-start", width:"100%", padding:collapsed?"0.85rem 0":"0.85rem 1rem", borderTopWidth:0, borderRightWidth:0, borderBottomWidth:0, borderLeftWidth:0, borderStyle:"solid", borderColor:"transparent", background:"transparent", color:"#94a3b8", cursor:"pointer", borderRadius:8, fontSize:"0.9rem", fontFamily:"inherit", textAlign:"left", transition:"all 0.2s", overflow:"hidden" }),
  navActive: { background:"rgba(62,9,148,0.25)", color:"#fff", borderLeftWidth:3, borderLeftColor:"#8e2bbd" },
  navLabel:  (collapsed) => ({ whiteSpace:"nowrap", overflow:"hidden", maxWidth:collapsed?0:200, transition:"max-width 0.25s ease", display:"inline-block" }),
  main:      (collapsed) => ({ marginLeft:collapsed?64:260, flex:1, padding:"2rem", minHeight:"100vh", transition:"margin-left 0.25s ease" }),
  header:    { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"2rem" },
  h1:        { fontSize:"1.8rem", fontWeight:700, background:"linear-gradient(135deg,#3e0994,#98cfff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", margin:0 },
  card:      { background:"#fff", borderRadius:14, padding:"1.5rem", boxShadow:"0 4px 20px rgba(62,9,148,0.08)", border:"1px solid rgba(62,9,148,0.1)", marginBottom:"1.5rem" },
  statGrid:  { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"1rem", marginBottom:"2rem" },
  statCard:  { background:"#fff", borderRadius:12, padding:"1.25rem", boxShadow:"0 4px 16px rgba(62,9,148,0.08)", border:"1px solid rgba(62,9,148,0.1)", textAlign:"center" },
  statVal:   { fontSize:"2rem", fontWeight:800, color:"#3e0994" },
  statLbl:   { fontSize:"0.8rem", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px" },
  btn:     { padding:"0.65rem 1.25rem", borderRadius:8, border:"none", cursor:"pointer", fontWeight:600, fontSize:"0.9rem", fontFamily:"inherit", transition:"all 0.2s" },
  primary: { background:"linear-gradient(135deg,#3e0994,#8e2bbd)", color:"#fff" },
  danger:  { background:"#ef4444", color:"#fff" },
  success: { background:"#22c55e", color:"#fff" },
  ghost:   { background:"rgba(62,9,148,0.1)", color:"#3e0994", border:"1px solid rgba(62,9,148,0.2)" },
  table:   { width:"100%", borderCollapse:"collapse" },
  th:      { padding:"0.85rem 1rem", background:"linear-gradient(135deg,#3e0994,#6d28d9)", color:"#fff", textAlign:"left", fontSize:"0.82rem", textTransform:"uppercase", letterSpacing:"0.5px" },
  td:      { padding:"0.85rem 1rem", borderBottom:"1px solid #f1f5f9", color:"#1e293b", fontSize:"0.9rem" },
  badge:   { padding:"0.25rem 0.75rem", borderRadius:20, fontSize:"0.78rem", fontWeight:600 },
  modal:   { position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" },
  mbox:    { background:"#fff", borderRadius:16, padding:"2rem", width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.3)" },
  field:   { marginBottom:"1rem" },
  label:   { display:"block", marginBottom:"0.4rem", fontWeight:600, fontSize:"0.88rem", color:"#374151" },
  input:   { width:"100%", padding:"0.7rem 1rem", borderRadius:8, border:"1px solid #d1d5db", fontSize:"0.9rem", boxSizing:"border-box", fontFamily:"inherit" },
  toast:   { position:"fixed", bottom:"1.5rem", right:"1.5rem", zIndex:99999, padding:"1rem 1.5rem", borderRadius:10, fontWeight:600, color:"#fff", boxShadow:"0 8px 24px rgba(0,0,0,0.2)" },
  grid:    { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1.25rem", marginBottom:"1.5rem" },
};

const badgeTone = (tone) => {
  const tones = {
    green: { background: "#dcfce7", color: "#166534" },
    blue: { background: "#dbeafe", color: "#1d4ed8" },
    yellow: { background: "#fef3c7", color: "#92400e" },
    red: { background: "#fee2e2", color: "#b91c1c" },
  };
  return { ...S.badge, ...(tones[tone] || tones.blue) };
};

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div style={{ ...S.toast, background: type==="error"?"#ef4444":"#22c55e" }}>{type==="error"?"❌":"✅"} {msg}</div>;
}

function Modal({ title, onClose, children }) {
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.mbox} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
          <h3 style={{ margin:0, color:"#1e293b" }}>{title}</h3>
          <button onClick={onClose} style={{ ...S.btn, padding:"0.35rem 0.75rem", background:"#f1f5f9", color:"#64748b" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DashboardSection({ goTo }) {
  const [summary, setSummary]     = useState(null);
  const [finance, setFinance]     = useState(null);
  const [demoStats, setDemoStats] = useState(null);
  const now = new Date();
  useEffect(() => {
    getDashboardSummary().then(r=>setSummary(r.data)).catch(()=>{});
    getMonthlyIncome(now.getFullYear(), now.getMonth()+1).then(r=>setFinance(r.data)).catch(()=>{});
    getDemoStats().then(r=>setDemoStats(r.data)).catch(()=>{});
  }, []);
  const stats = [
    { label:"Total Members",   val:summary?.totalMembers    ??"—", icon:"fa-users",          color:"#3e0994", page:"members" },
    { label:"Active Members",  val:summary?.activeMembers   ??"—", icon:"fa-user-check",     color:"#22c55e", page:"members" },
    { label:"Demos Booked",    val:demoStats?.total         ??"—", icon:"fa-calendar-check", color:"#f59e0b", page:"demos" },
    { label:"Slots Available", val:demoStats?.availableSlots??"—", icon:"fa-calendar",       color:"#6366f1", page:"demos" },
    { label:"Monthly Revenue", val:finance?.totalIncome!=null?`₹${Number(finance.totalIncome).toLocaleString()}`:"—", icon:"fa-rupee-sign", color:"#10b981", page:"finance" },
    { label:"Net Profit",      val:finance?.netProfit!=null?`₹${Number(finance.netProfit).toLocaleString()}`:"—", icon:"fa-chart-line", color:"#8b5cf6", page:"finance" },
  ];
  const quickLinks = [
    { label:"Members",      icon:"fa-users",          page:"members",       color:"#3e0994" },
    { label:"Attendance",   icon:"fa-calendar-check", page:"attendance",    color:"#22c55e" },
    { label:"Demo Bookings",icon:"fa-calendar-alt",   page:"demos",         color:"#f59e0b" },
    { label:"Batches",      icon:"fa-layer-group",    page:"batches",       color:"#8b5cf6" },
    { label:"Announcements",icon:"fa-bullhorn",        page:"announcements", color:"#6366f1" },
    { label:"Equipment",    icon:"fa-dumbbell",        page:"equipment",     color:"#ef4444" },
    { label:"Staff",        icon:"fa-user-tie",        page:"staff",         color:"#8b5cf6" },
    { label:"Finance",      icon:"fa-rupee-sign",      page:"finance",       color:"#10b981" },
    { label:"Reports",      icon:"fa-chart-bar",       page:"reports",       color:"#f59e0b" },
  ];
  return (
    <>
      <div style={S.statGrid}>
        {stats.map(s=>(
          <div key={s.label} style={{ ...S.statCard, cursor:"pointer" }} onClick={()=>goTo(s.page)}>
            <i className={`fas ${s.icon}`} style={{ fontSize:"1.5rem", color:s.color, marginBottom:"0.5rem" }} />
            <div style={{ ...S.statVal, color:s.color }}>{s.val}</div>
            <div style={S.statLbl}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <h3 style={{ margin:"0 0 1rem", color:"#3e0994" }}>Quick Navigation</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:"0.75rem" }}>
          {quickLinks.map(q=>(
            <button key={q.label} style={{ padding:"1rem", borderRadius:10, border:`1px solid ${q.color}30`, background:`${q.color}10`, color:q.color, cursor:"pointer", fontWeight:600, fontSize:"0.85rem", fontFamily:"inherit", display:"flex", flexDirection:"column", alignItems:"center", gap:"0.5rem" }} onClick={()=>goTo(q.page)}>
              <i className={`fas ${q.icon}`} style={{ fontSize:"1.3rem" }} />{q.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function DemoSection() {
  const [bookings, setBookings]   = useState([]);
  const [stats, setStats]         = useState(null);
  const [visitors, setVisitors]   = useState([]);
  const [plans, setPlans]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState({ msg:"", type:"" });
  const [showConvert, setShowConvert] = useState(null);
  const [convertForm, setConvertForm] = useState({ planId:"", password:"Member@123" });
  const [tab, setTab]             = useState("bookings");
  const notify = (msg, type="success") => { setToast({ msg, type }); setTimeout(()=>setToast({ msg:"", type:"" }), 3000); };

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [b,s,v,p] = await Promise.all([getAllDemoBookings(), getDemoStats(), getAllVisitors(), getPlans()]);
      setBookings(b.data||[]); setStats(s.data||{}); setVisitors(v.data||[]); setPlans(p.data||[]);
    } catch { notify("Failed to load","error"); } finally { setLoading(false); }
  }, []);
  useEffect(()=>{ load(); }, [load]);

  const handleConvert = async (e) => {
    e.preventDefault();
    if (!convertForm.planId) { notify("Select a plan","error"); return; }
    try {
      const memberIdRes = await getMemberIdByVisitorId(showConvert.visitorId);
      const memberId = memberIdRes.data?.memberId;
      if (!memberId) {
        notify(`Could not resolve member record for ${showConvert.name}`, "error");
        return;
      }
      await changeMemberRole(memberId, "MEMBER", showConvert.visitorId);
      notify(`${showConvert.name} converted to Member!`);
      setShowConvert(null); load();
    } catch (err) { notify(err.response?.data?.message || err.message || "Failed", "error"); }
  };

  return (
    <>
      <Toast {...toast} />
      <div style={S.statGrid}>
        {[{ label:"Total",val:stats?.total??"—",color:"#3e0994" },{ label:"Confirmed",val:(stats?.confirmed??0)+(stats?.free??0),color:"#22c55e" },{ label:"Pending",val:stats?.pending??"—",color:"#f59e0b" },{ label:"Cancelled",val:stats?.cancelled??"—",color:"#ef4444" },{ label:"Total Slots",val:stats?.totalSlots??"—",color:"#6366f1" },{ label:"Available",val:stats?.availableSlots??"—",color:"#10b981" }].map(s=>(
          <div key={s.label} style={S.statCard}><div style={{ ...S.statVal, color:s.color }}>{s.val}</div><div style={S.statLbl}>{s.label}</div></div>
        ))}
      </div>
      <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.5rem" }}>
        {[["bookings","Demo Bookings","fa-calendar-check"],["visitors","Visitors","fa-users"]].map(([k,l,i])=>(
          <button key={k} style={{ ...S.btn, ...(tab===k?S.primary:S.ghost) }} onClick={()=>setTab(k)}><i className={`fas ${i}`} /> {l}</button>
        ))}
      </div>
      {tab==="bookings" && (
        <div style={{ ...S.card, overflowX:"auto" }}>
          <table style={S.table}>
            <thead><tr>{["#","Visitor","Slot","Status","Amount","Booked","Set Demo Date","Action"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {loading?<tr><td colSpan={8} style={{ ...S.td, textAlign:"center" }}>Loading…</td></tr>:
              bookings.map((b,i)=>(
                <tr key={b.bookingId}>
                  <td style={S.td}>{i+1}</td><td style={S.td}>{b.visitorId}</td><td style={S.td}>{b.slotId}</td>
                  <td style={S.td}><span style={{ ...S.badge, background:["FREE","CONFIRMED"].includes(b.status)?"#dcfce7":b.status==="CANCELLED"?"#fee2e2":"#fef3c7", color:["FREE","CONFIRMED"].includes(b.status)?"#166534":b.status==="CANCELLED"?"#dc2626":"#92400e" }}>{b.status}</span></td>
                  <td style={S.td}>₹{b.finalAmount}</td>
                  <td style={S.td}>{b.bookedAt?new Date(b.bookedAt).toLocaleDateString():"—"}</td>
                  <td style={S.td}><input type="date" style={{ ...S.input, padding:"0.3rem 0.5rem", fontSize:"0.8rem", width:140 }} defaultValue={b.confirmedAt?b.confirmedAt.split("T")[0]:""} onChange={e=>confirmDemoDate(b.bookingId,e.target.value).then(load).catch(()=>notify("Failed","error"))} /></td>
                  <td style={S.td}>{b.status!=="CANCELLED"&&<button style={{ ...S.btn, ...S.danger, padding:"0.3rem 0.7rem", fontSize:"0.8rem" }} onClick={()=>{ if(window.confirm("Cancel?")) cancelDemoBooking(b.bookingId).then(load).catch(()=>notify("Failed","error")); }}><i className="fas fa-times" /></button>}</td>
                </tr>
              ))}
              {!loading&&bookings.length===0&&<tr><td colSpan={8} style={{ ...S.td, textAlign:"center", color:"#94a3b8", padding:"2rem" }}>No bookings yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {tab==="visitors" && (
        <div style={{ ...S.card, overflowX:"auto" }}>
          <table style={S.table}>
            <thead><tr>{["#","Name","Email","Phone","Inquiry","Visit Date","Demo Date Pref","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {loading?<tr><td colSpan={8} style={{ ...S.td, textAlign:"center" }}>Loading…</td></tr>:
              visitors.map((v,i)=>(
                <tr key={v.visitorId}>
                  <td style={S.td}>{i+1}</td><td style={S.td}><strong>{v.name}</strong></td><td style={S.td}>{v.email||"—"}</td><td style={S.td}>{v.phone||"—"}</td>
                  <td style={S.td}>{v.inquirySource||"—"}</td><td style={S.td}>{v.visitDate||"—"}</td><td style={S.td}>{v.demoDatePreference||"—"}</td>
                  <td style={S.td}>
                    <div style={{ display:"flex", gap:"0.5rem" }}>
                      <button style={{ ...S.btn, ...S.success, padding:"0.3rem 0.7rem", fontSize:"0.8rem" }} onClick={()=>setShowConvert(v)}><i className="fas fa-user-plus" /> → Member</button>
                      <button style={{ ...S.btn, ...S.danger, padding:"0.3rem 0.7rem", fontSize:"0.8rem" }} onClick={()=>{ if(window.confirm(`Remove ${v.name}?`)) deleteVisitor(v.visitorId).then(load).catch(()=>notify("Failed","error")); }}><i className="fas fa-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading&&visitors.length===0&&<tr><td colSpan={8} style={{ ...S.td, textAlign:"center", color:"#94a3b8", padding:"2rem" }}>No visitors</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {showConvert&&(
        <Modal title={`Convert "${showConvert.name}" → Member`} onClose={()=>setShowConvert(null)}>
          <div style={{ background:"#f0f4ff", borderRadius:8, padding:"1rem", marginBottom:"1rem", fontSize:"0.9rem" }}>
            <div><strong>Name:</strong> {showConvert.name}</div><div><strong>Email:</strong> {showConvert.email}</div><div><strong>Phone:</strong> {showConvert.phone||"—"}</div>
          </div>
          <form onSubmit={handleConvert}>
            <div style={S.field}><label style={S.label}>Membership Plan *</label>
              <select style={S.input} value={convertForm.planId} onChange={e=>setConvertForm(f=>({...f,planId:e.target.value}))} required>
                <option value="">— Select plan —</option>
                {plans.filter(p=>p.isActive).map(p=><option key={p.id} value={p.id}>{p.name} — ₹{Number(p.price).toLocaleString()} / {p.durationMonths}mo</option>)}
              </select>
            </div>
            <div style={S.field}><label style={S.label}>Member Password</label><PasswordField value={convertForm.password} onChange={e=>setConvertForm(f=>({...f,password:e.target.value}))} minLength={6} inputStyle={S.input} placeholder="Set or leave blank" /></div>
            <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.5rem" }}>
              <button type="submit" style={{ ...S.btn, ...S.primary, flex:1 }}><i className="fas fa-user-plus" /> Convert to Member</button>
              <button type="button" style={{ ...S.btn, ...S.ghost, flex:1 }} onClick={()=>setShowConvert(null)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function BatchSection() {
  const BATCH_TYPE_OPTIONS = ["ZUMBA", "FITNESS", "YOGA", "CROSSFIT", "CARDIO", "GENERAL", "DANCE"];
  const [batches, setBatches]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showAdd, setShowAdd]           = useState(false);
  const [editMode, setEditMode]         = useState(false);
  const [draftBatches, setDraftBatches] = useState([]);
  const [deleteMode, setDeleteMode]     = useState(false);
  const [selectedIds, setSelectedIds]   = useState(new Set());
  const [toast, setToast]               = useState({ msg:"", type:"" });
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm]                 = useState({ name:"", type:"ZUMBA", timeSlot:"", capacity:"", trainerId:"" });

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:"", type:"" }), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await getBatches();
      setBatches(Array.isArray(res.data) ? res.data : []);
      setSelectedIds(new Set());
      setDraftBatches([]);
      setEditMode(false);
      setDeleteMode(false);
    } catch (err) {
      notify("Failed to load batches", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredBatches = batches.filter((batch) => {
    if (filterStatus === "active") return !!batch.isActive;
    if (filterStatus === "inactive") return !batch.isActive;
    return true;
  });

  const resetForm = () => {
    setForm({ name:"", type:"ZUMBA", timeSlot:"", capacity:"", trainerId:"" });
  };

  const openEditMode = () => {
    if (deleteMode) {
      setDeleteMode(false);
      setSelectedIds(new Set());
    }
    setDraftBatches(filteredBatches.map((batch) => ({ ...batch })));
    setEditMode(true);
  };

  const cancelEditMode = () => {
    setEditMode(false);
    setDraftBatches([]);
    setDeleteMode(false);
    setSelectedIds(new Set());
  };

  const handleDraftChange = (batchId, field, value) => {
    setDraftBatches((prev) => prev.map((batch) => (batch.id === batchId ? { ...batch, [field]: value } : batch)));
  };

  const handleSaveEdits = async () => {
    const updates = draftBatches.filter((batch) => {
      const original = batches.find((b) => b.id === batch.id);
      return original && (
        batch.name !== original.name ||
        batch.type !== original.type ||
        batch.timeSlot !== original.timeSlot ||
        String(batch.capacity) !== String(original.capacity) ||
        String(batch.trainerId ?? "") !== String(original.trainerId ?? "") ||
        String(batch.isActive ?? "") !== String(original.isActive ?? "")
      );
    });

    if (updates.length === 0) {
      notify("No changes to save", "error");
      return;
    }

    const invalid = updates.find((batch) =>
      !batch.name?.trim() ||
      !batch.timeSlot?.trim() ||
      Number(batch.capacity) <= 0 ||
      !["0", "1", "true", "false"].includes(String(batch.isActive).toLowerCase())
    );
    if (invalid) {
      notify("Edited rows must have valid name, time slot, capacity and active value", "error");
      return;
    }

    if (!window.confirm(`Save changes for ${updates.length} batch${updates.length > 1 ? "es" : ""}?`)) return;

    try {
      setLoading(true);
      await Promise.all(updates.map((batch) => updateBatch(batch.id, {
        name: batch.name.trim(),
        type: batch.type,
        timeSlot: batch.timeSlot.trim(),
        capacity: Number(batch.capacity),
        trainerId: batch.trainerId ? Number(batch.trainerId) : null,
        isActive: String(batch.isActive).toLowerCase() === "1" || String(batch.isActive).toLowerCase() === "true",
      })));
      notify("Batch changes saved successfully");
      cancelEditMode();
      load();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to save batch changes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.timeSlot.trim() || !form.capacity.trim()) {
      notify("Name, time slot and capacity are required", "error");
      return;
    }
    try {
      await createBatch({
        name: form.name.trim(),
        type: form.type,
        timeSlot: form.timeSlot.trim(),
        capacity: Number(form.capacity),
        trainerId: form.trainerId ? Number(form.trainerId) : null,
      });
      notify("Batch added successfully");
      setShowAdd(false);
      resetForm();
      load();
    } catch (err) {
      const apiMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string" ? err.response.data : null);
      notify(apiMessage || "Failed to create batch", "error");
    }
  };

  const toggleSelect = (batchId, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(batchId);
      else next.delete(batchId);
      return next;
    });
  };

  const handleApplyDelete = async () => {
    if (selectedIds.size === 0) {
      notify("Select at least one batch to delete", "error");
      return;
    }
    if (!window.confirm(`Delete ${selectedIds.size} selected batch${selectedIds.size > 1 ? "es" : ""}?`)) return;

    try {
      setLoading(true);
      await Promise.all(Array.from(selectedIds).map((id) => deleteBatch(id)));
      notify("Selected batches deleted successfully");
      setDeleteMode(false);
      setSelectedIds(new Set());
      load();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to delete selected batches", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleActivateBatch = async (batchId) => {
    if (!window.confirm("Activate this batch?")) return;
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) {
      notify("Batch not found", "error");
      return;
    }

    try {
      await updateBatch(batchId, {
        name: batch.name,
        type: batch.type,
        timeSlot: batch.timeSlot,
        capacity: Number(batch.capacity),
        trainerId: batch.trainerId ? Number(batch.trainerId) : null,
        isActive: true,
      });
      notify("Batch activated successfully");
      load();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to activate batch", "error");
    }
  };

  return (
    <>
      <Toast {...toast} />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"1rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
        <div>
          <p style={{ margin:"0.5rem 0 0", color:"#64748b" }}>
            View batches, filter by status, and activate inactive batches.
          </p>
          {deleteMode && (
            <p style={{ margin:"0.5rem 0 0", color:"#dc2626", fontWeight:600 }}>
              Select rows then click Apply Delete to remove batches.
            </p>
          )}
        </div>

        <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <label style={{ fontWeight:600, color:"#374151" }}>Filter:</label>
            <select
              style={{ ...S.input, padding:"0.5rem 0.75rem", minWidth:"140px" }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Batches</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <button
            style={{ ...S.btn, ...S.primary, whiteSpace:"nowrap" }}
            onClick={() => {
              resetForm();
              setDeleteMode(false);
              setSelectedIds(new Set());
              cancelEditMode();
              setShowAdd(true);
            }}
          >
            <i className="fas fa-plus" /> Add Batch
          </button>

          {editMode ? (
            <>
              <button style={{ ...S.btn, ...S.success, whiteSpace:"nowrap" }} onClick={handleSaveEdits} disabled={loading}>
                <i className="fas fa-save" /> Save Changes
              </button>
              <button style={{ ...S.btn, ...S.ghost, whiteSpace:"nowrap" }} onClick={cancelEditMode}>
                <i className="fas fa-times" /> Cancel Edit
              </button>
            </>
          ) : (
            <>
              <button style={{ ...S.btn, ...S.ghost, whiteSpace:"nowrap" }} onClick={openEditMode}>
                <i className="fas fa-edit" /> Edit Table
              </button>
              {deleteMode ? (
                <>
                  <button style={{ ...S.btn, ...S.danger, whiteSpace:"nowrap" }} onClick={handleApplyDelete} disabled={selectedIds.size === 0}>
                    <i className="fas fa-check" /> Apply Delete
                  </button>
                  <button style={{ ...S.btn, ...S.ghost, whiteSpace:"nowrap" }} onClick={() => { setDeleteMode(false); setSelectedIds(new Set()); }}>
                    <i className="fas fa-times" /> Cancel
                  </button>
                </>
              ) : (
                <button style={{ ...S.btn, ...S.danger, whiteSpace:"nowrap" }} onClick={() => { setDeleteMode(true); setSelectedIds(new Set()); }}>
                  <i className="fas fa-trash" /> Delete Batches
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ ...S.card, overflowX:"auto" }}>
        <table style={S.table}>
          <thead>
            <tr>
              {[deleteMode ? "Select" : "#", "Name", "Type", "Time Slot", "Capacity", "Enrolled", "Available", "Trainer ID", "Active"].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} style={{ ...S.td, textAlign:"center" }}>Loading batches...</td></tr>
            ) : filteredBatches.length === 0 ? (
              <tr><td colSpan={10} style={{ ...S.td, textAlign:"center", color:"#94a3b8", padding:"2rem" }}>No batches found.</td></tr>
            ) : filteredBatches.map((batch, index) => {
              const draft = editMode ? draftBatches.find((d) => d.id === batch.id) || batch : batch;
              return (
                <tr key={batch.id}>
                  <td style={S.td}>
                    {deleteMode ? (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(batch.id)}
                        onChange={(e) => toggleSelect(batch.id, e.target.checked)}
                      />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </td>
                  <td style={S.td}>
                    {editMode ? (
                      <input style={S.input} value={draft.name || ""} onChange={(e) => handleDraftChange(batch.id, "name", e.target.value)} />
                    ) : batch.name}
                  </td>
                  <td style={S.td}>
                    {editMode ? (
                      <select style={S.input} value={draft.type || "ZUMBA"} onChange={(e) => handleDraftChange(batch.id, "type", e.target.value)}>
                        {BATCH_TYPE_OPTIONS.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    ) : batch.type}
                  </td>
                  <td style={S.td}>
                    {editMode ? (
                      <input style={S.input} value={draft.timeSlot || ""} onChange={(e) => handleDraftChange(batch.id, "timeSlot", e.target.value)} />
                    ) : batch.timeSlot}
                  </td>
                  <td style={S.td}>
                    {editMode ? (
                      <input style={S.input} type="number" min="1" value={draft.capacity ?? ""} onChange={(e) => handleDraftChange(batch.id, "capacity", e.target.value)} />
                    ) : batch.capacity}
                  </td>
                  <td style={S.td}>{batch.currentEnrollment ?? 0}</td>
                  <td style={S.td}>{batch.availableSlots ?? (batch.capacity ?? 0)}</td>
                  <td style={S.td}>
                    {editMode ? (
                      <input
                        style={S.input}
                        type="number"
                        min="1"
                        value={draft.trainerId ?? ""}
                        onChange={(e) => handleDraftChange(batch.id, "trainerId", e.target.value)}
                        placeholder="Optional"
                      />
                    ) : batch.trainerId ?? "-"}
                  </td>
                  <td style={S.td}>
                    {editMode ? (
                      <select
                        style={S.input}
                        value={String(draft.isActive ?? (batch.isActive ? "1" : "0"))}
                        onChange={(e) => handleDraftChange(batch.id, "isActive", e.target.value)}
                      >
                        <option value="1">1</option>
                        <option value="0">0</option>
                      </select>
                    ) : (batch.isActive ? "1" : "0")}
                  </td>
                  <td style={S.td}>
                    {!editMode && !deleteMode && !batch.isActive && (
                      <button
                        style={{ ...S.btn, ...S.success, fontSize:"0.75rem", padding:"0.35rem 0.6rem" }}
                        onClick={() => handleActivateBatch(batch.id)}
                      >
                        <i className="fas fa-play" /> Activate
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title="Add New Batch" onClose={() => { setShowAdd(false); resetForm(); }}>
          <form onSubmit={handleAdd}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
              <div style={S.field}>
                <label style={S.label}>Batch Name *</label>
                <input style={S.input} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div style={S.field}>
                <label style={S.label}>Batch Type *</label>
                <select style={S.input} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} required>
                  {BATCH_TYPE_OPTIONS.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div style={S.field}>
                <label style={S.label}>Time Slot *</label>
                <input style={S.input} value={form.timeSlot} onChange={(e) => setForm((f) => ({ ...f, timeSlot: e.target.value }))} placeholder="e.g. 06:00 - 07:00" required />
              </div>
              <div style={S.field}>
                <label style={S.label}>Capacity *</label>
                <input style={S.input} type="number" min="1" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} required />
              </div>
              <div style={S.field}>
                <label style={S.label}>Trainer ID</label>
                <input style={S.input} type="number" min="1" value={form.trainerId} onChange={(e) => setForm((f) => ({ ...f, trainerId: e.target.value }))} placeholder="Optional trainer id" />
              </div>
            </div>
            <div style={{ display:"flex", gap:"0.75rem", marginTop:"1rem" }}>
              <button type="button" style={{ ...S.btn, ...S.ghost, flex:1 }} onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" style={{ ...S.btn, ...S.primary, flex:1 }}>
                <i className="fas fa-save" /> Create Batch
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function StaffSection() {
  const [staff, setStaff]     = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [toast, setToast]     = useState({ msg:"", type:"" });
  const [form, setForm]       = useState({ name:"", email:"", phone:"", password:"", gymCenter:"", role:"TRAINER", salary:"", batchId:"" });
  const [errs, setErrs]       = useState({});

  const notify = (msg, type="success") => { setToast({ msg, type }); setTimeout(()=>setToast({ msg:"", type:"" }), 3000); };

  const load = async () => {
    setLoading(true);
    try {
      const [r, b] = await Promise.all([getAllStaff(), getBatches()]);
      setStaff(r.data || []);
      setBatches(Array.isArray(b.data) ? b.data : []);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404 || status === 500) {
        // Endpoint not available yet — auth service needs restart
        setStaff([]);
      } else {
        notify("Failed to load staff — please restart the auth service", "error");
      }
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                                 e.name     = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))   e.email    = "Valid email required";
    if (!/^\d{10}$/.test(form.phone))                      e.phone    = "10-digit phone required";
    if (!form.password || form.password.length < 6)        e.password = "Min 6 characters";
    return e;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrs(v); return; }
    setErrs({});
    try {
      const payload = {
        name: form.name, email: form.email, phone: form.phone,
        password: form.password, gymCenter: form.gymCenter,
        ...(form.salary !== "" && { salary: Number(form.salary) }),
      };
      if (form.role === "TRAINER") {
        const res = await api.post("/api/auth/admin/register-trainer", payload);
        if (form.batchId) {
          const batch = batches.find(b => String(b.id) === String(form.batchId));
          if (batch) {
            const trainerId = res.data?.memberId || res.data?.id;
            if (trainerId) await updateBatch(batch.id, { name: batch.name, type: batch.type, timeSlot: batch.timeSlot, capacity: batch.capacity, trainerId: Number(trainerId), isActive: batch.isActive });
          }
        }
      } else {
        await api.post("/api/auth/admin/register", payload);
      }
      notify(`${form.role === "TRAINER" ? "Trainer" : "Admin"} "${form.name}" added successfully!`);
      setShowAdd(false);
      setForm({ name:"", email:"", phone:"", password:"", gymCenter:"", role:"TRAINER", salary:"", batchId:"" });
      load();
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message || err.response?.data;
      if (status === 409) notify("Email already registered","error");
      else if (status === 403) notify("Access denied — make sure you are logged in as ADMIN","error");
      else notify(typeof msg === "string" ? msg : "Failed to add staff","error");
    }
  };

  const roleColor = (role) => {
    if (role === "ADMIN")   return { background:"#ede9fe", color:"#6d28d9" };
    if (role === "TRAINER") return { background:"#dbeafe", color:"#1d4ed8" };
    return { background:"#f1f5f9", color:"#64748b" };
  };

  const toggleSelect = (memberId, checked) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(memberId);
      else next.delete(memberId);
      return next;
    });
  };

  const handleDeleteClick = async () => {
    if (!deleteMode) {
      setDeleteMode(true);
      setSelectedIds(new Set());
      return;
    }

    if (selectedIds.size === 0) {
      notify("Select at least one staff/trainer to delete", "error");
      return;
    }

    if (!window.confirm(`Delete ${selectedIds.size} selected record${selectedIds.size > 1 ? "s" : ""}?`)) return;

    try {
      setLoading(true);
      await Promise.all(Array.from(selectedIds).map(id => deleteStaff(id)));
      notify("Selected staff/trainer deleted successfully");
      setDeleteMode(false);
      setSelectedIds(new Set());
      load();
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.response?.data;
      if (status === 403) notify("Access denied — make sure you are logged in as ADMIN", "error");
      else notify(typeof msg === "string" ? msg : "Failed to delete selected records", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteMode(false);
    setSelectedIds(new Set());
  };

  return (
    <>
      <Toast {...toast} />
      <div style={{ display:"flex", gap:"1rem", marginBottom:"1.5rem" }}>
        <button style={{ ...S.btn, ...S.primary }} onClick={() => setShowAdd(true)}>
          <i className="fas fa-user-plus" /> Add Trainer / Staff
        </button>
        <button style={{ ...S.btn, ...S.danger }} onClick={handleDeleteClick}>
          <i className="fas fa-trash" /> {deleteMode ? "Delete Selected" : "Delete Staff / Trainer"}
        </button>
        {deleteMode && (
          <button style={{ ...S.btn, ...S.ghost }} onClick={handleCancelDelete}>
            <i className="fas fa-times" /> Cancel Delete
          </button>
        )}
      </div>

      <div style={{ ...S.card, overflowX:"auto" }}>
        <p style={{ color:"#64748b", marginBottom:"1rem", fontSize:"0.9rem" }}>
          {loading ? "Loading…" : `${staff.length} staff member${staff.length !== 1 ? "s" : ""}`}
        </p>
        <table style={S.table}>
          <thead>
            <tr>{[deleteMode ? "Select" : "#","Name","Email","Phone","Role","Gym Center","Salary","Batch","Joined"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {staff.map((s, i) => {
              const assignedBatch = batches.find(b => String(b.trainerId) === String(s.memberId));
              return (
                <tr key={s.memberId}>
                  <td style={S.td}>
                    {deleteMode ? (
                      <input type="checkbox" checked={selectedIds.has(s.memberId)} onChange={e => toggleSelect(s.memberId, e.target.checked)} />
                    ) : i + 1}
                  </td>
                  <td style={S.td}><strong>{s.name}</strong></td>
                  <td style={S.td}>{s.email || "—"}</td>
                  <td style={S.td}>{s.phone || "—"}</td>
                  <td style={S.td}><span style={{ ...S.badge, ...roleColor(s.role) }}>{s.role}</span></td>
                  <td style={S.td}>{s.gymCenter || "—"}</td>
                  <td style={S.td}>{s.salary != null ? `₹${Number(s.salary).toLocaleString("en-IN")}` : "—"}</td>
                  <td style={S.td}>{assignedBatch ? <span style={badgeTone("blue")}>{assignedBatch.name}</span> : "—"}</td>
                  <td style={S.td}>{s.joinedAt ? new Date(s.joinedAt).toLocaleDateString('en-IN') : "—"}</td>
                </tr>
              );
            })}
            {!loading && staff.length === 0 && (
              <tr><td colSpan={9} style={{ ...S.td, textAlign:"center", color:"#94a3b8", padding:"2rem" }}>
                <div>No staff found.</div>
                <div style={{ fontSize:"0.82rem", marginTop:"0.5rem", color:"#f59e0b" }}>
                  ⚠️ If you just added a trainer, restart the auth service to see them here:<br/>
                  <code style={{ background:"#f1f5f9", padding:"0.2rem 0.5rem", borderRadius:4, fontSize:"0.8rem" }}>
                    cd backend/gymApp-auth-login-service && mvn spring-boot:run
                  </code>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title="Add Trainer / Staff" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd}>
            {/* Role selector */}
            <div style={S.field}>
              <label style={S.label}>Role *</label>
              <div style={{ display:"flex", gap:"0.75rem" }}>
                {["TRAINER","ADMIN"].map(r => (
                  <button key={r} type="button"
                    style={{ ...S.btn, flex:1, ...(form.role === r ? S.primary : S.ghost) }}
                    onClick={() => setForm(f => ({...f, role:r}))}>
                    <i className={`fas ${r === "TRAINER" ? "fa-dumbbell" : "fa-user-shield"}`} /> {r}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 1rem" }}>
              {[
                ["name",      "Full Name *",    "text",     true],
                ["phone",     "Phone *",        "tel",      true],
                ["email",     "Email *",        "email",    true],
                ["password",  "Password *",     "password", true],
                ["gymCenter", "Gym Center",     "text",     false],
                ["salary",    "Salary (₹)",     "number",   false],
              ].map(([k, l, t, req]) => (
                <div key={k} style={{ ...S.field, gridColumn: ["email","gymCenter"].includes(k) ? "1 / -1" : "auto" }}>
                  <label style={S.label}>{l}</label>
                  <input
                    style={{ ...S.input, borderColor: errs[k] ? "#ef4444" : "#d1d5db" }}
                    type={t} required={req} value={form[k]}
                    min={k === "salary" ? "0" : undefined}
                    autoComplete={k === "password" ? "new-password" : "off"}
                    onChange={e => { setForm(f => ({...f, [k]:e.target.value})); setErrs(er => ({...er, [k]:""})); }}
                    placeholder={`Enter ${l.replace(" *","").replace(" (₹)","").toLowerCase()}`}
                  />
                  {errs[k] && <span style={{ color:"#ef4444", fontSize:"0.78rem" }}>{errs[k]}</span>}
                </div>
              ))}
              {form.role === "TRAINER" && (
                <div style={{ ...S.field, gridColumn: "1 / -1" }}>
                  <label style={S.label}>Assign Batch</label>
                  <select style={S.input} value={form.batchId} onChange={e => setForm(f => ({...f, batchId: e.target.value}))}>
                    <option value="">— No batch —</option>
                    {batches.filter(b => b.isActive).map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.timeSlot})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ background:"#f0f4ff", borderRadius:8, padding:"0.75rem", marginBottom:"1rem", fontSize:"0.82rem", color:"#3e0994" }}>
              <i className="fas fa-info-circle" /> The {form.role === "TRAINER" ? "trainer" : "admin"} will be saved to the <strong>member</strong> table with role <strong>{form.role}</strong> and can log in using their email and password.
            </div>

            <div style={{ display:"flex", gap:"0.75rem" }}>
              <button type="submit" style={{ ...S.btn, ...S.primary, flex:1 }}>
                <i className="fas fa-user-plus" /> Add {form.role === "TRAINER" ? "Trainer" : "Admin"}
              </button>
              <button type="button" style={{ ...S.btn, ...S.ghost, flex:1 }} onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function EventSection() {
  const emptyForm = {
    title: "",
    description: "",
    eventType: EVENT_TYPES[0],
    eventDate: "",
    timeSlot: "",
    venue: "",
    price: "",
    maxParticipants: "",
    imageUrl: "",
  };
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [pendingImagePreview, setPendingImagePreview] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [registrationsModal, setRegistrationsModal] = useState(null);
  const [loadingRegs, setLoadingRegs] = useState(false);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/public/events");
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      notify(err.response?.data?.message || "Failed to load gym events", "error");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    if (pendingImagePreview?.startsWith("blob:")) URL.revokeObjectURL(pendingImagePreview);
    setForm(emptyForm);
    setPendingImageFile(null);
    setPendingImagePreview("");
    setEditingId(null);
    setShowAdd(false);
  };

  useEffect(() => {
    return () => {
      if (pendingImagePreview?.startsWith("blob:")) URL.revokeObjectURL(pendingImagePreview);
    };
  }, [pendingImagePreview]);

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (pendingImagePreview?.startsWith("blob:")) URL.revokeObjectURL(pendingImagePreview);
    setPendingImageFile(file);
    setPendingImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const cancelImagePick = () => {
    if (pendingImagePreview?.startsWith("blob:")) URL.revokeObjectURL(pendingImagePreview);
    setPendingImageFile(null);
    setPendingImagePreview("");
  };

    const uploadPickedImage = async () => {
    if (!pendingImageFile) return;
    setUploadingImage(true);
    try {
      const fileUrl = await uploadImageToMediaService(pendingImageFile, "EVENT");
      setForm(prev => ({ ...prev, imageUrl: fileUrl }));
      notify("Image uploaded successfully");
      cancelImagePick();
    } catch (err) {
      notify(err.response?.data?.message || err.message || "Upload failed", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: form.price === "" ? 0 : Number(form.price),
        maxParticipants: form.maxParticipants === "" ? null : Number(form.maxParticipants),
        imageUrl: form.imageUrl.trim(),
      };
      if (editingId) {
        await api.put(`/api/public/events/${editingId}`, payload);
        notify("Gym event updated");
      } else {
        await api.post("/api/public/events", payload);
        notify("Gym event created");
      }
      resetForm();
      await load();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to save gym event", "error");
    } finally {
      setSaving(false);
    }
  };

  const editItem = (item) => {
    setEditingId(item.id);
    setShowAdd(true);
    setForm({
      title: item.title || "",
      description: item.description || "",
      eventType: item.eventType || EVENT_TYPES[0],
      eventDate: item.eventDate || "",
      timeSlot: item.timeSlot || "",
      venue: item.venue || "",
      price: item.price ?? "",
      maxParticipants: item.maxParticipants ?? "",
      imageUrl: item.imageUrl || "",
    });
  };

  const removeItem = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await api.delete(`/api/public/events/${id}`);
      notify("Gym event removed");
      await load();
    } catch (err) {
      if (err.response?.status === 403) {
        notify("Delete blocked. Make sure you are logged in as ADMIN and the backend service has been restarted.", "error");
      } else {
        notify(err.response?.data?.message || "Failed to delete event", "error");
      }
    }
  };

  const viewRegistrations = async (event) => {
    setLoadingRegs(true);
    setRegistrationsModal({ event, list: [] });
    try {
      const res = await getEventRegistrations(event.id);
      setRegistrationsModal({ event, list: res.data || [] });
    } catch {
      notify("Failed to load registrations", "error");
      setRegistrationsModal(null);
    } finally {
      setLoadingRegs(false);
    }
  };

  return (
    <>
      <Toast {...toast} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:"1rem", flexWrap:"wrap", marginBottom:"1rem" }}>
        <div>
          <h3 style={{ margin:"0 0 0.35rem", color:"#3e0994" }}>Gym Events</h3>
          <p style={{ margin:0, color:"#64748b", fontSize:"0.9rem" }}>Create events and track active status and registrations.</p>
        </div>
        <button type="button" style={{ ...S.btn, ...S.primary }} onClick={() => { resetForm(); setShowAdd(true); }}>
          <i className="fas fa-plus" /> Add Gym Event
        </button>
      </div>

      {showAdd && (
      <div style={{ ...S.card, padding: "1.25rem", marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0, color: "#3e0994" }}>{editingId ? "Edit Gym Event" : "Add Gym Event"}</h3>
        <form onSubmit={submit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            <div style={S.field}><label style={S.label}>Title *</label><input style={S.input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
            <div style={S.field}><label style={S.label}>Event Type *</label><select style={S.input} value={form.eventType} onChange={e => setForm(f => ({ ...f, eventType: e.target.value }))}>{EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div style={S.field}><label style={S.label}>Event Date *</label><input style={S.input} type="date" value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))} required /></div>
            <div style={S.field}><label style={S.label}>Time Slot</label><input style={S.input} value={form.timeSlot} onChange={e => setForm(f => ({ ...f, timeSlot: e.target.value }))} placeholder="6:00 PM - 9:00 PM" /></div>
            <div style={S.field}><label style={S.label}>Venue</label><input style={S.input} value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} /></div>
            <div style={S.field}><label style={S.label}>Price</label><input style={S.input} type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
            <div style={S.field}><label style={S.label}>Max Participants</label><input style={S.input} type="number" min="0" value={form.maxParticipants} onChange={e => setForm(f => ({ ...f, maxParticipants: e.target.value }))} /></div>
            <div style={{ ...S.field, gridColumn: "1 / -1" }}><label style={S.label}>Description</label><textarea style={{ ...S.input, minHeight: 90 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div style={{ ...S.field, gridColumn: "1 / -1" }}>
              <label style={S.label}>Event Photo</label>
              <input style={S.input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImagePick} />
              {pendingImageFile && (
                <div style={{ marginTop: "0.6rem", padding: "0.65rem", borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ color: "#334155", fontSize: "0.84rem", marginBottom: "0.45rem" }}>Selected: {pendingImageFile.name} ({(pendingImageFile.size/1024).toFixed(1)} KB)</div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button type="button" style={{ ...S.btn, ...S.primary, padding: "0.45rem 0.8rem" }} disabled={uploadingImage} onClick={uploadPickedImage}>
                      {uploadingImage ? <><i className="fas fa-spinner fa-spin" /> Uploading...</> : <><i className="fas fa-cloud-upload-alt" /> Upload Image</>}
                    </button>
                    <button type="button" style={{ ...S.btn, ...S.ghost, padding: "0.45rem 0.8rem" }} disabled={uploadingImage} onClick={cancelImagePick}>
                      <i className="fas fa-times" /> Cancel
                    </button>
                  </div>
                  {pendingImagePreview && <img src={pendingImagePreview} alt="preview" style={{ marginTop: "0.75rem", width: "100%", maxWidth: 260, height: 160, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0" }} />}
                </div>
              )}
              {form.imageUrl && !pendingImageFile && (
                <div style={{ marginTop: "0.6rem" }}>
                  <img src={form.imageUrl} alt="uploaded" style={{ width: "100%", maxWidth: 260, height: 160, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(62,9,148,0.15)" }} />
                  <div style={{ fontSize: "0.78rem", color: "#22c55e", marginTop: "0.3rem" }}>✅ Image uploaded successfully</div>
                  <button type="button" style={{ ...S.btn, ...S.ghost, padding: "0.3rem 0.6rem", fontSize: "0.78rem", marginTop: "0.3rem" }} onClick={() => setForm(f => ({ ...f, imageUrl: "" }))}>
                    <i className="fas fa-trash" /> Remove Image
                  </button>
                </div>
              )}
              <div style={{ marginTop: "0.5rem" }}>
                <label style={{ ...S.label, fontSize: "0.8rem", color: "#64748b" }}>Or paste image URL directly</label>
                <input style={S.input} type="url" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button type="submit" style={{ ...S.btn, ...S.primary }} disabled={saving}>{saving ? "Saving..." : editingId ? "Update Event" : "Add Event"}</button>
            <button type="button" style={{ ...S.btn, ...S.ghost }} onClick={() => resetForm()}>Close</button>
          </div>
        </form>
      </div>
      )}

      <div style={S.grid}>
        {loading ? (
          <div style={{ ...S.card, gridColumn: "1 / -1", textAlign: "center", padding: "2rem" }}>Loading gym events…</div>
        ) : events.length === 0 ? (
          <div style={{ ...S.card, gridColumn: "1 / -1", textAlign: "center", color: "#94a3b8", padding: "2rem" }}>No gym events found.</div>
        ) : events.map(event => (
          <div key={event.id} style={{ ...S.card, overflow: "hidden", padding: 0 }}>
            {event.imageUrl && <img src={event.imageUrl} alt={event.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />}
            <div style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", alignItems: "start" }}>
                <div>
                  <h3 style={{ margin: "0 0 0.35rem", color: "#1e293b" }}>{event.title}</h3>
                  <div style={{ color: "#64748b", fontSize: "0.85rem", display:"flex", alignItems:"center", gap:"0.5rem", flexWrap:"wrap" }}>
                    <span style={{ width:10, height:10, borderRadius:"50%", background: event.isActive ? "#22c55e" : "#ef4444", display:"inline-block" }} />
                    <span>{event.eventType} • {event.eventDate || "—"}</span>
                  </div>
                </div>
                <span style={badgeTone("blue")}>{event.price ? `₹${Number(event.price).toLocaleString("en-IN")}` : "FREE"}</span>
              </div>
              <p style={{ color: "#475569", fontSize: "0.9rem", margin: "0.75rem 0" }}>{event.description || "No description"}</p>
              <div style={{ color: "#64748b", fontSize: "0.85rem", display: "grid", gap: "0.25rem" }}>
                <div><strong>Time:</strong> {event.timeSlot || "—"}</div>
                <div><strong>Venue:</strong> {event.venue || "—"}</div>
                <div><strong>Capacity:</strong> {event.maxParticipants || "—"}</div>
                <div><strong>Enrolled:</strong> {event.currentRegistrations ?? 0}</div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="button" style={{ ...S.btn, ...S.ghost, flex: 1 }} onClick={() => editItem(event)}><i className="fas fa-pen" /> Edit</button>
                <button type="button" style={{ ...S.btn, background:"#6366f1", color:"#fff", flex: 1 }} onClick={() => viewRegistrations(event)}><i className="fas fa-users" /> {event.currentRegistrations ?? 0} Registered</button>
                <button type="button" style={{ ...S.btn, ...S.danger, flex: 1 }} onClick={() => removeItem(event.id)}><i className="fas fa-trash" /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {registrationsModal && (
        <Modal title={`Registrations — ${registrationsModal.event.title}`} onClose={() => setRegistrationsModal(null)}>
          {loadingRegs ? (
            <div style={{ textAlign:"center", padding:"2rem", color:"#64748b" }}>Loading…</div>
          ) : registrationsModal.list.length === 0 ? (
            <div style={{ textAlign:"center", padding:"2rem", color:"#94a3b8" }}>No registrations yet.</div>
          ) : (
            <>
              <div style={{ marginBottom:"0.75rem", fontSize:"0.88rem", color:"#64748b" }}>
                {registrationsModal.list.length} registration{registrationsModal.list.length !== 1 ? "s" : ""}
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {["#","Name","Phone","Email","Type","Registered At"].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registrationsModal.list.map((r, i) => (
                      <tr key={r.id}>
                        <td style={S.td}>{i + 1}</td>
                        <td style={S.td}><strong>{r.bookerName}</strong></td>
                        <td style={S.td}>{r.bookerPhone || "—"}</td>
                        <td style={S.td}>{r.bookerEmail || "—"}</td>
                        <td style={S.td}>
                          <span style={{ ...S.badge, background:"#ede9fe", color:"#6d28d9" }}>{r.bookerType || "—"}</span>
                        </td>
                        <td style={S.td}>
                          {r.registeredAt ? new Date(r.registeredAt).toLocaleString("en-IN") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}

function CostumeSection() {
  const emptyForm = {
    name: "",
    description: "",
    category: COSTUME_CATEGORIES[0],
    size: "ALL_SIZES",
    rentalPrice: "",
    totalQuantity: "",
    imageUrl: "",
  };
  const [costumes, setCostumes] = useState([]);
  const [costumeBookings, setCostumeBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [pendingImagePreview, setPendingImagePreview] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState({ msg: "", type: "" });

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [costumesRes, bookingsRes] = await Promise.all([
        api.get("/api/public/costumes"),
        api.get("/api/public/costumes/bookings"),
      ]);
      setCostumes(Array.isArray(costumesRes.data) ? costumesRes.data : []);
      setCostumeBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
    } catch (err) {
      notify(err.response?.data?.message || "Failed to load costumes", "error");
      setCostumes([]);
      setCostumeBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const findCostumeName = (costumeId) => {
    const found = costumes.find((c) => Number(c.id) === Number(costumeId));
    return found?.name || `#${costumeId}`;
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    if (pendingImagePreview?.startsWith("blob:")) URL.revokeObjectURL(pendingImagePreview);
    setForm(emptyForm);
    setPendingImageFile(null);
    setPendingImagePreview("");
    setEditingId(null);
    setShowAdd(false);
  };

  useEffect(() => {
    return () => {
      if (pendingImagePreview?.startsWith("blob:")) URL.revokeObjectURL(pendingImagePreview);
    };
  }, [pendingImagePreview]);

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (pendingImagePreview?.startsWith("blob:")) URL.revokeObjectURL(pendingImagePreview);
    setPendingImageFile(file);
    setPendingImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const cancelImagePick = () => {
    if (pendingImagePreview?.startsWith("blob:")) URL.revokeObjectURL(pendingImagePreview);
    setPendingImageFile(null);
    setPendingImagePreview("");
  };

  const uploadPickedImage = async () => {
    if (!pendingImageFile) return;
    setUploadingImage(true);
    try {
      const fileUrl = await uploadImageToMediaService(pendingImageFile, "COSTUME");
      setForm(prev => ({ ...prev, imageUrl: fileUrl }));
      notify("Image uploaded successfully");
      cancelImagePick();
    } catch (err) {
      notify(err.response?.data?.message || err.message || "Upload failed", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        rentalPrice: form.rentalPrice === "" ? 0 : Number(form.rentalPrice),
        totalQuantity: form.totalQuantity === "" ? null : Number(form.totalQuantity),
        imageUrl: form.imageUrl.trim(),
      };
      if (editingId) {
        await api.put(`/api/public/costumes/${editingId}`, payload);
        notify("Costume updated");
      } else {
        await api.post("/api/public/costumes", payload);
        notify("Costume created");
      }
      resetForm();
      await load();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to save costume", "error");
    } finally {
      setSaving(false);
    }
  };

  const editItem = (item) => {
    setEditingId(item.id);
    setShowAdd(true);
    setForm({
      name: item.name || "",
      description: item.description || "",
      category: item.category || COSTUME_CATEGORIES[0],
      size: item.size || "ALL_SIZES",
      rentalPrice: item.rentalPrice ?? "",
      totalQuantity: item.totalQuantity ?? "",
      imageUrl: item.imageUrl || "",
    });
  };

  const removeItem = async (id) => {
    if (!window.confirm("Delete this costume?")) return;
    try {
      await api.delete(`/api/public/costumes/${id}`);
      notify("Costume removed");
      await load();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to delete costume", "error");
    }
  };

  return (
    <>
      <Toast {...toast} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:"1rem", flexWrap:"wrap", marginBottom:"1rem" }}>
        <div>
          <h3 style={{ margin:"0 0 0.35rem", color:"#3e0994" }}>Costumes</h3>
          <p style={{ margin:0, color:"#64748b", fontSize:"0.9rem" }}>Manage rental costumes and track active stock.</p>
        </div>
        <button type="button" style={{ ...S.btn, ...S.primary }} onClick={() => { resetForm(); setShowAdd(true); }}>
          <i className="fas fa-plus" /> Add Costume
        </button>
      </div>

      {showAdd && (
      <div style={{ ...S.card, padding: "1.25rem", marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0, color: "#3e0994" }}>{editingId ? "Edit Costume" : "Add Costume"}</h3>
        <form onSubmit={submit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            <div style={S.field}><label style={S.label}>Name *</label><input style={S.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
            <div style={S.field}><label style={S.label}>Category *</label><select style={S.input} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>{COSTUME_CATEGORIES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div style={S.field}><label style={S.label}>Size</label>
              <select style={S.input} value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))}>
                <option value="ALL_SIZES">All Sizes Available</option>
                <option value="XS">XS — Extra Small</option>
                <option value="S">S — Small</option>
                <option value="M">M — Medium</option>
                <option value="L">L — Large</option>
                <option value="XL">XL — Extra Large</option>
                <option value="XXL">XXL — Double Extra Large</option>
                <option value="XXXL">XXXL — Triple Extra Large</option>
              </select>
            </div>
            <div style={S.field}><label style={S.label}>Rental Price *</label><input style={S.input} type="number" min="0" value={form.rentalPrice} onChange={e => setForm(f => ({ ...f, rentalPrice: e.target.value }))} required /></div>
            <div style={S.field}><label style={S.label}>Total Quantity *</label><input style={S.input} type="number" min="0" value={form.totalQuantity} onChange={e => setForm(f => ({ ...f, totalQuantity: e.target.value }))} required /></div>
            <div style={{ ...S.field, gridColumn: "1 / -1" }}><label style={S.label}>Description</label><textarea style={{ ...S.input, minHeight: 90 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div style={{ ...S.field, gridColumn: "1 / -1" }}>
              <label style={S.label}>Costume Photo</label>
              <input style={S.input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImagePick} />
              {pendingImageFile && (
                <div style={{ marginTop: "0.6rem", padding: "0.65rem", borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ color: "#334155", fontSize: "0.84rem", marginBottom: "0.45rem" }}>Selected: {pendingImageFile.name} ({(pendingImageFile.size/1024).toFixed(1)} KB)</div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button type="button" style={{ ...S.btn, ...S.primary, padding: "0.45rem 0.8rem" }} disabled={uploadingImage} onClick={uploadPickedImage}>
                      {uploadingImage ? <><i className="fas fa-spinner fa-spin" /> Uploading...</> : <><i className="fas fa-cloud-upload-alt" /> Upload Image</>}
                    </button>
                    <button type="button" style={{ ...S.btn, ...S.ghost, padding: "0.45rem 0.8rem" }} disabled={uploadingImage} onClick={cancelImagePick}>
                      <i className="fas fa-times" /> Cancel
                    </button>
                  </div>
                  {pendingImagePreview && <img src={pendingImagePreview} alt="preview" style={{ marginTop: "0.75rem", width: "100%", maxWidth: 260, height: 160, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0" }} />}
                </div>
              )}
              {form.imageUrl && !pendingImageFile && (
                <div style={{ marginTop: "0.6rem" }}>
                  <img src={form.imageUrl} alt="uploaded" style={{ width: "100%", maxWidth: 260, height: 160, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(62,9,148,0.15)" }} />
                  <div style={{ fontSize: "0.78rem", color: "#22c55e", marginTop: "0.3rem" }}>✅ Image uploaded successfully</div>
                  <button type="button" style={{ ...S.btn, ...S.ghost, padding: "0.3rem 0.6rem", fontSize: "0.78rem", marginTop: "0.3rem" }} onClick={() => setForm(f => ({ ...f, imageUrl: "" }))}>
                    <i className="fas fa-trash" /> Remove Image
                  </button>
                </div>
              )}
              <div style={{ marginTop: "0.5rem" }}>
                <label style={{ ...S.label, fontSize: "0.8rem", color: "#64748b" }}>Or paste image URL directly</label>
                <input style={S.input} type="url" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button type="submit" style={{ ...S.btn, ...S.primary }} disabled={saving}>{saving ? "Saving..." : editingId ? "Update Costume" : "Add Costume"}</button>
            <button type="button" style={{ ...S.btn, ...S.ghost }} onClick={() => resetForm()}>Close</button>
          </div>
        </form>
      </div>
      )}

      <div style={S.grid}>
        {loading ? (
          <div style={{ ...S.card, gridColumn: "1 / -1", textAlign: "center", padding: "2rem" }}>Loading costumes…</div>
        ) : costumes.length === 0 ? (
          <div style={{ ...S.card, gridColumn: "1 / -1", textAlign: "center", color: "#94a3b8", padding: "2rem" }}>No costumes found.</div>
        ) : costumes.map(costume => (
          <div key={costume.id} style={{ ...S.card, overflow: "hidden", padding: 0 }}>
            {costume.imageUrl && <img src={costume.imageUrl} alt={costume.name} style={{ width: "100%", height: 180, objectFit: "cover" }} />}
            <div style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", alignItems: "start" }}>
                <div>
                  <h3 style={{ margin: "0 0 0.35rem", color: "#1e293b" }}>{costume.name}</h3>
                  <div style={{ color: "#64748b", fontSize: "0.85rem", display:"flex", alignItems:"center", gap:"0.5rem", flexWrap:"wrap" }}>
                    <span style={{ width:10, height:10, borderRadius:"50%", background: costume.isActive ? "#22c55e" : "#ef4444", display:"inline-block" }} />
                    <span>{costume.category} • Size {costume.size || "—"}</span>
                  </div>
                </div>
                <span style={badgeTone("green")}>₹{Number(costume.rentalPrice || 0).toLocaleString("en-IN")}</span>
              </div>
              <p style={{ color: "#475569", fontSize: "0.9rem", margin: "0.75rem 0" }}>{costume.description || "No description"}</p>
              <div style={{ color: "#64748b", fontSize: "0.85rem", display: "grid", gap: "0.25rem" }}>
                <div><strong>Total Quantity:</strong> {costume.totalQuantity ?? "—"}</div>
                <div><strong>Available:</strong> {costume.availableQuantity ?? "—"}</div>
                <div><strong>Booked:</strong> {Math.max(0, (costume.totalQuantity ?? 0) - (costume.availableQuantity ?? 0))}</div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="button" style={{ ...S.btn, ...S.ghost, flex: 1 }} onClick={() => editItem(costume)}><i className="fas fa-pen" /> Edit</button>
                <button type="button" style={{ ...S.btn, ...S.danger, flex: 1 }} onClick={() => removeItem(costume.id)}><i className="fas fa-trash" /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1.25rem" }}>
        <h3 style={{ margin: "0 0 0.75rem", color: "#3e0994" }}>Costume Booking Purchases</h3>
        <div style={{ overflowX: "auto", background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <table style={{ ...S.table, minWidth: 960 }}>
            <thead>
              <tr>
                {["#", "Order", "Costume", "Selected Size", "Purchaser", "Contact", "Address", "Type", "Status", "Booked At"].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!loading && costumeBookings.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ ...S.td, textAlign: "center", color: "#94a3b8", padding: "1.25rem" }}>
                    No costume bookings found yet.
                  </td>
                </tr>
              )}
              {costumeBookings.map((b, i) => (
                <tr key={b.id || `${b.orderNumber || "ORD"}-${i}`}>
                  <td style={S.td}>{i + 1}</td>
                  <td style={S.td}>{b.orderNumber || "—"}</td>
                  <td style={S.td}>{findCostumeName(b.costumeId)}</td>
                  <td style={S.td}><span style={badgeTone("blue")}>{b.selectedSize || "—"}</span></td>
                  <td style={S.td}><strong>{b.bookerName || "—"}</strong></td>
                  <td style={S.td}>{b.bookerPhone || "—"}</td>
                  <td style={S.td}>{b.bookerAddress || "—"}</td>
                  <td style={S.td}><span style={badgeTone("purple")}>{b.bookerType || "—"}</span></td>
                  <td style={S.td}>
                    <span style={{ ...S.badge, background:["CONFIRMED","RETURNED","PICKED_UP"].includes(String(b.status || "").toUpperCase()) ? "#dcfce7" : String(b.status || "").toUpperCase()==="CANCELLED" ? "#fee2e2" : "#fef3c7", color:["CONFIRMED","RETURNED","PICKED_UP"].includes(String(b.status || "").toUpperCase()) ? "#166534" : String(b.status || "").toUpperCase()==="CANCELLED" ? "#dc2626" : "#92400e" }}>
                      {b.status || "—"}
                    </span>
                  </td>
                  <td style={S.td}>{b.createdAt ? new Date(b.createdAt).toLocaleString("en-IN") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function LeaveSection() {
  const [leaves, setLeaves]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("ALL");
  const [remarkModal, setRemarkModal] = useState(null); // { id, action }
  const [remark, setRemark]     = useState("");
  const [toast, setToast]       = useState({ msg:"", type:"" });

  const notify = (msg, type="success") => { setToast({ msg, type }); setTimeout(()=>setToast({ msg:"", type:"" }), 3500); };

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllLeaves(filter === "ALL" ? null : filter);
      setLeaves(res.data || []);
    } catch { setLeaves([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const handleAction = async () => {
    if (!remarkModal) return;
    try {
      if (remarkModal.action === "APPROVE") await approveLeave(remarkModal.id, remark);
      else await rejectLeave(remarkModal.id, remark);
      notify(`Leave ${remarkModal.action === "APPROVE" ? "approved" : "rejected"} successfully`);
      setRemarkModal(null); setRemark(""); load();
    } catch (err) { notify(err.response?.data?.message || "Action failed", "error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this leave request?")) return;
    try { await deleteLeave(id); notify("Leave deleted"); load(); }
    catch (err) { notify(err.response?.data?.message || "Failed to delete", "error"); }
  };

  const statusStyle = (s) => ({
    PENDING:  { background:"#fef3c7", color:"#92400e" },
    APPROVED: { background:"#dcfce7", color:"#166534" },
    REJECTED: { background:"#fee2e2", color:"#b91c1c" },
  }[s] || { background:"#f1f5f9", color:"#64748b" });

  const pending  = leaves.filter(l => l.status === "PENDING").length;
  const approved = leaves.filter(l => l.status === "APPROVED").length;
  const rejected = leaves.filter(l => l.status === "REJECTED").length;

  return (
    <>
      <Toast {...toast} />

      {/* Stats */}
      <div style={S.statGrid}>
        {[
          { label:"Total",    val:leaves.length, color:"#3e0994" },
          { label:"Pending",  val:pending,        color:"#f59e0b" },
          { label:"Approved", val:approved,       color:"#22c55e" },
          { label:"Rejected", val:rejected,       color:"#ef4444" },
        ].map(s => (
          <div key={s.label} style={S.statCard}>
            <div style={{ ...S.statVal, color:s.color }}>{s.val}</div>
            <div style={S.statLbl}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter + Refresh */}
      <div style={{ display:"flex", gap:"0.75rem", marginBottom:"1rem", alignItems:"center", flexWrap:"wrap" }}>
        {["ALL","PENDING","APPROVED","REJECTED"].map(f => (
          <button key={f}
            style={{ ...S.btn, ...(filter===f ? S.primary : S.ghost), padding:"0.45rem 1rem", fontSize:"0.82rem" }}
            onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
        <button style={{ ...S.btn, ...S.ghost, marginLeft:"auto" }} onClick={load}>
          <i className="fas fa-sync-alt" /> Refresh
        </button>
      </div>

      {/* Table */}
      <div style={{ ...S.card, overflowX:"auto" }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:"2rem", color:"#64748b" }}>Loading leave requests…</div>
        ) : leaves.length === 0 ? (
          <div style={{ textAlign:"center", padding:"2rem", color:"#94a3b8" }}>No leave requests found.</div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                {["#","Trainer","From","To","Days","Reason","Status","Admin Remark","Applied At","Actions"].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaves.map((l, i) => {
                const days = l.fromDate && l.toDate
                  ? Math.max(1, Math.round((new Date(l.toDate) - new Date(l.fromDate)) / 86400000) + 1)
                  : "—";
                return (
                  <tr key={l.id}>
                    <td style={S.td}>{i+1}</td>
                    <td style={S.td}><strong>{l.trainerName || `#${l.trainerId}`}</strong></td>
                    <td style={S.td}>{l.fromDate}</td>
                    <td style={S.td}>{l.toDate}</td>
                    <td style={{ ...S.td, textAlign:"center" }}>{days}</td>
                    <td style={{ ...S.td, maxWidth:200, wordBreak:"break-word" }}>{l.reason}</td>
                    <td style={S.td}>
                      <span style={{ ...S.badge, ...statusStyle(l.status) }}>{l.status}</span>
                    </td>
                    <td style={{ ...S.td, color:"#64748b", fontSize:"0.82rem" }}>{l.adminRemark || "—"}</td>
                    <td style={{ ...S.td, fontSize:"0.82rem", whiteSpace:"nowrap" }}>
                      {l.appliedAt ? new Date(l.appliedAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td style={S.td}>
                      <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
                        {l.status === "PENDING" && (
                          <>
                            <button
                              style={{ ...S.btn, ...S.success, padding:"0.3rem 0.65rem", fontSize:"0.78rem" }}
                              onClick={() => { setRemarkModal({ id:l.id, action:"APPROVE" }); setRemark(""); }}
                            >
                              <i className="fas fa-check" /> Approve
                            </button>
                            <button
                              style={{ ...S.btn, ...S.danger, padding:"0.3rem 0.65rem", fontSize:"0.78rem" }}
                              onClick={() => { setRemarkModal({ id:l.id, action:"REJECT" }); setRemark(""); }}
                            >
                              <i className="fas fa-times" /> Reject
                            </button>
                          </>
                        )}
                        <button
                          style={{ ...S.btn, ...S.ghost, padding:"0.3rem 0.65rem", fontSize:"0.78rem" }}
                          onClick={() => handleDelete(l.id)}
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Approve / Reject remark modal */}
      {remarkModal && (
        <Modal
          title={remarkModal.action === "APPROVE" ? "✅ Approve Leave" : "❌ Reject Leave"}
          onClose={() => setRemarkModal(null)}
        >
          <div style={S.field}>
            <label style={S.label}>Admin Remark (optional)</label>
            <textarea
              style={{ ...S.input, minHeight:80, resize:"vertical" }}
              value={remark}
              onChange={e => setRemark(e.target.value)}
              placeholder="Add a note for the trainer…"
            />
          </div>
          <div style={{ display:"flex", gap:"0.75rem", marginTop:"1rem" }}>
            <button
              style={{ ...S.btn, ...(remarkModal.action==="APPROVE" ? S.success : S.danger), flex:1 }}
              onClick={handleAction}
            >
              {remarkModal.action === "APPROVE" ? "✅ Confirm Approve" : "❌ Confirm Reject"}
            </button>
            <button style={{ ...S.btn, ...S.ghost, flex:1 }} onClick={() => setRemarkModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  );
}

const PAGES = [
  { key:"dashboard",    label:"Dashboard",        icon:"fa-chart-pie" },
  { key:"members",      label:"Members",           icon:"fa-users" },
  { key:"attendance",   label:"Attendance",        icon:"fa-calendar-check" },
  { key:"demos",        label:"Demo Bookings",     icon:"fa-calendar-alt" },
  { key:"events",       label:"Gym Events",        icon:"fa-star" },
  { key:"costumes",     label:"Costumes",          icon:"fa-shirt" },
  { key:"batches",      label:"Batch Management",  icon:"fa-layer-group" },
  { key:"announcements",label:"Announcements",     icon:"fa-bullhorn" },
  { key:"equipment",    label:"Equipment",         icon:"fa-dumbbell" },
  { key:"staff",        label:"Staff & Trainers",  icon:"fa-user-tie" },
  { key:"leaves",       label:"Leave Approvals",   icon:"fa-calendar-minus" },
  { key:"finance",      label:"Finance",           icon:"fa-rupee-sign" },
  { key:"reports",      label:"Reports",           icon:"fa-chart-bar" },
];

const AdminDashboard = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const adminName  = localStorage.getItem("name") || "Admin";
  const getPageFromPath = (pathname) => {
    const match = pathname.match(/^\/admin-dashboard\/?([^/]*)/);
    const candidate = match?.[1] || "dashboard";
    const valid = PAGES.some(p => p.key === candidate && !p.disabled);
    return valid ? candidate : "dashboard";
  };
  const [page, setPage]           = useState(() => getPageFromPath(location.pathname));
  const [collapsed, setCollapsed] = useState(false);
  const goTo = (key) => {
    if (!PAGES.some(p => p.key === key && !p.disabled)) return;
    setPage(key);
    navigate(key === "dashboard" ? "/admin-dashboard" : `/admin-dashboard/${key}`);
  };
  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  useEffect(() => {
    const next = getPageFromPath(location.pathname);
    setPage(prev => (prev === next ? prev : next));
  }, [location.pathname]);

  const renderPage = () => {
    switch (page) {
      case "dashboard":    return <DashboardSection goTo={goTo} />;
      case "members":      return <MembersAdmin />;
      case "attendance":   return <AttendanceList />;
      case "demos":        return <DemoBookingAdmin />;
      case "events":       return <EventSection />;
      case "costumes":     return <CostumeSection />;
      case "announcements":return <Announcement />;
      case "batches":       return <BatchSection />;
      case "equipment":    return <Gymequipment />;
      case "staff":        return <StaffSection />;
      case "leaves":       return <LeaveSection />;
      case "finance":      return <FinanceManagement />;
      case "reports":      return <MemberReports />;
      default:             return <DashboardSection goTo={goTo} />;
    }
  };

  return (
    <div style={S.root}>
      {/* Global CSS to hide inner sidebars of embedded components */}
      <style>{`
        .admin-content-area .sidebar,
        .admin-content-area .al-sidebar,
        .admin-content-area .staff-container > .sidebar,
        .admin-content-area .members-container > .sidebar,
        .admin-content-area .equipment-container > .sidebar,
        .admin-content-area .membership-purchase-container > .sidebar {
          display: none !important;
        }
        .admin-content-area .main-content,
        .admin-content-area .al-main-content,
        .admin-content-area .staff-container > .main-content,
        .admin-content-area .members-container > .main-content,
        .admin-content-area .equipment-container > .main-content,
        .admin-content-area .membership-purchase-container > .main-content {
          margin-left: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
        }
        .admin-content-area .member-admin-app { padding: 0; }
        .admin-content-area .container { max-width: 100%; }
        @keyframes slideIn { from{opacity:0;transform:translateX(100%)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      {/* Sidebar */}
      <aside style={S.sidebar(collapsed)}>
        <div style={S.brand(collapsed)}>
          {!collapsed && <h1 style={S.brandTxt}>MuscleFit</h1>}
          <button style={S.hamburger} onClick={() => setCollapsed(c => !c)} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <i className={`fas ${collapsed ? "fa-bars" : "fa-times"}`} />
          </button>
        </div>

        <div style={S.adminBox(collapsed)}>
          <div style={{ fontSize:"1.5rem", marginBottom:"0.5rem" }}>👨‍💼</div>
          <p style={{ color:"#fff", fontWeight:600, margin:0, fontSize:"0.95rem" }}>{adminName}</p>
          <p style={{ color:"#94a3b8", margin:0, fontSize:"0.75rem" }}>Administrator</p>
        </div>

        <nav style={S.nav}>
          {PAGES.map(p => (
            <button key={p.key}
              style={{
                ...S.navBtn(collapsed),
                ...(page===p.key ? S.navActive : {}),
              }}
              onClick={() => { if (!p.disabled) goTo(p.key); }}
              title={collapsed ? p.label : ""}>
              <i className={`fas ${p.icon}`} style={{ fontSize:"1rem", flexShrink:0, width:18, textAlign:"center" }} />
              <span style={S.navLabel(collapsed)}>{p.label}</span>
            </button>
          ))}
          <button style={{ ...S.navBtn(collapsed), color:"#ef4444", marginTop:"1rem" }} onClick={handleLogout} title={collapsed ? "Logout" : ""}>
            <i className="fas fa-sign-out-alt" style={{ fontSize:"1rem", flexShrink:0, width:18, textAlign:"center" }} />
            <span style={S.navLabel(collapsed)}>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main style={S.main(collapsed)}>
        <div style={S.header}>
          <div>
            <h1 style={S.h1}>{PAGES.find(p=>p.key===page)?.label || "Dashboard"}</h1>
            <p style={{ color:"#64748b", margin:0, fontSize:"0.9rem" }}>MuscleFit Gym Management System</p>
          </div>
          <button style={{ ...S.btn, ...S.ghost }} onClick={() => navigate("/")}>
            <i className="fas fa-globe" /> Public Portal
          </button>
        </div>

        {/* Wrap content to apply sidebar-hiding CSS */}
        <div className="admin-content-area">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
