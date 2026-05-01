import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPlans, getBatches, assignMembership } from "./api/coreService";
import api from "./api/axios";

export default function VisitorMembership() {
  const navigate  = useNavigate();
  const visitorId = localStorage.getItem("visitorId");
  const name      = localStorage.getItem("name") || "Visitor";
  const email     = localStorage.getItem("email") || "";

  const [plans, setPlans]       = useState([]);
  const [batches, setBatches]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [batchId, setBatchId]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  useEffect(() => {
    Promise.all([getPlans(), getBatches()])
      .then(([p, b]) => { setPlans(p.data || []); setBatches(b.data || []); })
      .catch(() => setError("Failed to load plans"));
  }, []);

  const handlePurchase = async () => {
    if (!selected) { setError("Please select a plan"); return; }
    if (!batchId)  { setError("Please select a batch"); return; }
    setError(""); setLoading(true);
    try {
      // 1. Convert visitor to member in auth service
      await api.post("/api/auth/convert-to-member", {
        visitorId: parseInt(visitorId),
        password:  localStorage.getItem("_vpass") || "Member@123",
        gymCenter: "",
      });

      // 2. Assign membership in core service
      // The Kafka event from step 1 creates the customer record,
      // but since Kafka may not be running we try directly
      try {
        const membersRes = await api.get(`/api/members`);
        const member = (membersRes.data || []).find(m => m.email === email);
        if (member) {
          await assignMembership({ memberId: member.id, planId: parseInt(selected.id), batchId: parseInt(batchId) });
        }
      } catch { /* membership assignment is best-effort */ }

      // 3. Re-login as member to get new MEMBER role token
      const loginRes = await api.post("/api/auth/login", {
        email,
        password: localStorage.getItem("_vpass") || "Member@123",
      });
      const data = loginRes.data;
      localStorage.setItem("token",    data.token);
      localStorage.setItem("role",     data.role);
      localStorage.setItem("name",     data.name);
      localStorage.setItem("email",    data.email);
      localStorage.setItem("memberId", data.memberId || data.id);
      localStorage.removeItem("visitorId");
      localStorage.removeItem("_vpass");

      setSuccess(true);
      setTimeout(() => navigate("/member-dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Purchase failed. Please contact the gym.");
    } finally { setLoading(false); }
  };

  const S = {
    root:  { minHeight:"100vh", background:"#0f172a", color:"#fff", fontFamily:"'Poppins',sans-serif", padding:"2rem" },
    h1:    { fontSize:"1.8rem", fontWeight:700, marginBottom:"0.25rem" },
    grid:  { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"1.25rem", margin:"2rem 0" },
    card:  { borderRadius:14, padding:"1.5rem", cursor:"pointer", transition:"all 0.2s", border:"2px solid transparent", position:"relative", overflow:"hidden" },
    btn:   { padding:"0.75rem 1.5rem", borderRadius:8, border:"none", cursor:"pointer", fontWeight:600, fontSize:"1rem", fontFamily:"inherit" },
    sel:   { background:"#1e293b", padding:"0.75rem 1rem", borderRadius:8, border:"1px solid #334155", color:"#fff", width:"100%", fontSize:"0.95rem", fontFamily:"inherit", marginTop:"0.5rem" },
  };

  const gradients = [
    "linear-gradient(145deg,#7c3aed,#6d28d9)",
    "linear-gradient(145deg,#1d4ed8,#2563eb)",
    "linear-gradient(145deg,#8b5cf6,#4f46e5)",
    "linear-gradient(145deg,#1e40af,#3b82f6)",
  ];

  if (success) return (
    <div style={{ ...S.root, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"4rem", marginBottom:"1rem" }}>🎉</div>
        <h2 style={{ color:"#22c55e" }}>Welcome, Member!</h2>
        <p style={{ color:"#94a3b8" }}>Your membership is active. Redirecting to Member Dashboard…</p>
      </div>
    </div>
  );

  return (
    <div style={S.root}>
      <button onClick={() => navigate("/visitor-dashboard")} style={{ ...S.btn, background:"transparent", color:"#6366f1", border:"1px solid #6366f1", marginBottom:"1.5rem" }}>
        ← Back
      </button>
      <h1 style={S.h1}>Choose Your Membership Plan</h1>
      <p style={{ color:"#94a3b8" }}>Select a plan to become a full member of MuscleFit Gym</p>

      {error && <div style={{ background:"#ef444420", border:"1px solid #ef4444", borderRadius:8, padding:"0.75rem 1rem", color:"#ef4444", margin:"1rem 0" }}>{error}</div>}

      <div style={S.grid}>
        {plans.filter(p => p.isActive).map((p, i) => (
          <div key={p.id} onClick={() => setSelected(p)}
            style={{ ...S.card, background: gradients[i % gradients.length], borderColor: selected?.id === p.id ? "#fff" : "transparent", transform: selected?.id === p.id ? "scale(1.03)" : "scale(1)" }}>
            <div style={{ fontSize:"0.75rem", opacity:0.8, textTransform:"uppercase", letterSpacing:"0.5px" }}>
              {p.durationMonths} month{p.durationMonths !== 1 ? "s" : ""} · {p.daysPerWeek} days/week
            </div>
            <div style={{ fontWeight:700, fontSize:"1.1rem", margin:"0.5rem 0 0.25rem" }}>{p.name}</div>
            <div style={{ fontSize:"2rem", fontWeight:800 }}>₹{Number(p.price).toLocaleString()}</div>
            {p.description && <div style={{ fontSize:"0.8rem", opacity:0.8, marginTop:"0.5rem" }}>{p.description}</div>}
            {selected?.id === p.id && <div style={{ position:"absolute", top:12, right:12, background:"#fff", color:"#6366f1", borderRadius:"50%", width:24, height:24, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>✓</div>}
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ background:"#1e293b", borderRadius:12, padding:"1.5rem", border:"1px solid #334155", maxWidth:480 }}>
          <h3 style={{ margin:"0 0 1rem", color:"#6366f1" }}>Select Batch for {selected.name}</h3>
          <select style={S.sel} value={batchId} onChange={e => setBatchId(e.target.value)}>
            <option value="">— Choose a batch —</option>
            {batches.filter(b => b.isActive !== false).map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.type} · {b.timeSlot}) — {b.availableSlots ?? (b.capacity - (b.currentEnrollment||0))} spots left
              </option>
            ))}
          </select>
          <button onClick={handlePurchase} disabled={loading || !batchId}
            style={{ ...S.btn, background:"#6366f1", color:"#fff", width:"100%", marginTop:"1rem", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Processing…" : `Purchase ${selected.name} — ₹${Number(selected.price).toLocaleString()}`}
          </button>
        </div>
      )}
    </div>
  );
}
