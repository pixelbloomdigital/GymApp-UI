import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import {
  getAllMembers, createMember, deleteMember,
  getPlans, createPlan, deletePlan,
  assignMembership, getMemberMemberships,
  getBatches,
} from "./api/coreService";
import { registerMember } from "./api/authAdminService";
import PasswordField from "./components/PasswordField.jsx";

const S = {
  wrap:    { padding:"2rem", fontFamily:"'Poppins',sans-serif", background:"#f0f4ff", minHeight:"100vh" },
  topBar:  { display:"flex", gap:"0.75rem", flexWrap:"wrap", marginBottom:"1.5rem", alignItems:"center" },
  btn:     { padding:"0.65rem 1.25rem", borderRadius:8, border:"none", cursor:"pointer", fontWeight:600, fontSize:"0.9rem", fontFamily:"inherit", transition:"all 0.2s" },
  primary: { background:"linear-gradient(135deg,#3e0994,#8e2bbd)", color:"#fff" },
  ghost:   { background:"rgba(62,9,148,0.1)", color:"#3e0994", border:"1px solid rgba(62,9,148,0.2)" },
  active:  { background:"#3e0994", color:"#fff" },
  danger:  { background:"#ef4444", color:"#fff" },
  search:  { padding:"0.65rem 1rem", borderRadius:8, border:"1px solid #d1d5db", fontSize:"0.9rem", fontFamily:"inherit", minWidth:260 },
  card:    { background:"#fff", borderRadius:14, padding:"1.5rem", boxShadow:"0 4px 20px rgba(62,9,148,0.08)", border:"1px solid rgba(62,9,148,0.1)", marginBottom:"1.5rem" },
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
};

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div style={{ ...S.toast, background: type === "error" ? "#ef4444" : "#22c55e" }}>{type === "error" ? "❌" : "✅"} {msg}</div>;
}

function Modal({ title, onClose, children }) {
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.mbox} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
          <h3 style={{ margin:0, color:"#1e293b" }}>{title}</h3>
          <button onClick={onClose} style={{ ...S.btn, padding:"0.35rem 0.75rem", background:"#f1f5f9", color:"#64748b" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function MembersAdmin() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role")?.toUpperCase();

  // Show warning if not admin
  if (role && role !== "ADMIN") {
    return (
      <div style={{ ...S.wrap, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ ...S.card, textAlign:"center", maxWidth:400 }}>
          <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🔒</div>
          <h3 style={{ color:"#ef4444" }}>Access Denied</h3>
          <p style={{ color:"#64748b" }}>You need ADMIN role to access this page. Current role: <strong>{role}</strong></p>
          <button style={{ ...S.btn, ...S.primary, marginTop:"1rem" }} onClick={() => navigate("/login")}>Login as Admin</button>
        </div>
      </div>
    );
  }
  const [view, setView]         = useState("members"); // "members" | "plans"
  const [members, setMembers]   = useState([]);
  const [plans, setPlans]       = useState([]);
  const [batches, setBatches]   = useState([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState({ msg:"", type:"" });

  // Delete mode states
  const [memberDeleteMode, setMemberDeleteMode]     = useState(false);
  const [planDeleteMode, setPlanDeleteMode]         = useState(false);
  const [selectedMemberIds, setSelectedMemberIds]   = useState(new Set());
  const [selectedPlanIds, setSelectedPlanIds]       = useState(new Set());

  // modals
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddPlan, setShowAddPlan]     = useState(false);

  // forms
  const [memberForm, setMemberForm] = useState({ name:"", email:"", phone:"", password:"", address:"", city:"", state:"", pincode:"", planId:"", batchId:"" });
  const [planForm, setPlanForm]     = useState({ name:"", price:"", durationMonths:"", daysPerWeek:"", description:"" });
  const [memberErrors, setMemberErrors] = useState({});
  const [planErrors, setPlanErrors]     = useState({});

  const validateMember = () => {
    const e = {};
    if (!memberForm.name.trim())                                  e.name  = "Name is required";
    if (!/^\d{10}$/.test(memberForm.phone))                       e.phone = "Enter valid 10-digit phone";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberForm.email))    e.email = "Enter valid email";
    if (!memberForm.planId)                                       e.planId = "Select a membership plan";
    if (!memberForm.batchId)                                      e.batchId = "Select a batch for the plan";
    return e;
  };

  const validatePlan = () => {
    const e = {};
    if (!planForm.name.trim())                                    e.name = "Plan name is required";
    if (!planForm.price || parseFloat(planForm.price) <= 0)       e.price = "Enter valid price";
    if (!planForm.durationMonths || parseInt(planForm.durationMonths) < 1) e.durationMonths = "Enter duration (min 1 month)";
    if (!planForm.daysPerWeek || parseInt(planForm.daysPerWeek) < 1 || parseInt(planForm.daysPerWeek) > 7) e.daysPerWeek = "Enter days per week (1–7)";
    return e;
  };

  const notify = (msg, type="success") => { setToast({ msg, type }); setTimeout(() => setToast({ msg:"", type:"" }), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, pRes, bRes] = await Promise.all([getAllMembers(), getPlans(), getBatches()]);
      setMembers(mRes.data || []);
      setPlans(pRes.data || []);
      setBatches(bRes.data || []);
    } catch { notify("Failed to load data", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Add Member ──────────────────────────────────────────────────────────────
  const handleAddMember = async (e) => {
    e.preventDefault();
    const errs = validateMember();
    if (Object.keys(errs).length) { setMemberErrors(errs); return; }
    setMemberErrors({});
    try {
      const { data: newMember } = await createMember({
        name: memberForm.name, email: memberForm.email, phone: memberForm.phone,
        address: memberForm.address, city: memberForm.city, state: memberForm.state, pincode: memberForm.pincode,
      });

      try {
        await registerMember({
          name: memberForm.name,
          email: memberForm.email,
          phone: memberForm.phone,
          password: memberForm.password,
          gymCenter: "",
        });
      } catch (authErr) {
        await deleteMember(newMember.id).catch(() => {});
        throw authErr;
      }

      await assignMembership({ memberId: newMember.id, planId: parseInt(memberForm.planId), batchId: parseInt(memberForm.batchId) });
      notify(`"${memberForm.name}" added with membership. The member received the login SMS.`);
      setShowAddMember(false);
      setMemberForm({ name:"", email:"", phone:"", password:"", address:"", city:"", state:"", pincode:"", planId:"", batchId:"" });
      setMemberErrors({});
      load();
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.response?.data || err.message;
      console.error("Add member error:", status, err.response?.data);
      if (status === 403) notify("Access denied — make sure you are logged in as ADMIN", "error");
      else notify(typeof msg === "string" ? msg : "Failed to add member", "error");
    }
  };

  const handleDeleteMember = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await deleteMember(id); notify(`"${name}" deleted`); load(); }
    catch { notify("Failed to delete", "error"); }
  };

  // ── Member Delete Mode ──────────────────────────────────────────────────────
  const toggleSelectMember = (memberId, checked) => {
    const newSet = new Set(selectedMemberIds);
    if (checked) newSet.add(memberId);
    else newSet.delete(memberId);
    setSelectedMemberIds(newSet);
  };

  const handleDeleteMembersClick = async () => {
    if (!memberDeleteMode) {
      setMemberDeleteMode(true);
      setSelectedMemberIds(new Set());
      return;
    }

    if (selectedMemberIds.size === 0) {
      notify("Select at least one member to delete", "error");
      return;
    }

    if (!window.confirm(`Delete ${selectedMemberIds.size} member(s)? This action cannot be undone.`)) return;

    try {
      setLoading(true);
      await Promise.all(Array.from(selectedMemberIds).map(id => deleteMember(id)));
      notify(`${selectedMemberIds.size} member(s) deleted successfully`);
      setMemberDeleteMode(false);
      setSelectedMemberIds(new Set());
      load();
    } catch (err) {
      console.error("Bulk delete members error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to delete selected members";
      notify(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeleteMembers = () => {
    setMemberDeleteMode(false);
    setSelectedMemberIds(new Set());
  };

  // ── Add Plan ────────────────────────────────────────────────────────────────
  const handleAddPlan = async (e) => {
    e.preventDefault();
    const errs = validatePlan();
    if (Object.keys(errs).length) { setPlanErrors(errs); return; }
    setPlanErrors({});
    try {
      await createPlan({
        name: planForm.name, description: planForm.description,
        price: parseFloat(planForm.price),
        durationMonths: parseInt(planForm.durationMonths),
        daysPerWeek: parseInt(planForm.daysPerWeek),
      });
      notify(`Plan "${planForm.name}" created!`);
      setShowAddPlan(false);
      setPlanForm({ name:"", price:"", durationMonths:"", daysPerWeek:"", description:"" });
      setPlanErrors({});
      load();
    } catch (err) { notify(err.response?.data?.message || "Failed to create plan", "error"); }
  };

  const handleDeletePlan = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"?`)) return;
    try { await deletePlan(id); notify(`"${name}" deactivated`); load(); }
    catch { notify("Failed to deactivate", "error"); }
  };

  // ── Plan Delete Mode ────────────────────────────────────────────────────────
  const toggleSelectPlan = (planId, checked) => {
    const newSet = new Set(selectedPlanIds);
    if (checked) newSet.add(planId);
    else newSet.delete(planId);
    setSelectedPlanIds(newSet);
  };

  const handleDeletePlansClick = async () => {
    if (!planDeleteMode) {
      setPlanDeleteMode(true);
      setSelectedPlanIds(new Set());
      return;
    }

    if (selectedPlanIds.size === 0) {
      notify("Select at least one plan to delete", "error");
      return;
    }

    if (!window.confirm(`Delete ${selectedPlanIds.size} plan(s)? This action cannot be undone.`)) return;

    try {
      setLoading(true);
      await Promise.all(Array.from(selectedPlanIds).map(id => deletePlan(id)));
      notify(`${selectedPlanIds.size} plan(s) deleted successfully`);
      setPlanDeleteMode(false);
      setSelectedPlanIds(new Set());
      load();
    } catch (err) {
      console.error("Bulk delete plans error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to delete selected plans";
      notify(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeletePlans = () => {
    setPlanDeleteMode(false);
    setSelectedPlanIds(new Set());
  };

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filteredMembers = members.filter(m =>
    (m.name||"").toLowerCase().includes(search.toLowerCase()) ||
    (m.phone||"").includes(search) ||
    (m.email||"").toLowerCase().includes(search.toLowerCase())
  );

  const filteredPlans = plans.filter(p =>
    (p.name||"").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={S.wrap}>
      <Toast {...toast} />

      {/* Top action bar */}
      <div style={S.topBar}>
        <button style={{ ...S.btn, ...S.primary }} onClick={() => setShowAddMember(true)}>
          <i className="fas fa-user-plus" /> Add Member
        </button>
        <button style={{ ...S.btn, ...S.primary }} onClick={() => setShowAddPlan(true)}>
          <i className="fas fa-plus" /> Add Plan
        </button>
        {view === "members" && (
          <button style={{ ...S.btn, ...(memberDeleteMode ? { background:"#ef4444", color:"#fff" } : S.ghost), whiteSpace:"nowrap" }} onClick={handleDeleteMembersClick}>
            {memberDeleteMode ? `Delete Selected (${selectedMemberIds.size})` : "Delete Members"}
          </button>
        )}
        {view === "members" && memberDeleteMode && (
          <button style={{ ...S.btn, ...S.ghost, whiteSpace:"nowrap" }} onClick={handleCancelDeleteMembers}>
            Cancel Delete
          </button>
        )}
        {view === "plans" && (
          <button style={{ ...S.btn, ...(planDeleteMode ? { background:"#ef4444", color:"#fff" } : S.ghost), whiteSpace:"nowrap" }} onClick={handleDeletePlansClick}>
            {planDeleteMode ? `Delete Selected (${selectedPlanIds.size})` : "Delete Plans"}
          </button>
        )}
        {view === "plans" && planDeleteMode && (
          <button style={{ ...S.btn, ...S.ghost, whiteSpace:"nowrap" }} onClick={handleCancelDeletePlans}>
            Cancel Delete
          </button>
        )}
        <button style={{ ...S.btn, ...(view === "members" ? S.active : S.ghost) }} onClick={() => { setView("members"); setMemberDeleteMode(false); setSelectedMemberIds(new Set()); }}>
          <i className="fas fa-users" /> View Members
        </button>
        <button style={{ ...S.btn, ...(view === "plans" ? S.active : S.ghost) }} onClick={() => { setView("plans"); setPlanDeleteMode(false); setSelectedPlanIds(new Set()); }}>
          <i className="fas fa-id-card" /> View Memberships
        </button>
        <input style={S.search} placeholder="🔍 Search…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* ── Members Table ── */}
      {view === "members" && (
        <div style={{ ...S.card, overflowX:"auto" }}>
          <h3 style={{ margin:"0 0 1rem", color:"#3e0994" }}>Members ({filteredMembers.length})</h3>
          {loading ? <p style={{ color:"#64748b" }}>Loading…</p> : (
            <table style={S.table}>
              <thead>
                <tr>{[memberDeleteMode ? "Select" : "#","Name","Email","Phone","City","Status"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filteredMembers.map((m, i) => (
                  <tr key={m.id || m.memberId}>
                    <td style={S.td}>
                      {memberDeleteMode ? (
                        <input
                          type="checkbox"
                          checked={selectedMemberIds.has(m.id || m.memberId)}
                          onChange={e => toggleSelectMember(m.id || m.memberId, e.target.checked)}
                        />
                      ) : (
                        i + 1
                      )}
                    </td>
                    <td style={S.td}><strong>{m.name}</strong></td>
                    <td style={S.td}>{m.email || "—"}</td>
                    <td style={S.td}>{m.phone || "—"}</td>
                    <td style={S.td}>{m.city || "—"}</td>
                    <td style={S.td}>
                      <span style={{ ...S.badge, background: m.status === "ACTIVE" ? "#dcfce7" : "#fee2e2", color: m.status === "ACTIVE" ? "#166534" : "#dc2626" }}>
                        {m.status || "INACTIVE"}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr><td colSpan={6} style={{ ...S.td, textAlign:"center", color:"#94a3b8", padding:"2rem" }}>No members found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Plans Table ── */}
      {view === "plans" && (
        <div style={{ ...S.card, overflowX:"auto" }}>
          <h3 style={{ margin:"0 0 1rem", color:"#3e0994" }}>Membership Plans ({filteredPlans.length})</h3>
          {loading ? <p style={{ color:"#64748b" }}>Loading…</p> : (
            <table style={S.table}>
              <thead>
                <tr>{[planDeleteMode ? "Select" : "#","Name","Price","Duration","Days/Week","Description","Active"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filteredPlans.map((p, i) => (
                  <tr key={p.id}>
                    <td style={S.td}>
                      {planDeleteMode ? (
                        <input
                          type="checkbox"
                          checked={selectedPlanIds.has(p.id)}
                          onChange={e => toggleSelectPlan(p.id, e.target.checked)}
                        />
                      ) : (
                        i + 1
                      )}
                    </td>
                    <td style={S.td}><strong>{p.name}</strong></td>
                    <td style={S.td}>₹{Number(p.price).toLocaleString()}</td>
                    <td style={S.td}>{p.durationMonths} month{p.durationMonths !== 1 ? "s" : ""}</td>
                    <td style={S.td}>{p.daysPerWeek} days/wk</td>
                    <td style={S.td}>{p.description || "—"}</td>
                    <td style={S.td}>
                      <span style={{ ...S.badge, background: p.isActive ? "#dcfce7" : "#fee2e2", color: p.isActive ? "#166534" : "#dc2626" }}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredPlans.length === 0 && (
                  <tr><td colSpan={7} style={{ ...S.td, textAlign:"center", color:"#94a3b8", padding:"2rem" }}>No plans found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Add Member Modal ── */}
      {showAddMember && (
        <Modal title="Add New Member" onClose={() => setShowAddMember(false)}>
          <form onSubmit={handleAddMember}>
            <p style={{ fontWeight:600, color:"#3e0994", marginBottom:"0.75rem", fontSize:"0.82rem", textTransform:"uppercase", letterSpacing:"0.5px" }}>Basic Info</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 1rem" }}>
              {[["name","Full Name *","text",true],["phone","Phone *","tel",true],["email","Email *","email",true],["address","Address","text",false],["city","City","text",false],["state","State","text",false],["pincode","Pincode","text",false]].map(([k,l,t,req]) => (
                <div key={k} style={{ ...S.field, gridColumn:["email","address"].includes(k) ? "1 / -1" : "auto" }}>
                  <label style={S.label}>{l}</label>
                  <input style={{ ...S.input, borderColor: memberErrors[k] ? "#ef4444" : "#d1d5db" }} type={t} required={req} value={memberForm[k]}
                    onChange={e => { setMemberForm(f => ({...f,[k]:e.target.value})); setMemberErrors(er => ({...er,[k]:""})); }}
                    placeholder={`Enter ${l.replace(" *","").toLowerCase()}`} />
                  {memberErrors[k] && <span style={{ color:"#ef4444", fontSize:"0.78rem" }}>{memberErrors[k]}</span>}
                </div>
              ))}
            </div>

            <div style={S.field}>
              <label style={S.label}>Login Password</label>
              <PasswordField
                value={memberForm.password}
                onChange={e => { setMemberForm(f => ({...f, password:e.target.value })); setMemberErrors(er => ({...er, password:"" })); }}
                placeholder="Optional. Leave blank to let the member set it later via Forgot Password"
                inputStyle={S.input}
              />
              <div style={{ marginTop:"0.35rem", fontSize:"0.8rem", color:"#64748b" }}>
                If left blank, a temporary login will be created and the member can set a new password from the Forgot Password page using their phone number.
              </div>
            </div>

            <p style={{ fontWeight:600, color:"#3e0994", margin:"1rem 0 0.75rem", fontSize:"0.82rem", textTransform:"uppercase", letterSpacing:"0.5px" }}>
              Assign Membership
            </p>
            <div style={S.field}>
              <label style={S.label}>Membership Plan *</label>
              <select style={{ ...S.input, borderColor: memberErrors.planId ? "#ef4444" : "#d1d5db" }} value={memberForm.planId} onChange={e => setMemberForm(f => ({...f,planId:e.target.value,batchId:""}))} required>
                <option value="">— Select plan —</option>
                {plans.filter(p => p.isActive).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{Number(p.price).toLocaleString()} / {p.durationMonths}mo ({p.daysPerWeek}d/wk)
                  </option>
                ))}
              </select>
              {memberErrors.planId && <span style={{ color:"#ef4444", fontSize:"0.78rem" }}>{memberErrors.planId}</span>}
            </div>
            <div style={S.field}>
              <label style={S.label}>Batch *</label>
              <select
                style={{ ...S.input, borderColor: memberErrors.batchId ? "#ef4444" : "#d1d5db" }}
                value={memberForm.batchId}
                onChange={e => { setMemberForm(f => ({...f,batchId:e.target.value})); setMemberErrors(er => ({...er,batchId:""})); }}
                required
                disabled={!memberForm.planId}
              >
                <option value="">{memberForm.planId ? "— Select batch —" : "— Select plan first —"}</option>
                {batches.filter(b => b.isActive !== false).map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.type} · {b.timeSlot}) — {b.availableSlots ?? (b.capacity - (b.currentEnrollment||0))} spots left
                  </option>
                ))}
              </select>
              {memberErrors.batchId && <span style={{ color:"#ef4444", fontSize:"0.78rem" }}>{memberErrors.batchId}</span>}
            </div>

            <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.5rem" }}>
              <button type="submit" style={{ ...S.btn, ...S.primary, flex:1 }}><i className="fas fa-user-plus" /> Add Member</button>
              <button type="button" style={{ ...S.btn, ...S.ghost, flex:1 }} onClick={() => setShowAddMember(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Add Plan Modal ── */}
      {showAddPlan && (
        <Modal title="Add Membership Plan" onClose={() => setShowAddPlan(false)}>
          <form onSubmit={handleAddPlan}>
            <div style={S.field}>
              <label style={S.label}>Plan Name *</label>
              <input style={{ ...S.input, borderColor: planErrors.name ? "#ef4444" : "#d1d5db" }} value={planForm.name} required onChange={e => { setPlanForm(f => ({...f,name:e.target.value})); setPlanErrors(er => ({...er,name:""})); }} placeholder="e.g. 3 Months Standard" />
              {planErrors.name && <span style={{ color:"#ef4444", fontSize:"0.78rem" }}>{planErrors.name}</span>}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 1rem" }}>
              <div style={S.field}>
                <label style={S.label}>Price (₹) *</label>
                <input style={{ ...S.input, borderColor: planErrors.price ? "#ef4444" : "#d1d5db" }} type="number" min="1" required value={planForm.price} onChange={e => { setPlanForm(f => ({...f,price:e.target.value})); setPlanErrors(er => ({...er,price:""})); }} placeholder="e.g. 2500" />
                {planErrors.price && <span style={{ color:"#ef4444", fontSize:"0.78rem" }}>{planErrors.price}</span>}
              </div>
              <div style={S.field}>
                <label style={S.label}>Duration (months) *</label>
                <input style={{ ...S.input, borderColor: planErrors.durationMonths ? "#ef4444" : "#d1d5db" }} type="number" min="1" max="24" required value={planForm.durationMonths} onChange={e => { setPlanForm(f => ({...f,durationMonths:e.target.value})); setPlanErrors(er => ({...er,durationMonths:""})); }} placeholder="e.g. 3" />
                {planErrors.durationMonths && <span style={{ color:"#ef4444", fontSize:"0.78rem" }}>{planErrors.durationMonths}</span>}
              </div>
              <div style={S.field}>
                <label style={S.label}>Days per Week *</label>
                <input style={{ ...S.input, borderColor: planErrors.daysPerWeek ? "#ef4444" : "#d1d5db" }} type="number" min="1" max="7" required value={planForm.daysPerWeek} onChange={e => { setPlanForm(f => ({...f,daysPerWeek:e.target.value})); setPlanErrors(er => ({...er,daysPerWeek:""})); }} placeholder="e.g. 5" />
                {planErrors.daysPerWeek && <span style={{ color:"#ef4444", fontSize:"0.78rem" }}>{planErrors.daysPerWeek}</span>}
              </div>
            </div>
            <div style={S.field}>
              <label style={S.label}>Description</label>
              <input style={S.input} value={planForm.description} onChange={e => setPlanForm(f => ({...f,description:e.target.value}))} placeholder="e.g. Gym access + group classes + nutrition guide" />
            </div>

            {/* Live preview */}
            {planForm.name && (
              <div style={{ background:"linear-gradient(135deg,#3e0994,#8e2bbd)", borderRadius:10, padding:"1rem", color:"#fff", marginBottom:"1rem" }}>
                <div style={{ fontSize:"0.72rem", opacity:0.8, textTransform:"uppercase", letterSpacing:"0.5px" }}>Preview</div>
                <div style={{ fontWeight:700, fontSize:"1.05rem", marginTop:"0.25rem" }}>{planForm.name}</div>
                <div style={{ fontSize:"1.5rem", fontWeight:800 }}>₹{planForm.price ? Number(planForm.price).toLocaleString() : "—"}</div>
                <div style={{ fontSize:"0.82rem", opacity:0.85 }}>
                  {planForm.durationMonths || "—"} month{planForm.durationMonths > 1 ? "s" : ""} · {planForm.daysPerWeek || "—"} days/week
                </div>
                {planForm.description && <div style={{ fontSize:"0.78rem", opacity:0.75, marginTop:"0.2rem" }}>{planForm.description}</div>}
              </div>
            )}

            <div style={{ display:"flex", gap:"0.75rem" }}>
              <button type="submit" style={{ ...S.btn, ...S.primary, flex:1 }}><i className="fas fa-plus" /> Create Plan</button>
              <button type="button" style={{ ...S.btn, ...S.ghost, flex:1 }} onClick={() => setShowAddPlan(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
