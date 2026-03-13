import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import './EditProfile.css';

const USERS_API = "http://localhost:3001/users";
const MEMBERSHIP_API = "http://localhost:3001/memberships";

const EditProfile = () => {
  const { memberId } = useParams();
  const [optedForDietPlan, setOptedForDietPlan] = useState(false);
  const [membershipName, setMembershipName] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [memberProfile, setMemberProfile] = useState({});
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const stored = localStorage.getItem('sidebarOpen');
      return stored === null ? true : JSON.parse(stored);
    } catch (e) {
      return true;
    }
  });

  const navigate = useNavigate();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success', ms = 3000) => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), ms);
  };

  const totalSteps = optedForDietPlan ? 6 : 3;

  useEffect(() => {
    document.body.style.overflow = showResetPassword ? "hidden" : "auto";
  }, [showResetPassword]);

  const calculateAge = (dob) => {
    if (!dob) return "—";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const generatePersonalizedDiet = () => {
    const { fitnessGoal, dietPreference, dietTarget } = memberProfile;
    const dietPlans = {
      "Weight loss": {
        "Vegetarian":     "🥗 VEG WEIGHT LOSS PLAN - 5 months\n\n• Calories: 1600-1800 kcal/day\n• Macros: 120g protein, 150g carbs, 60g fat\n• Key Foods: Paneer, tofu, lentils, Greek yogurt, oats\n• Weekly: 1 cheat meal (Sat/Sun)\n• Training: HIIT + strength 5x/week\n• Expected: 20-25kg loss\n\nTimeline: " + (dietTarget || "5 months"),
        "Non-Vegetarian": "🍗 NON-VEG WEIGHT LOSS PLAN - 5 months\n\n• Calories: 1600-1800 kcal/day\n• Macros: 130g protein, 140g carbs, 55g fat\n• Key Foods: Chicken breast, fish, egg whites, whey\n• Weekly: 1 cheat meal\n• Training: HIIT + weights\n• Expected: 22-28kg loss\n\nTimeline: " + (dietTarget || "5 months"),
        "Vegan":          "🌱 VEGAN WEIGHT LOSS PLAN - 5 months\n\n• Calories: 1500-1700 kcal/day\n• Macros: 110g protein, 160g carbs, 50g fat\n• Key Foods: Tofu, tempeh, seitan, pea protein\n• Focus: High volume, low calorie foods\n• Expected: 18-24kg loss\n\nTimeline: " + (dietTarget || "5 months"),
      },
      "Muscle gain": {
        "Vegetarian":     "🥛 VEG MUSCLE GAIN PLAN - 3 months\n\n• Calories: 2800-3200 kcal/day\n• Macros: 160g protein, 350g carbs, 90g fat\n• Key Foods: Full fat paneer, Greek yogurt, nuts, milk\n• Training: Progressive overload 5x/week\n• Supplements: Creatine 5g daily\n• Expected: 8-12kg gain\n\nTimeline: " + (dietTarget || "3 months"),
        "Non-Vegetarian": "🥩 NON-VEG MUSCLE GAIN PLAN - 3 months\n\n• Calories: 3000-3500 kcal/day\n• Macros: 180g protein, 380g carbs, 95g fat\n• Key Foods: Chicken, eggs, salmon, whey protein\n• Training: Heavy lifting 5-6x/week\n• Expected: 10-15kg gain\n\nTimeline: " + (dietTarget || "3 months"),
        "Vegan":          "🫘 VEGAN MUSCLE GAIN PLAN - 3 months\n\n• Calories: 2900-3300 kcal/day\n• Macros: 170g protein, 360g carbs, 85g fat\n• Key Foods: Soy protein, peanut butter, quinoa\n• Supplements: Vegan protein + creatine\n• Expected: 9-13kg gain\n\nTimeline: " + (dietTarget || "3 months"),
      },
      "Strength": {
        "Vegetarian":     "⚙️ VEG STRENGTH PLAN - 6 months\n\n• Calories: 3200-3600 kcal/day\n• Macros: 180g protein, 400g carbs, 100g fat\n• Key Foods: Paneer, eggs, dairy, nuts, complex carbs\n• Training: Powerlifting 4x/week + mobility\n• Focus: 1RM progression (squat, bench, deadlift)\n• Expected: 15-20% strength increase\n\nTimeline: " + (dietTarget || "6 months"),
        "Non-Vegetarian": "🔧 NON-VEG STRENGTH PLAN - 6 months\n\n• Calories: 3400-3800 kcal/day\n• Macros: 200g protein, 420g carbs, 110g fat\n• Key Foods: Red meat, eggs, salmon, oats\n• Training: 5/3/1 powerlifting program\n• Supplements: Creatine + beta-alanine\n• Expected: 20-25% strength increase\n\nTimeline: " + (dietTarget || "6 months"),
        "Vegan":          "💪 VEGAN STRENGTH PLAN - 6 months\n\n• Calories: 3300-3700 kcal/day\n• Macros: 190g protein, 410g carbs, 105g fat\n• Key Foods: Seitan, tempeh, lentils, rice\n• Training: Heavy compound lifts 4x/week\n• Supplements: Pea protein + creatine\n• Expected: 18-22% strength increase\n\nTimeline: " + (dietTarget || "6 months"),
      },
      "General fitness": {
        "Vegetarian":     "🏃 VEG GENERAL FITNESS PLAN - 3 months\n\n• Calories: 2400-2800 kcal/day\n• Macros: 140g protein, 300g carbs, 80g fat\n• Key Foods: Balanced veg diet + variety\n• Training: 4x/week mixed cardio + weights\n• Focus: Body recomp + endurance\n• Expected: Improved fitness + 2-5kg change\n\nTimeline: " + (dietTarget || "3 months"),
        "Non-Vegetarian": "🚴 NON-VEG GENERAL FITNESS PLAN - 3 months\n\n• Calories: 2600-3000 kcal/day\n• Macros: 160g protein, 320g carbs, 85g fat\n• Key Foods: Lean meats + balanced carbs\n• Training: Circuit training + cardio\n• Expected: All-round fitness improvement\n\nTimeline: " + (dietTarget || "3 months"),
        "Vegan":          "🌿 VEGAN GENERAL FITNESS PLAN - 3 months\n\n• Calories: 2500-2900 kcal/day\n• Macros: 150g protein, 310g carbs, 82g fat\n• Key Foods: Plant proteins + whole grains\n• Training: Functional fitness + yoga\n• Expected: Balanced fitness gains\n\nTimeline: " + (dietTarget || "3 months"),
      },
    };
    return dietPlans[fitnessGoal]?.[dietPreference] ||
      "Please complete diet preference and target selection to generate your personalized plan.";
  };

  const nextStep = () => {
    if (currentStep === 3 && !memberProfile.fitnessGoal) { showToast('Please select a fitness goal first', 'error'); return; }
    if (currentStep === 3) { setCurrentStep(optedForDietPlan ? 4 : totalSteps); return; }
    if (currentStep === 4 && !memberProfile.dietPreference) { showToast('Please select diet preference', 'error'); return; }
    if (currentStep === 5 && !memberProfile.dietTarget) { showToast('Please select your specific target', 'error'); return; }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleSave = async () => {
    setIsLoading(true);
    const updatedData = { ...memberProfile, contact: memberProfile.phone || memberProfile.contact, dietPlanOpted: optedForDietPlan };
    delete updatedData.phone;
    try {
      const response = await fetch(`${USERS_API}/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (response.ok) {
        showToast("Profile saved successfully!", 'success');
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      console.error("Update error:", err);
      showToast("Failed to update profile. Please try again.", 'error');
    }
    setIsLoading(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setMemberProfile({ ...memberProfile, photo: ev.target.result });
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordReset = () => {
    setShowResetPassword(false);
    showToast('Password reset link sent to your email!', 'success');
  };

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await fetch(`${USERS_API}/${memberId}`);
        const user = await res.json();
        const mRes = await fetch(MEMBERSHIP_API);
        const memberships = await mRes.json();
        const plan = memberships.find(m => m.id === user.membershipId);
        setMemberProfile({ ...user, phone: user.contact || user.phone || "" });
        setMembershipName(plan ? plan.name : "No Plan");
        setOptedForDietPlan(user.dietPlanOpted || false);
      } catch (err) {
        console.error("Error:", err);
      }
    };
    if (memberId) fetchMember();
  }, [memberId]);

  /* ─── STEP LABELS ─── */
  const allSteps = optedForDietPlan
    ? [1, 2, 3, 4, 5, 6]
    : [1, 2, 3];
  const stepLabels = ['Personal', 'Health', 'Fitness', 'Diet Type', 'Target', 'Diet Plan'];
  const stepTitles = ['Personal Details', 'Health Info', 'Fitness Details', 'Diet Preference', 'Specific Target', 'Your Diet Plan'];

  /* ─── STEP CONTENT ─── */
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-grid form-grid-2">
            <div className="form-field">
              <label className="form-label">Full Name *</label>
              <input value={memberProfile.name || ''} onChange={e => setMemberProfile({ ...memberProfile, name: e.target.value })} className="form-input" placeholder="Enter full name" />
            </div>
            <div className="form-field">
              <label className="form-label">Date of Birth *</label>
              <input type="date" value={memberProfile.dob || ''} onChange={e => setMemberProfile({ ...memberProfile, dob: e.target.value })} className="form-input" />
            </div>
            <div className="form-field">
              <label className="form-label">Gender *</label>
              <select value={memberProfile.gender || ''} onChange={e => setMemberProfile({ ...memberProfile, gender: e.target.value })} className="form-select">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Phone *</label>
              <input type="tel" value={memberProfile.phone || ''} onChange={e => setMemberProfile({ ...memberProfile, phone: e.target.value })} className="form-input" placeholder="+91 00000 00000" />
            </div>
            <div className="form-field">
              <label className="form-label">Email *</label>
              <input type="email" value={memberProfile.email || ''} onChange={e => setMemberProfile({ ...memberProfile, email: e.target.value })} className="form-input" placeholder="email@example.com" />
            </div>
            <div className="form-field">
              <label className="form-label">Address *</label>
              <input value={memberProfile.address || ''} onChange={e => setMemberProfile({ ...memberProfile, address: e.target.value })} className="form-input" placeholder="City, State" />
            </div>
          </div>
        );

      case 2:
        return (
          <>
            <p className="form-section-label">Emergency Contact</p>
            <div className="form-grid form-grid-2" style={{ marginBottom: '1.2rem' }}>
              <div className="form-field">
                <label className="form-label">Contact Name</label>
                <input value={memberProfile.emergencyName || ''} onChange={e => setMemberProfile({ ...memberProfile, emergencyName: e.target.value })} className="form-input" placeholder="Contact person name" />
              </div>
              <div className="form-field">
                <label className="form-label">Contact Phone</label>
                <input type="tel" value={memberProfile.emergencyPhone || ''} onChange={e => setMemberProfile({ ...memberProfile, emergencyPhone: e.target.value })} className="form-input" placeholder="+91 00000 00000" />
              </div>
            </div>
            <p className="form-section-label">Medical Information</p>
            <div className="form-grid form-grid-2">
              <div className="form-field">
                <label className="form-label">Medical Conditions</label>
                <textarea value={memberProfile.medicalConditions || ''} onChange={e => setMemberProfile({ ...memberProfile, medicalConditions: e.target.value })} className="form-textarea" rows="3" placeholder="Any known conditions..." />
              </div>
              <div className="form-field">
                <label className="form-label">Previous Injuries</label>
                <textarea value={memberProfile.previousInjuries || ''} onChange={e => setMemberProfile({ ...memberProfile, previousInjuries: e.target.value })} className="form-textarea" rows="3" placeholder="List any injuries..." />
              </div>
              <div className="form-field">
                <label className="form-label">Current Medications</label>
                <textarea value={memberProfile.currentMedications || ''} onChange={e => setMemberProfile({ ...memberProfile, currentMedications: e.target.value })} className="form-textarea" rows="3" placeholder="Medications, dosage..." />
              </div>
              <div className="form-field">
                <label className="form-label">Allergies</label>
                <textarea value={memberProfile.allergies || ''} onChange={e => setMemberProfile({ ...memberProfile, allergies: e.target.value })} className="form-textarea" rows="3" placeholder="Food/drug allergies..." />
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <div className="form-grid form-grid-2">
            <div className="form-field">
              <label className="form-label">Height (cm) *</label>
              <input type="number" value={memberProfile.height || ''} onChange={e => setMemberProfile({ ...memberProfile, height: e.target.value })} className="form-input" placeholder="e.g. 175" />
            </div>
            <div className="form-field">
              <label className="form-label">Weight (kg) *</label>
              <input type="number" value={memberProfile.weight || ''} onChange={e => setMemberProfile({ ...memberProfile, weight: e.target.value })} className="form-input" placeholder="e.g. 78" />
            </div>
            <div className="form-field">
              <label className="form-label">Body Fat %</label>
              <input type="number" step="0.1" value={memberProfile.bodyFat || ''} onChange={e => setMemberProfile({ ...memberProfile, bodyFat: e.target.value })} className="form-input" placeholder="e.g. 18" />
            </div>
            <div className="form-field">
              <label className="form-label">Fitness Goal *</label>
              <select value={memberProfile.fitnessGoal || ''} onChange={e => setMemberProfile({ ...memberProfile, fitnessGoal: e.target.value })} className="form-select">
                <option value="">Select Goal</option>
                <option value="Weight loss">Weight Loss</option>
                <option value="Muscle gain">Muscle Gain</option>
                <option value="Strength">Strength</option>
                <option value="General fitness">General Fitness</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Gym Experience *</label>
              <select value={memberProfile.gymExperience || ''} onChange={e => setMemberProfile({ ...memberProfile, gymExperience: e.target.value })} className="form-select">
                <option value="">Select Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Want a Diet Plan?</label>
              <select value={optedForDietPlan ? "yes" : "no"} onChange={e => setOptedForDietPlan(e.target.value === 'yes')} className="form-select">
                <option value="no">No, skip diet plan</option>
                <option value="yes">Yes, create diet plan</option>
              </select>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <p className="form-section-label">Choose Diet Preference</p>
            <div className="diet-options-grid">
              {[
                { key: 'Vegetarian', label: 'Vegetarian', desc: 'Paneer, tofu, lentils, dairy, eggs' },
                { key: 'Non-Vegetarian', label: 'Non-Vegetarian', desc: 'Chicken, fish, eggs, lean meats' },
                { key: 'Vegan', label: 'Vegan', desc: 'No animal products — plant-based only' },
              ].map(opt => (
                <div
                  key={opt.key}
                  className={`diet-option-card ${memberProfile.dietPreference === opt.key ? 'selected' : ''}`}
                  onClick={() => setMemberProfile({ ...memberProfile, dietPreference: opt.key })}
                >
                  <p className="diet-card-title">{opt.label}</p>
                  <p className="diet-card-desc">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 5: {
        const goal = memberProfile.fitnessGoal;
        const targetOptions =
          goal === 'Weight loss'
            ? [{ key: 'Weight loss 5 months', label: 'Weight Loss (5 months)', sub: '10–15 kg loss • Aggressive fat burn' },
               { key: 'Weight loss 3 months', label: 'Weight Loss (3 months)', sub: '5–10 kg loss • Fast track' }]
            : goal === 'Muscle gain'
            ? [{ key: 'Muscle gain 3 months', label: 'Muscle Gain (3 months)', sub: '5–10 kg gain • Bulk phase' },
               { key: 'Muscle gain 6 months', label: 'Muscle Gain (6 months)', sub: '10–15 kg gain • Long term bulk' }]
            : [{ key: 'Strength 3 months', label: `${goal} (3 months)`, sub: 'Performance focused' },
               { key: 'Strength 6 months', label: `${goal} (6 months)`, sub: 'Sustainable progress' }];

        return (
          <div>
            <p className="form-section-label">Your Specific Target — Based on "{goal}" goal</p>
            <div className="diet-options-grid">
              {targetOptions.map(opt => (
                <div
                  key={opt.key}
                  className={`diet-option-card ${memberProfile.dietTarget === opt.key ? 'selected' : ''}`}
                  onClick={() => setMemberProfile({ ...memberProfile, dietTarget: opt.key })}
                >
                  <p className="diet-card-title">{opt.label}</p>
                  <p className="diet-card-desc">{opt.sub}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 6:
        return (
          <div className="plan-display-card">
            <div className="plan-display-header">
              <h5>{memberProfile.dietPreference} • {memberProfile.fitnessGoal}</h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', margin: 0 }}>Target: {memberProfile.dietTarget}</p>
            </div>
            <div className="plan-display-body">
              <div className="plan-details-box">
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.88rem', lineHeight: '1.7', margin: 0 }}>
                  {generatePersonalizedDiet()}
                </pre>
              </div>
              <div className="plan-footer-note">
                Our nutritionist will refine this plan and send detailed meal schedules to your email within 24 hours.
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /* ─── COMPUTED STATS ─── */
  const age = calculateAge(memberProfile.dob);
  const bmi = memberProfile.height && memberProfile.weight
    ? ((memberProfile.weight / ((memberProfile.height / 100) ** 2)).toFixed(1))
    : "—";

  /* ─── RENDER ─── */
  return (
    <>
      {/* Video BG */}
      <div className="video-container">
        <video autoPlay loop muted playsInline preload="auto">
          <source src="/videos/gym-video.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="video-overlay" />

      <div className="members-container">

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="admin-info">
              <div className="admin-avatar">
                {memberProfile.photo
                  ? <img src={memberProfile.photo} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : (memberProfile.name ? memberProfile.name.charAt(0).toUpperCase() : 'M')}
              </div>
              <div className="admin-details">
                <p className="admin-name">{memberProfile.name || 'Member'}</p>
                <p className="admin-role">{membershipName}</p>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <p className="nav-section-label">Navigation</p>
            <button className="nav-item" onClick={() => navigate(`/member-dashboard/${memberId}`)}>
              <span className="nav-icon">📊</span>
              <span className="nav-label">Dashboard</span>
            </button>
            <button className="nav-item active">
              <span className="nav-icon">✏️</span>
              <span className="nav-label">Edit Profile</span>
            </button>
            <button className="nav-item">
              <span className="nav-icon">📋</span>
              <span className="nav-label">Membership</span>
            </button>
            <button className="nav-item">
              <span className="nav-icon">📈</span>
              <span className="nav-label">Progress</span>
            </button>
            <button className="nav-item">
              <span className="nav-icon">💰</span>
              <span className="nav-label">Payments</span>
            </button>
            <button className="nav-item">
              <span className="nav-icon">🏋️</span>
              <span className="nav-label">Workouts</span>
            </button>
            <button className="nav-item">
              <span className="nav-icon">🥗</span>
              <span className="nav-label">Diet Plans</span>
            </button>
            <button className="nav-item">
              <span className="nav-icon">⚙️</span>
              <span className="nav-label">Settings</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <button className="logout-btn" onClick={() => navigate('/')}>
              <span>🚪</span> Logout
            </button>
          </div>
        </aside>

        {/* Mobile toggle */}
        {!sidebarOpen && (
          <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(true)}>☰</button>
        )}

        {/* ── MAIN CONTENT ── */}
        <div className="main-content">

          {/* Top bar */}
          <div className="top-bar">
            <div className="breadcrumb">
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-gray)', fontSize: '0.82rem', padding: 0 }}
                onClick={() => navigate(`/member-dashboard/${memberId}`)}>
                Dashboard
              </button>
              <span className="breadcrumb-sep">/</span>
              <span className="current">Edit Profile</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className="btn btn-ghost"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                onClick={() => setSidebarOpen(o => !o)}
              >
                ☰ Menu
              </button>
            </div>
          </div>

          <div className="page-wrapper">

            {/* ── PROFILE HEADER ── */}
            <div className="profile-header-card">
              <div className="profile-header-inner">

                {/* Avatar */}
                <div className="member-detail-left">
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <div
                      className={`member-detail-img ${memberProfile.photo ? 'has-photo' : ''}`}
                      style={memberProfile.photo ? { backgroundImage: `url(${memberProfile.photo})` } : {}}
                    >
                      {!memberProfile.photo && (memberProfile.name ? memberProfile.name.charAt(0).toUpperCase() : '?')}
                    </div>
                    <label htmlFor="photo-upload" className="photo-upload-btn" title="Change photo">📷</label>
                    <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  </div>
                  <div className="photo-label">
                    {memberProfile.photo ? 'Photo uploaded' : 'No photo'}
                    <span>Click camera to change</span>
                  </div>
                </div>

                {/* Info */}
                <div className="member-detail-right">
                  <h1 className="profile-name">{memberProfile.name || 'Loading...'}</h1>

                  <div className="profile-meta">
                    <span className="profile-meta-item">✉️ {memberProfile.email || '—'}</span>
                    <span className="meta-separator">•</span>
                    <span className="profile-meta-item">📞 {memberProfile.phone || '—'}</span>
                    <span className="meta-separator">•</span>
                    <span className="profile-meta-item">📍 {memberProfile.address || '—'}</span>
                  </div>

                  <div className="profile-info-row">
                    <span className="membership-badge">🏅 {membershipName}</span>
                    <span className={`status-badge`}>
                      {memberProfile.status === 'active' ? '🟢 Active' : memberProfile.status === 'inactive' ? '🔴 Inactive' : '🟡 Pending'}
                    </span>
                    {age && <span className="age-display">{age} yrs</span>}
                    {memberProfile.fitnessGoal && <span className="goal-badge">🎯 {memberProfile.fitnessGoal}</span>}
                    {memberProfile.gymExperience && <span className="age-display">{memberProfile.gymExperience}</span>}
                  </div>

                  <div className="profile-body-info">
                    {memberProfile.height && <span className="body-info-item">📏 <strong>{memberProfile.height} cm</strong></span>}
                    {memberProfile.weight && <span className="body-info-item">⚖️ <strong>{memberProfile.weight} kg</strong></span>}
                    {memberProfile.bodyFat && <span className="body-info-item">🔥 <strong>{memberProfile.bodyFat}%</strong> body fat</span>}
                  </div>
                </div>

                {/* Quick stats */}
                <div className="profile-quick-stats">
                  <p className="quick-stats-label">Quick Stats</p>
                  <div className="quick-stat-row">
                    <span className="quick-stat-key">BMI</span>
                    <span className="quick-stat-val">{bmi}</span>
                  </div>
                  <div className="quick-stat-row">
                    <span className="quick-stat-key">Body Fat</span>
                    <span className="quick-stat-val orange">{memberProfile.bodyFat ? `${memberProfile.bodyFat}%` : '—'}</span>
                  </div>
                  <div className="quick-stat-row">
                    <span className="quick-stat-key">Experience</span>
                    <span className="quick-stat-val purple" style={{ fontSize: '0.72rem' }}>{memberProfile.gymExperience || '—'}</span>
                  </div>
                  <div className="quick-stat-divider" />
                  <p className="quick-stat-pb-label">Diet Plan</p>
                  <p className="quick-stat-pb-val">{optedForDietPlan ? (memberProfile.dietPreference || 'Selected') : 'Not opted'}</p>
                </div>

              </div>
            </div>

            {/* ── STATS ROW ── */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon-wrap blue">📊</div>
                <div className="stat-info">
                  <p className="stat-label">Current Step</p>
                  <p className="stat-value">{currentStep} <span className="stat-unit">/ {totalSteps}</span></p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrap orange">🔥</div>
                <div className="stat-info">
                  <p className="stat-label">Diet Plan</p>
                  <p className="stat-value" style={{ fontSize: '1rem' }}>{optedForDietPlan ? 'Active' : 'Skipped'}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrap green">📏</div>
                <div className="stat-info">
                  <p className="stat-label">BMI</p>
                  <p className="stat-value">{bmi}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrap purple">🎯</div>
                <div className="stat-info">
                  <p className="stat-label">Goal</p>
                  <p className="stat-value" style={{ fontSize: '0.95rem' }}>{memberProfile.fitnessGoal || '—'}</p>
                </div>
              </div>
            </div>

            {/* ── CONTENT GRID: FORM + RIGHT PANEL ── */}
            <div className="content-grid">

              {/* ── FORM CARD ── */}
              <div className="form-card">
                <div className="form-card-header">
                  <h2 className="form-card-title">
                    <span className="form-card-title-icon">✏️</span>
                    {stepTitles[currentStep - 1]}
                  </h2>
                </div>

                {/* Stepper */}
                <div className="stepper">
                  {allSteps.map((step, idx) => (
                    <React.Fragment key={step}>
                      <div className={`step-item ${currentStep > step ? 'done' : currentStep === step ? 'active' : ''}`}>
                        <div className="step-number">
                          {currentStep > step ? '✓' : step}
                        </div>
                        <span className="step-label">{stepLabels[step - 1]}</span>
                      </div>
                      {idx < allSteps.length - 1 && (
                        <div className={`step-connector ${currentStep > step ? 'done' : ''}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Step Content */}
                <div className="form-body">
                  {renderStepContent()}
                </div>

                {/* Actions */}
                <div className="form-actions">
                  <button
                    className="btn btn-ghost"
                    onClick={currentStep === 1 ? () => window.history.back() : prevStep}
                    disabled={isLoading}
                  >
                    {currentStep === 1 ? 'Cancel' : '← Previous'}
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => setShowResetPassword(true)}
                    disabled={isLoading}
                    style={{ marginRight: 'auto' }}
                  >
                    🔐 Reset Password
                  </button>

                  {currentStep < totalSteps && (
                    <button className="btn btn-primary" onClick={nextStep} disabled={isLoading}>
                      Next →
                    </button>
                  )}

                  {currentStep === totalSteps && (
                    <button className={`btn btn-primary ${isLoading ? 'loading' : ''}`} onClick={handleSave} disabled={isLoading}>
                      {isLoading ? '⏳ Saving...' : '💾 Save Profile'}
                    </button>
                  )}
                </div>
              </div>

              {/* ── RIGHT PANEL ── */}
              <div className="right-panel">

                {/* Membership card */}
                <div className="panel-card">
                  <div className="panel-header">
                    <div className="panel-header-icon">🏅</div>
                    <h3 className="panel-title">Membership</h3>
                  </div>
                  <div className="panel-body">
                    <div className="membership-hero">
                      <p className="membership-hero-label">Current Plan</p>
                      <p className="membership-hero-type">{membershipName}</p>
                      <p className="membership-hero-since">Member ID: {memberId}</p>
                    </div>
                    <div className="membership-counts">
                      <div className="count-box">
                        <p className="count-box-val">{memberProfile.height || '—'}</p>
                        <p className="count-box-label">Height (cm)</p>
                      </div>
                      <div className="count-box">
                        <p className="count-box-val">{memberProfile.weight || '—'}</p>
                        <p className="count-box-label">Weight (kg)</p>
                      </div>
                    </div>
                    <button className="upgrade-btn">Upgrade Plan</button>
                  </div>
                </div>

                {/* Progress card */}
                <div className="panel-card">
                  <div className="panel-header">
                    <div className="panel-header-icon">📈</div>
                    <h3 className="panel-title">Form Progress</h3>
                  </div>
                  <div className="panel-body">
                    {[
                      { label: 'Personal Details', step: 1 },
                      { label: 'Health Info',      step: 2 },
                      { label: 'Fitness Details',  step: 3 },
                      ...(optedForDietPlan
                        ? [{ label: 'Diet Preference', step: 4 },
                           { label: 'Target',          step: 5 },
                           { label: 'Diet Plan',       step: 6 }]
                        : []),
                    ].map(item => {
                      const pct = currentStep > item.step ? 100 : currentStep === item.step ? 50 : 0;
                      return (
                        <div key={item.step} className="progress-item">
                          <div className="progress-meta">
                            <span className="progress-label">{item.label}</span>
                            <span className="progress-pct" style={{ color: pct === 100 ? 'var(--success-green)' : 'var(--accent-blue)' }}>
                              {pct === 100 ? '✓ Done' : pct === 50 ? 'In progress' : 'Pending'}
                            </span>
                          </div>
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'var(--primary-gradient)' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Body Metrics card */}
                <div className="panel-card">
                  <div className="panel-header">
                    <div className="panel-header-icon">⚖️</div>
                    <h3 className="panel-title">Body Metrics</h3>
                  </div>
                  <div className="panel-body">
                    {[
                      { key: 'BMI',        val: bmi,                                          extra: bmi !== '—' && parseFloat(bmi) < 25 ? { label: 'Normal', cls: 'green' } : null },
                      { key: 'Body Fat',   val: memberProfile.bodyFat ? `${memberProfile.bodyFat}%` : '—', extra: null },
                      { key: 'Height',     val: memberProfile.height  ? `${memberProfile.height} cm`  : '—', extra: null },
                      { key: 'Weight',     val: memberProfile.weight  ? `${memberProfile.weight} kg`  : '—', extra: null },
                      { key: 'Age',        val: age !== '—' ? `${age} yrs` : '—',             extra: null },
                      { key: 'Gender',     val: memberProfile.gender  || '—',                 extra: null },
                    ].map(m => (
                      <div key={m.key} className="metric-row">
                        <span className="metric-key">{m.key}</span>
                        <span className="metric-val">
                          {m.val}
                          {m.extra && <span className={`metric-badge ${m.extra.cls}`}>{m.extra.label}</span>}
                        </span>
                      </div>
                    ))}
                    <div className="panel-divider" />
                    {memberProfile.medicalConditions && (
                      <div>
                        <p style={{ fontSize: '0.68rem', color: 'var(--text-gray)', marginBottom: '0.25rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Medical Notes</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dark)', lineHeight: 1.5 }}>{memberProfile.medicalConditions}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RESET PASSWORD MODAL ── */}
      {showResetPassword && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel-card" style={{ width: '100%', maxWidth: '420px', margin: '1rem' }}>
            <div className="panel-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="panel-header-icon">🔐</div>
                <h3 className="panel-title">Reset Password</h3>
              </div>
              <button onClick={() => setShowResetPassword(false)} style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--text-gray)' }}>✕</button>
            </div>
            <div className="panel-body">
              <div className="info-alert">
                <span className="info-alert-icon">ℹ️</span>
                <div>
                  <p className="info-alert-title">Send Reset Link</p>
                  <p className="info-alert-desc">A password reset link will be sent to <strong>{memberProfile.email}</strong></p>
                </div>
              </div>
              <div className="form-actions" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <button className="btn btn-ghost" onClick={() => setShowResetPassword(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handlePasswordReset}>Send Reset Link</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast.visible && (
        <div className="toast-container">
          <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
            <span className="toast-icon">{toast.type === 'error' ? '❌' : '✅'}</span>
            <div className="toast-text">
              <span className="toast-title">{toast.type === 'error' ? 'Error' : 'Success'}</span>
              <span className="toast-msg">{toast.message}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfile;
