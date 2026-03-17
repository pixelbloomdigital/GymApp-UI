import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./MembershipPurchase.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

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

export default function MembershipPurchase() {
  const navigate = useNavigate();
  const location = useLocation();
  const member = location.state?.member; 
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const plans = [
    { 
      id: 1, 
      value: "1-month",
      name: "1 Month Basic", 
      price: 1000, 
      duration: "30 days", 
      durationDays: 30, 
      features: ["Gym Access", "Locker Facility", "Basic Equipment"] 
    },
    { 
      id: 2, 
      value: "3-month",
      name: "3 Months Standard", 
      price: 2500, 
      duration: "90 days", 
      durationDays: 90, 
      features: ["Gym Access", "Locker Facility", "Group Classes", "Nutrition Guide"] 
    },
    { 
      id: 3, 
      value: "6-month",
      name: "6 Months Premium", 
      price: 5000, 
      duration: "180 days", 
      durationDays: 180, 
      features: ["All Standard Features", "Personal Trainer", "Diet Plan", "Body Analysis"] 
    },
    { 
      id: 4, 
      value: "12-month",
      name: "12 Months Elite", 
      price: 9000, 
      duration: "365 days", 
      durationDays: 365, 
      features: ["All Premium Features", "Supplements Discount", "Priority Booking", "Free Guest Pass"] 
    }
  ];

  const membershipStats = {
    "1 Month Basic": 45,
    "3 Months Standard": 89,
    "6 Months Premium": 67,
    "12 Months Elite": 34
  };

  const handlePurchase = (plan) => {
    console.log("Purchasing plan:", plan);
    console.log("For member:", member);
    
  
    setSelectedPlan(plan);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/members');
    }, 2000);
  };

  const handleBackToMembers = () => {
    navigate('/members');
  };

  return (
    <div className="membership-purchase-container">
   
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Fit Nexus</h1>
          <div className="admin-info">
            <div className="admin-avatar">
              <img src="/assets/admin-avatar.jpg" alt="Admin" />
            </div>
            <div className="admin-text">
              <p className="admin-greeting">Good Evening 👋</p>
              <p className="admin-name">admin</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate('/dashboard')}>
            <i className="fas fa-home"></i>
            <span>Dashboard</span>
          </button>
          <button className="nav-item active">
            <i className="fas fa-users"></i>
            <span>Members</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/equipment')}>
            <i className="fas fa-dumbbell"></i>
            <span>Gym Equipment</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/announcements')}>
            <i className="fas fa-bullhorn"></i>
            <span>Announcements</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/staff-list')}>
            <i className="fas fa-user-tie"></i>
            <span>Staff Management</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/')}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </nav>
      </div>

        <div className="main-content">
        <div className="membership-page">
   
          <div className="membership-header">
            <button className="back-btn" onClick={handleBackToMembers}>
              <i className="fas fa-arrow-left"></i> Back to Members
            </button>
          </div>

          {member && (
            <div className="member-info-card">
              <div className="member-info-content">
                <div className="member-info-left">
                  <img src={member.img} alt={member.name} className="member-info-avatar" />
                </div>
                <div className="member-info-right">
                  <h3>{member.name}</h3>
                  <p><i className="fas fa-phone"></i> {member.phone}</p>
                  <p><i className="fas fa-map-marker-alt"></i> {member.address}</p>
                  <p><i className="fas fa-calendar"></i> Current Expiry: {member.nextBill}</p>
                </div>
              </div>
            </div>
          )}

     
          <div className="page-title">
            <h2>Membership Plans</h2>
            <p>Choose the plan that fits your goals</p>
          </div>

          {showSuccess && (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              Successfully purchased {selectedPlan?.name}! Redirecting...
            </div>
          )}

          <div className="plans-grid">
            {plans.map((plan, index) => {
              const meta = planMeta[index];
              const isHovered = hoveredId === plan.id;
              
              return (
                <div
                  key={plan.id}
                  className={`plan-card ${isHovered ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredId(plan.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    background: cardGradients[index],
                    transform: isHovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
                    boxShadow: isHovered
                      ? "0 20px 48px rgba(0,0,0,0.35)"
                      : "0 8px 24px rgba(0,0,0,0.2)",
                  }}
                >
                   <div className="decorative-circle circle-top-right" />
                  <div className="decorative-circle circle-bottom-left" />

                  <div className="plan-content">
                 
                    <span 
                      className="plan-badge" 
                      style={{ backgroundColor: meta.badgeColor }}
                    >
                      {meta.badge}
                    </span>

                 
                    <div className="plan-icon">
                      <i className={`fas ${meta.icon}`}></i>
                    </div>
                    <h3 className="plan-name">{plan.name}</h3>
                    <p className="plan-duration">{plan.duration}</p>

                    <div className="plan-price">
                      <span className="price-amount">₹{plan.price}</span>
                      <span className="price-period">/ plan</span>
                    </div>

            
                    <div className="plan-features">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="feature-item">
                          <span className="feature-icon">
                            <i className="fas fa-check"></i>
                          </span>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <p className="enrollment-count">
                      <i className="fas fa-users"></i>
                      {membershipStats[plan.name] || 0} members enrolled
                    </p>

                  
                    <button
                      className="purchase-btn"
                      onClick={() => handlePurchase(plan)}
                      style={{
                        background: isHovered ? "white" : "rgba(255,255,255,0.15)",
                        color: isHovered ? "#3e0994" : "white",
                      }}
                    >
                      <i className="fas fa-shopping-cart"></i>
                      Purchase Now
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