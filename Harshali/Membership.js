import { useState } from "react";
import { usePayments } from "./PaymentContext";
import { useProfile } from "./ProfileContext";
import { useMemberships } from "./MembershipContext";
import "./App.css";

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

  const plans = [
    { id: 1, name: "1 Month Basic", price: 1000, duration: "30 days", durationDays: 30, features: ["Gym Access", "Locker Facility"] },
    { id: 2, name: "3 Months Standard", price: 2500, duration: "90 days", durationDays: 90, features: ["Gym Access", "Locker", "Group Classes"] },
    { id: 3, name: "6 Months Premium", price: 5000, duration: "180 days", durationDays: 180, features: ["All Standard", "Personal Trainer", "Diet Plan"] },
    { id: 4, name: "12 Months Elite", price: 9000, duration: "365 days", durationDays: 365, features: ["All Premium", "Supplements", "Priority Booking"] }
  ];

  const stats = getMembershipStats();

  const handlePurchase = (plan) => {
    addPayment({ amount: plan.price, method: "card" }, profile.name);
    activateMembership(plan.name, plan.durationDays);
    addMembership(profile.name, plan.name, plan.price, plan.durationDays);
    setSelectedPlan(plan);
    setShowSuccess(true);
    setTimeout(() => { setShowSuccess(false); setSelectedPlan(null); }, 3000);
  };

  return (
    <div className="page-view">
      <h2 style={{ fontSize: "1.8rem", marginBottom: "0.3rem" }}>Membership Plans</h2>
      <p style={{ color: "#888", marginBottom: "1.5rem" }}>Choose the plan that fits your goals</p>

      {profile.plan !== "No Active Plan" && (
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white", padding: "1.5rem", borderRadius: "14px",
          marginBottom: "1.5rem", display: "flex",
          justifyContent: "space-between", alignItems: "center",
          boxShadow: "0 8px 24px rgba(102,126,234,0.4)"
        }}>
          <div>
            <h3 style={{ margin: 0, marginBottom: "0.4rem" }}>Current Plan: {profile.plan}</h3>
            <p style={{ margin: 0, opacity: 0.85 }}>Expires: {profile.planExpiry}</p>
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
          const meta = planMeta[index];
          const isHovered = hoveredId === plan.id;
          return (
            <div
              key={plan.id}
              onMouseEnter={() => setHoveredId(plan.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: cardGradients[index],
                borderRadius: "20px",
                color: "white",
                overflow: "hidden",
                position: "relative",
                transform: isHovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                boxShadow: isHovered
                  ? "0 20px 48px rgba(0,0,0,0.35)"
                  : "0 8px 24px rgba(0,0,0,0.2)",
                cursor: "pointer",
              }}
            >
              {/* Decorative circle */}
              <div style={{
                position: "absolute", top: "-30px", right: "-30px",
                width: "120px", height: "120px", borderRadius: "50%",
                background: "rgba(255,255,255,0.08)"
              }} />
              <div style={{
                position: "absolute", bottom: "-40px", left: "-20px",
                width: "150px", height: "150px", borderRadius: "50%",
                background: "rgba(255,255,255,0.05)"
              }} />

              <div style={{ padding: "1.8rem", position: "relative" }}>
                {/* Badge */}
                <span style={{
                  background: meta.badgeColor,
                  color: "white", fontSize: "0.7rem", fontWeight: "700",
                  padding: "3px 10px", borderRadius: "20px",
                  textTransform: "uppercase", letterSpacing: "0.5px"
                }}>
                  {meta.badge}
                </span>

                {/* Icon + Name */}
                <div style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>
                  <i className={`fas ${meta.icon}`} style={{ fontSize: "1.8rem", opacity: 0.9 }}></i>
                </div>
                <h3 style={{ fontSize: "1.3rem", margin: "0 0 0.3rem" }}>{plan.name}</h3>
                <p style={{ fontSize: "0.85rem", opacity: 0.75, margin: 0 }}>{plan.duration}</p>

                {/* Price */}
                <div style={{
                  margin: "1.2rem 0",
                  padding: "0.8rem 0",
                  borderTop: "1px solid rgba(255,255,255,0.2)",
                  borderBottom: "1px solid rgba(255,255,255,0.2)"
                }}>
                  <span style={{ fontSize: "2.6rem", fontWeight: "800", letterSpacing: "-1px" }}>₹{plan.price}</span>
                  <span style={{ fontSize: "0.85rem", opacity: 0.75, marginLeft: "4px" }}>/ plan</span>
                </div>

                {/* Features */}
                <div style={{ marginBottom: "1.2rem" }}>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      fontSize: "0.88rem", marginBottom: "0.5rem", opacity: 0.92
                    }}>
                      <span style={{
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: "50%", width: "20px", height: "20px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0
                      }}>
                        <i className="fas fa-check" style={{ fontSize: "0.65rem" }}></i>
                      </span>
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Sold count */}
                <p style={{ fontSize: "0.78rem", opacity: 0.65, marginBottom: "1rem", textAlign: "center" }}>
                  <i className="fas fa-users" style={{ marginRight: "5px" }}></i>
                  {stats[plan.name] || 0} members enrolled
                </p>

                {/* Button */}
                <button
                  onClick={() => handlePurchase(plan)}
                  style={{
                    width: "100%", padding: "12px",
                    background: isHovered ? "white" : "rgba(255,255,255,0.15)",
                    color: isHovered ? "#3e0994" : "white",
                    border: "2px solid rgba(255,255,255,0.6)",
                    borderRadius: "10px", fontWeight: "700",
                    fontSize: "0.95rem", cursor: "pointer",
                    transition: "all 0.3s ease",
                    letterSpacing: "0.3px"
                  }}
                >
                  <i className="fas fa-shopping-cart" style={{ marginRight: "8px" }}></i>
                  Purchase Now
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
