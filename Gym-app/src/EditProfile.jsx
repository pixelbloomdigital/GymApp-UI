import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import './EditProfile.css';
const USERS_API = "http://localhost:3001/users";
const MEMBERSHIP_API = "http://localhost:3001/memberships";

const EditProfile = () => {
  // Add dietPlan state
   const { memberId } = useParams();
   const [member, setMember] = useState(null);
  const [optedForDietPlan, setOptedForDietPlan] = useState(false);
 useEffect(() => {
  const fetchMember = async () => {
    try {
      // 1️⃣ Fetch user
      const res = await fetch(`${USERS_API}/${memberId}`);
      const user = await res.json();

      // 2️⃣ Fetch memberships
      const mRes = await fetch(MEMBERSHIP_API);
      const memberships = await mRes.json();

      const plan = memberships.find(m => m.id === user.membershipId);

      // 3️⃣ Set profile properly (NO merging with old state)
      setMemberProfile({
        ...user,
        phone: user.contact || ""
      });

      setMembershipName(plan ? plan.name : "No Plan");
      setOptedForDietPlan(user.dietPlanOpted || false);

    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  if (memberId) fetchMember();
}, [memberId]);

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
 

  const [toast, setToast] = useState({ visible: false, message: '' });
  const showToast = (message, ms = 3000) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), ms);
  };

  // Updated total steps - dynamic based on diet plan
  const totalSteps = optedForDietPlan ? 4 : 3;

  useEffect(() => {
    if (showResetPassword) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showResetPassword]);

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Updated nextStep logic
  const nextStep = () => {
    // On step 3, check diet plan selection before proceeding
    if (currentStep === 3 && !memberProfile.fitnessGoal) {
      showToast('Please select a fitness goal first');
      return;
    }
    
    if (currentStep === 3) {
  if (optedForDietPlan) setCurrentStep(4);
  else setCurrentStep(3 + 1); // save directly
  return;
}

    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      // Reset diet plan if going back from step 4
      if (currentStep === 4) {
        setOptedForDietPlan(false);
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
  setIsLoading(true);

  const updatedData = {
    ...memberProfile,
    contact: memberProfile.phone,
    dietPlanOpted: optedForDietPlan
  };

  delete updatedData.phone; // prevent duplicate field

  try {
    await fetch(`${USERS_API}/${memberId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });

    showToast("Profile updated successfully!");
  } catch (err) {
    console.error("Update error:", err);
  }

  setIsLoading(false);
};


  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMemberProfile({ ...memberProfile, photo: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordReset = () => {
    setShowResetPassword(false);
    showToast('Password reset link sent to your email!');
  };

  // Updated renderStepContent with diet question in step 3 and new step 4
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-grid">
            <div>
              <div className="form-field">
                <label className="form-label">Full Name</label>
                <input 
                  className="form-input" 
                  value={memberProfile.name} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, name: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-field">
                <label className="form-label">Date of Birth</label>
                <input 
                  className="form-input" 
                  type="date" 
                  value={memberProfile.dob} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, dob: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-field">
                <label className="form-label">Gender</label>
                <select 
                  className="form-select" 
                  value={memberProfile.gender} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, gender: e.target.value })} 
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <div className="form-field">
                <label className="form-label">Phone Number</label>
                <input 
                  className="form-input" 
                  type="tel" 
                  value={memberProfile.phone} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, phone: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-field">
                <label className="form-label">Email ID</label>
                <input 
                  className="form-input" 
                  type="email" 
                  value={memberProfile.email} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, email: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-field">
                <label className="form-label">Address</label>
                <input 
                  className="form-input" 
                  value={memberProfile.address} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, address: e.target.value })} 
                  required 
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-grid">
            <div className="full-width">
              <div className="form-field">
                <label className="form-label">Emergency Contact Name</label>
                <input 
                  className="form-input" 
                  value={memberProfile.emergencyName} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, emergencyName: e.target.value })} 
                />
              </div>
              <div className="form-field">
                <label className="form-label">Emergency Contact Number</label>
                <input 
                  className="form-input" 
                  type="tel" 
                  value={memberProfile.emergencyPhone} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, emergencyPhone: e.target.value })} 
                />
              </div>
            </div>
            <div>
              <div className="form-field">
                <label className="form-label">Medical Conditions</label>
                <textarea 
                  className="form-textarea" 
                  value={memberProfile.medicalConditions} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, medicalConditions: e.target.value })} 
                  placeholder="BP, diabetes, asthma, heart issues, etc." 
                />
              </div>
              <div className="form-field">
                <label className="form-label">Previous Injuries</label>
                <textarea 
                  className="form-textarea" 
                  value={memberProfile.previousInjuries} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, previousInjuries: e.target.value })} 
                  placeholder="Back, knee, shoulder injuries etc." 
                />
              </div>
            </div>
            <div>
              <div className="form-field">
                <label className="form-label">Current Medications</label>
                <textarea 
                  className="form-textarea" 
                  value={memberProfile.currentMedications} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, currentMedications: e.target.value })} 
                  placeholder="List any medications you're taking" 
                />
              </div>
              <div className="form-field">
                <label className="form-label">Allergies</label>
                <textarea 
                  className="form-textarea" 
                  value={memberProfile.allergies} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, allergies: e.target.value })} 
                  placeholder="Food, medication, or other allergies" 
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-grid">
            <div>
              <div className="form-field">
                <label className="form-label">Height (cm)</label>
                <input 
                  className="form-input" 
                  type="number" 
                  value={memberProfile.height} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, height: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-field">
                <label className="form-label">Weight (kg)</label>
                <input 
                  className="form-input" 
                  type="number" 
                  value={memberProfile.weight} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, weight: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-field">
                <label className="form-label">Body Fat % (optional)</label>
                <input 
                  className="form-input" 
                  type="number" 
                  step="0.1" 
                  value={memberProfile.bodyFat} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, bodyFat: e.target.value })} 
                />
              </div>
            </div>
            <div>
              <div className="form-field">
                <label className="form-label">Fitness Goal</label>
                <select 
                  className="form-select" 
                  value={memberProfile.fitnessGoal} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, fitnessGoal: e.target.value })} 
                  required
                >
                  <option value="">Select Goal</option>
                  <option value="Weight loss">Weight loss</option>
                  <option value="Muscle gain">Muscle gain</option>
                  <option value="Strength">Strength</option>
                  <option value="General fitness">General fitness</option>
                  <option value="Competition prep">Competition prep</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Gym Experience</label>
                <select 
                  className="form-select" 
                  value={memberProfile.gymExperience} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, gymExperience: e.target.value })} 
                  required
                >
                  <option value="">Select Experience</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              {/* NEW DIET PLAN QUESTION */}
              <div className="full-width">
                <div className="form-field">
                  <label className="form-label">Opted for Diet Plan?</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1rem' }}></label>
                      <select 
                      className="form-select"
                      value={optedForDietPlan ? "yes" : "no"}
                      onChange={(e) => setOptedForDietPlan(e.target.value === 'yes')}
                      required>
                        <option value="no">No, I don't need diet plan</option>
                        <option value="yes">Yes, I want a diet plan</option>
                      </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-grid">
            <div>
              <div className="form-field">
                <label className="form-label">Diet Preference</label>
                <select 
                  className="form-select" 
                  value={memberProfile.dietPreference} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, dietPreference: e.target.value })}
                >
                  <option value="">Select Preference</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Keto">Keto</option>
                  <option value="High Protein">High Protein</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Dietary Restrictions</label>
                <textarea 
                  className="form-textarea" 
                  value={memberProfile.dietaryRestrictions} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, dietaryRestrictions: e.target.value })}
                  placeholder="Nuts, dairy, gluten, etc."
                />
              </div>
            </div>
            <div>
              <div className="form-field">
                <label className="form-label">Preferred Meal Times</label>
                <textarea 
                  className="form-textarea" 
                  value={memberProfile.preferredMealTimes} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, preferredMealTimes: e.target.value })}
                  placeholder="Breakfast: 8 AM, Lunch: 1 PM, Dinner: 8 PM etc."
                />
              </div>
              <div className="form-field full-width">
                <label className="form-label">Additional Diet Notes</label>
                <textarea 
                  className="form-textarea" 
                  value={memberProfile.allergies} 
                  onChange={(e) => setMemberProfile({ ...memberProfile, allergies: e.target.value })}
                  placeholder="Any other dietary preferences or requirements"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Video Background */}
      <div className="video-container">
        <video autoPlay loop muted playsInline preload="auto">
          <source src="/videos/gym-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="video-overlay"></div>

      {/* Main Container */}
      <div className="members-container edit-profile-container">
        {/* Fixed Sidebar */}
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="admin-info">
              <div className="admin-avatar">👤</div>
              <div className="admin-text">
                <p className="admin-greeting">Edit Profile</p>
                <p className="admin-name">{memberProfile.name}</p>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button className="nav-item" onClick={() => navigate(`/member-dashboard/${memberId || 1}`)}>
              📊 Dashboard
            </button>
            <button className="nav-item active">
              ✏️ Edit Profile
            </button>
            <button className="nav-item">
              📋 Membership
            </button>
            <button className="nav-item">
              📈 Progress
            </button>
            <button className="nav-item">
              💰 Payments
            </button>
          </nav>
        </div>

        {/* Mobile Menu Toggle */}
        {!sidebarOpen && (
          <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
        )}

        {/* Main Content */}
        <div className="main-content">
          {/* Top Navigation */}
          <div className="members-header-section">
            <div className="top-nav">
              <button className="back-dashboard-btn" onClick={() => navigate(`/member-dashboard/${memberId || 1}`)}>
                ← Back to Dashboard
              </button>
              <div className="nav-buttons">
                <button className="nav-button">Settings</button>
                <button className="nav-button logout-btn" onClick={() => navigate('/')}>Logout</button>
              </div>
            </div>
          </div>

          {/* Profile Header Card */}
          <div className="member-detail-card profile-header-card">
            <div className="member-detail-left">
              <div className="member-image-container">
                <div 
                  className={`member-detail-img ${memberProfile.photo ? 'has-photo' : ''}`}
                  style={memberProfile.photo ? { backgroundImage: `url(${memberProfile.photo})` } : {}}
                >
                  {!memberProfile.photo && '👨‍💪'}
                </div>
                <label htmlFor="photo-upload" className="photo-upload-btn">📷</label>
                <input id="photo-upload" type="file" className="photo-input" accept="image/*" onChange={handlePhotoUpload} />
              </div>
            </div>
            <div className="member-detail-right">
              <div className="detail-info">
                <h1 className="profile-name">{memberProfile.name}</h1>
                <div className="profile-info-row">
                  <div className="profile-info-item">
                    <span className="membership-badge">{membershipName}</span>

                  </div>
                  <div className="profile-info-item status-badge">
                    {memberProfile.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                  </div>
                  <div className="profile-info-item">
                    {calculateAge(memberProfile.dob)} years old
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="detail-view">
            <div className="form-section">
              <h3 className="section-title">
                {currentStep === 1 && "Step 1: Basic Personal Details"}
                {currentStep === 2 && "Step 2: Health & Medical Information"}
                {currentStep === 3 && "Step 3: Fitness Details"}
                {currentStep === 4 && "Step 4: Diet Plan Details"}
              </h3>

              {/* Updated Stepper - Dynamic */}
              <div className="stepper">
                {[1, 2, 3, ...(optedForDietPlan ? [4] : [])].map((step) => (
                  <div key={step} className={`step-item ${currentStep >= step ? 'active' : ''}`}>
                    <div className="step-number">{step}</div>
                    <span>{['Personal', 'Health', 'Fitness', 'Diet'][step-1]}</span>
                  </div>
                ))}
              </div>

              {renderStepContent()}

              {/* Step Buttons */}
              <div className="step-buttons">
                <button 
                  type="button" 
                  className="back-btn"
                  onClick={currentStep === 1 ? () => window.history.back() : prevStep}
                  disabled={isLoading}
                >
                  {currentStep === 1 ? 'Cancel' : 'Previous'}
                </button>

                <button 
                  type="button" 
                  className="reset-password-btn"
                  onClick={() => setShowResetPassword(true)}
                  disabled={isLoading}
                >
                  🔐 Reset Password
                </button>

                {currentStep < totalSteps && (
                  <button 
                    type="button"
                    className="next-btn"
                    onClick={nextStep}
                    disabled={isLoading}
                  >
                    Next Step →
                  </button>
                )}
                {currentStep === totalSteps && (
                  <button
                    type="button"
                    className={`save-btn ${isLoading ? 'loading' : ''}`}
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner"></span>
                        Saving...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Reset Password</h3>
              <button className="close-button" onClick={() => setShowResetPassword(false)}>✕</button>
            </div>
            <div className="modal-description">
              A password reset link will be sent to <strong>{memberProfile.email}</strong>. 
              This link will expire in 1 hour.
            </div>
            <div className="modal-actions">
              <button className="renew-btn" onClick={handlePasswordReset}>
                Send Reset Link
              </button>
              <button className="save-btn secondary" onClick={() => setShowResetPassword(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <div className="toast-container">
          <div className="toast">
            <span className="toast-icon">✅</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfile;
