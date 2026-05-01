import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Membershippurchase.css";

const planMeta = [
  { icon: "fa-bolt",  badge: "Starter",    badgeColor: "#f59e0b" },
  { icon: "fa-fire",  badge: "Popular",    badgeColor: "#10b981" },
  { icon: "fa-crown", badge: "Best Value", badgeColor: "#f97316" },
  { icon: "fa-gem",   badge: "Ultimate",   badgeColor: "#e11d48" },
];
const cardGradients = [
  "linear-gradient(145deg,#7c3aed 0%,#6d28d9 100%)",
  "linear-gradient(145deg,#1d4ed8 0%,#2563eb 100%)",
  "linear-gradient(145deg,#8b5cf6 0%,#4f46e5 100%)",
  "linear-gradient(145deg,#1e40af 0%,#3b82f6 100%)",
];

const plans = [
  { id:1, name:"1 Month Basic",    price:1000, duration:"30 days",  features:["Gym Access","Locker Facility","Basic Equipment"] },
  { id:2, name:"3 Months Standard",price:2500, duration:"90 days",  features:["Gym Access","Locker Facility","Group Classes","Nutrition Guide"] },
  { id:3, name:"6 Months Premium", price:5000, duration:"180 days", features:["All Standard Features","Personal Trainer","Diet Plan","Body Analysis"] },
  { id:4, name:"12 Months Elite",  price:9000, duration:"365 days", features:["All Premium Features","Supplements Discount","Priority Booking","Free Guest Pass"] },
];

export default function MembershipPurchase() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const member    = location.state?.member;
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const handlePurchase = (plan) => {
    localStorage.setItem("pendingMembershipPlan", JSON.stringify(plan));
    navigate("/member-dashboard/payment", { state: { membershipPlan: plan } });
  };

  return (
    <div className="membership-purchase-container">
      <div className="sidebar">
        <div className="sidebar-header"><h1 className="sidebar-title">MuscleFit</h1></div>
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate('/admin-dashboard')}><i className="fas fa-home" /><span>Dashboard</span></button>
          <button className="nav-item active"><i className="fas fa-users" /><span>Members</span></button>
          <button className="nav-item" onClick={() => navigate('/equipment')}><i className="fas fa-dumbbell" /><span>Gym Equipment</span></button>
          <button className="nav-item" onClick={() => navigate('/announcements')}><i className="fas fa-bullhorn" /><span>Announcements</span></button>
          <button className="nav-item" onClick={() => navigate('/staff-list')}><i className="fas fa-user-tie" /><span>Staff Management</span></button>
          <button className="nav-item" onClick={() => { localStorage.clear(); navigate('/login'); }}><i className="fas fa-sign-out-alt" /><span>Logout</span></button>
        </nav>
      </div>

      <div className="main-content">
        <div className="membership-page">
          <div className="membership-header">
            <button className="back-btn" onClick={() => navigate('/members')}><i className="fas fa-arrow-left" /> Back to Members</button>
          </div>

          {member && (
            <div className="member-info-card">
              <div className="member-info-content">
                <div className="member-info-left"><img src={member.img} alt={member.name} className="member-info-avatar" /></div>
                <div className="member-info-right">
                  <h3>{member.name}</h3>
                  <p><i className="fas fa-phone" /> {member.phone}</p>
                  <p><i className="fas fa-map-marker-alt" /> {member.address}</p>
                  <p><i className="fas fa-calendar" /> Current Expiry: {member.nextBill}</p>
                </div>
              </div>
            </div>
          )}

          <div className="page-title"><h2>Membership Plans</h2><p>Choose the plan that fits your goals</p></div>

          {showSuccess && (
            <div className="success-message">
              <i className="fas fa-check-circle" /> Successfully purchased {selectedPlan?.name}! Redirecting...
            </div>
          )}

          <div className="plans-grid">
            {plans.map((plan, index) => {
              const meta = planMeta[index];
              const isHovered = hoveredId === plan.id;
              return (
                <div key={plan.id} className={`plan-card ${isHovered ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredId(plan.id)} onMouseLeave={() => setHoveredId(null)}
                  style={{ background: cardGradients[index], transform: isHovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)", boxShadow: isHovered ? "0 20px 48px rgba(0,0,0,0.35)" : "0 8px 24px rgba(0,0,0,0.2)" }}>
                  <div className="decorative-circle circle-top-right" />
                  <div className="decorative-circle circle-bottom-left" />
                  <div className="plan-content">
                    <span className="plan-badge" style={{ backgroundColor: meta.badgeColor }}>{meta.badge}</span>
                    <div className="plan-icon"><i className={`fas ${meta.icon}`} /></div>
                    <h3 className="plan-name">{plan.name}</h3>
                    <p className="plan-duration">{plan.duration}</p>
                    <div className="plan-price"><span className="price-amount">₹{plan.price}</span><span className="price-period">/ plan</span></div>
                    <div className="plan-features">
                      {plan.features.map((f, i) => <div key={i} className="feature-item"><span className="feature-icon"><i className="fas fa-check" /></span>{f}</div>)}
                    </div>
                    <button className="purchase-btn" onClick={() => handlePurchase(plan)}
                      style={{ background: isHovered ? "white" : "rgba(255,255,255,0.15)", color: isHovered ? "#3e0994" : "white" }}>
                      <i className="fas fa-shopping-cart" /> Purchase Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
