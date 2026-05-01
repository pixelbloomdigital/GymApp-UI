import { useState, useEffect } from "react";
import { usePayments } from "./PaymentContext.jsx";
import { useProfile } from "./ProfileContext";
import { useMemberships } from "./MembershipContext.jsx";
import "./App.css";
import { getPlans, getBatches, assignMembership, getMemberMemberships } from "./api/coreService";

const planMeta = [
  { icon: "fa-bolt", badge: "Starter", badgeColor: "#f59e0b" },
  { icon: "fa-fire", badge: "Popular", badgeColor: "#10b981" },
  { icon: "fa-crown", badge: "Best Value", badgeColor: "#f97316" },
  { icon: "fa-gem", badge: "Ultimate", badgeColor: "#e11d48" },
];

const cardGradients = [
  "linear-gradient(145deg, #7c3aed 0%, #6d28d9 100%)",
  "linear-gradient(145deg, #1d4ed8 0%, #2563eb 100%)",
  "linear-gradient(145deg, #8b5cf6 0%, #4f46e5 100%)",
  "linear-gradient(145deg, #1e40af 0%, #3b82f6 100%)",
];

export function UserMembership() {
  const { addPayment } = usePayments();
  const { profile, activateMembership } = useProfile();
  const { addMembership, getMembershipStats } = useMemberships();
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [plans, setPlans]           = useState([]);
  const [batches, setBatches]       = useState([]);
  const [currentMembership, setCurrentMembership] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const memberId = localStorage.getItem('id');

  useEffect(() => {
    Promise.all([getPlans(), getBatches()])
      .then(([p, b]) => { setPlans(p.data?.filter(pl => pl.isActive !== false) || []); setBatches(b.data || []); })
      .catch(() => setError("Failed to load plans"))
      .finally(() => setLoading(false));
    if (memberId) {
      getMemberMemberships(memberId)
        .then(r => { const active = (r.data || []).find(m => m.status === 'ACTIVE'); setCurrentMembership(active); })
        .catch(() => {});
    }
  }, [memberId]);

  const handlePurchase = async (plan) => {
    if (!memberId) { setError("Member ID not found. Please log in again."); return; }
    const batchId = batches[0]?.id;
    if (!batchId) { setError("No batches available. Please contact gym staff."); return; }
    setPurchasing(true); setError("");
    try {
      await assignMembership({ memberId: parseInt(memberId), planId: plan.id, batchId });
      addPayment({ amount: plan.price, method: "card" }, profile.name);
      activateMembership(plan.name, plan.durationMonths * 30);
      addMembership(profile.name, plan.name, plan.price, plan.durationMonths * 30);
      setSelectedPlan(plan);
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); setSelectedPlan(null); }, 3000);
    } catch (e) {
      setError(e.response?.data?.message || "Purchase failed. Please contact gym staff.");
    } finally { setPurchasing(false); }
  };

  const stats = getMembershipStats();

  return (
    <div className="page-view">
      <h2 style={{ fontSize: "1.8rem", marginBottom: "0.3rem" }}>Membership Plans</h2>
      <p style={{ color: "#888", marginBottom: "1.5rem" }}>Choose the plan that fits your goals</p>

      {loading && <p style={{ color:"#64748b" }}>Loading plans…</p>}
      {error && <div style={{ background:"#fee2e2", color:"#dc2626", padding:"0.75rem 1rem", borderRadius:8, marginBottom:"1rem" }}>{error}</div>}

      {currentMembership && (
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white", padding: "1.5rem", borderRadius: "14px",
          marginBottom: "1.5rem", display: "flex",
          justifyContent: "space-between", alignItems: "center",
          boxShadow: "0 8px 24px rgba(102,126,234,0.4)"
        }}>
          <div>
            <h3 style={{ margin: 0, marginBottom: "0.4rem" }}>Current Plan: {currentMembership.planName}</h3>
            <p style={{ margin: 0, opacity: 0.85 }}>
              Expires: {currentMembership.endDate ? new Date(currentMembership.endDate).toLocaleDateString('en-IN') : "—"}
              {currentMembership.daysRemaining != null && ` · ${currentMembership.daysRemaining} days left`}
            </p>
          </div>
          <i className="fas fa-check-circle" style={{ fontSize: "2.5rem", opacity: 0.9 }}></i>
        </div>
      )}

      {showSuccess && (
        <div style={{
          background: "linear-gradient(135deg, #10b981, #059669)",
          color: "white", padding: "1rem", borderRadius: "10px",
          marginBottom: "1rem", textAlign: "center",
          boxShadow: "0 4px 16px rgba(16,185,129,0.4)"
        }}>
          <i className="fas fa-check-circle" style={{ marginRight: "8px" }}></i>
          Successfully purchased {selectedPlan?.name}!
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginTop: "1rem" }}>
        {plans.map((plan, index) => {
          const meta = planMeta[index % planMeta.length];
          const isHovered = hoveredId === plan.id;
          const features = plan.description ? [plan.description] : [`${plan.durationMonths} months`, `${plan.daysPerWeek} days/week`];
          return (
            <div
              key={plan.id}
              onMouseEnter={() => setHoveredId(plan.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: cardGradients[index % cardGradients.length],
                borderRadius: "20px", color: "white", overflow: "hidden",
                position: "relative",
                transform: isHovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                boxShadow: isHovered ? "0 20px 48px rgba(0,0,0,0.35)" : "0 8px 24px rgba(0,0,0,0.2)",
                cursor: "pointer",
              }}
            >
              <div style={{ position:"absolute", top:"-30px", right:"-30px", width:"120px", height:"120px", borderRadius:"50%", background:"rgba(255,255,255,0.08)" }} />
              <div style={{ padding: "1.8rem", position: "relative" }}>
                <span style={{ background:meta.badgeColor, color:"white", fontSize:"0.7rem", fontWeight:"700", padding:"3px 10px", borderRadius:"20px", textTransform:"uppercase", letterSpacing:"0.5px" }}>{meta.badge}</span>
                <div style={{ marginTop:"1rem", marginBottom:"0.5rem" }}>
                  <i className={`fas ${meta.icon}`} style={{ fontSize:"1.8rem", opacity:0.9 }}></i>
                </div>
                <h3 style={{ fontSize:"1.3rem", margin:"0 0 0.3rem" }}>{plan.name}</h3>
                <p style={{ fontSize:"0.85rem", opacity:0.75, margin:0 }}>{plan.durationMonths} month{plan.durationMonths !== 1 ? "s" : ""} · {plan.daysPerWeek} days/week</p>
                <div style={{ margin:"1.2rem 0", padding:"0.8rem 0", borderTop:"1px solid rgba(255,255,255,0.2)", borderBottom:"1px solid rgba(255,255,255,0.2)" }}>
                  <span style={{ fontSize:"2.6rem", fontWeight:"800", letterSpacing:"-1px" }}>₹{Number(plan.price).toLocaleString()}</span>
                  <span style={{ fontSize:"0.85rem", opacity:0.75, marginLeft:"4px" }}>/ plan</span>
                </div>
                {plan.description && <p style={{ fontSize:"0.82rem", opacity:0.8, marginBottom:"1rem", lineHeight:1.5 }}>{plan.description}</p>}
                <button
                  onClick={() => handlePurchase(plan)}
                  disabled={purchasing}
                  style={{ width:"100%", padding:"12px", background:isHovered?"white":"rgba(255,255,255,0.15)", color:isHovered?"#3e0994":"white", border:"2px solid rgba(255,255,255,0.6)", borderRadius:"10px", fontWeight:"700", fontSize:"0.95rem", cursor:purchasing?"not-allowed":"pointer", transition:"all 0.3s ease", opacity:purchasing?0.7:1 }}
                >
                  <i className="fas fa-shopping-cart" style={{ marginRight:"8px" }}></i>
                  {purchasing ? "Processing…" : "Purchase Now"}
                </button>
              </div>
            </div>
          );
        })}
        {!loading && plans.length === 0 && <p style={{ color:"#64748b" }}>No plans available.</p>}
      </div>
    </div>
  );
}
