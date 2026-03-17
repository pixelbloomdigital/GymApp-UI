import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';

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

  const allSteps = optedForDietPlan ? [1, 2, 3, 4, 5, 6] : [1, 2, 3];
  const stepLabels = ['Personal', 'Health', 'Fitness', 'Diet Type', 'Target', 'Diet Plan'];
  const stepTitles = ['Personal Details', 'Health Info', 'Fitness Details', 'Diet Preference', 'Specific Target', 'Your Diet Plan'];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="ep-form-grid ep-form-grid-2">
            <div className="ep-form-field">
              <label className="ep-form-label">Full Name *</label>
              <input value={memberProfile.name || ''} onChange={e => setMemberProfile({ ...memberProfile, name: e.target.value })} className="ep-form-input" placeholder="Enter full name" />
            </div>
            <div className="ep-form-field">
              <label className="ep-form-label">Date of Birth *</label>
              <input type="date" value={memberProfile.dob || ''} onChange={e => setMemberProfile({ ...memberProfile, dob: e.target.value })} className="ep-form-input" />
            </div>
            <div className="ep-form-field">
              <label className="ep-form-label">Gender *</label>
              <select value={memberProfile.gender || ''} onChange={e => setMemberProfile({ ...memberProfile, gender: e.target.value })} className="ep-form-select">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="ep-form-field">
              <label className="ep-form-label">Phone *</label>
              <input type="tel" value={memberProfile.phone || ''} onChange={e => setMemberProfile({ ...memberProfile, phone: e.target.value })} className="ep-form-input" placeholder="+91 00000 00000" />
            </div>
            <div className="ep-form-field">
              <label className="ep-form-label">Email *</label>
              <input type="email" value={memberProfile.email || ''} onChange={e => setMemberProfile({ ...memberProfile, email: e.target.value })} className="ep-form-input" placeholder="email@example.com" />
            </div>
            <div className="ep-form-field">
              <label className="ep-form-label">Address *</label>
              <input value={memberProfile.address || ''} onChange={e => setMemberProfile({ ...memberProfile, address: e.target.value })} className="ep-form-input" placeholder="City, State" />
            </div>
          </div>
        );

      case 2:
        return (
          <>
            <p className="ep-form-section-label">Emergency Contact</p>
            <div className="ep-form-grid ep-form-grid-2" style={{ marginBottom: '1.2rem' }}>
              <div className="ep-form-field">
                <label className="ep-form-label">Contact Name</label>
                <input value={memberProfile.emergencyName || ''} onChange={e => setMemberProfile({ ...memberProfile, emergencyName: e.target.value })} className="ep-form-input" placeholder="Contact person name" />
              </div>
              <div className="ep-form-field">
                <label className="ep-form-label">Contact Phone</label>
                <input type="tel" value={memberProfile.emergencyPhone || ''} onChange={e => setMemberProfile({ ...memberProfile, emergencyPhone: e.target.value })} className="ep-form-input" placeholder="+91 00000 00000" />
              </div>
            </div>
            <p className="ep-form-section-label">Medical Information</p>
            <div className="ep-form-grid ep-form-grid-2">
              <div className="ep-form-field">
                <label className="ep-form-label">Medical Conditions</label>
                <textarea value={memberProfile.medicalConditions || ''} onChange={e => setMemberProfile({ ...memberProfile, medicalConditions: e.target.value })} className="ep-form-textarea" rows="3" placeholder="Any known conditions..." />
              </div>
              <div className="ep-form-field">
                <label className="ep-form-label">Previous Injuries</label>
                <textarea value={memberProfile.previousInjuries || ''} onChange={e => setMemberProfile({ ...memberProfile, previousInjuries: e.target.value })} className="ep-form-textarea" rows="3" placeholder="List any injuries..." />
              </div>
              <div className="ep-form-field">
                <label className="ep-form-label">Current Medications</label>
                <textarea value={memberProfile.currentMedications || ''} onChange={e => setMemberProfile({ ...memberProfile, currentMedications: e.target.value })} className="ep-form-textarea" rows="3" placeholder="Medications, dosage..." />
              </div>
              <div className="ep-form-field">
                <label className="ep-form-label">Allergies</label>
                <textarea value={memberProfile.allergies || ''} onChange={e => setMemberProfile({ ...memberProfile, allergies: e.target.value })} className="ep-form-textarea" rows="3" placeholder="Food/drug allergies..." />
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <div className="ep-form-grid ep-form-grid-2">
            <div className="ep-form-field">
              <label className="ep-form-label">Height (cm) *</label>
              <input type="number" value={memberProfile.height || ''} onChange={e => setMemberProfile({ ...memberProfile, height: e.target.value })} className="ep-form-input" placeholder="e.g. 175" />
            </div>
            <div className="ep-form-field">
              <label className="ep-form-label">Weight (kg) *</label>
              <input type="number" value={memberProfile.weight || ''} onChange={e => setMemberProfile({ ...memberProfile, weight: e.target.value })} className="ep-form-input" placeholder="e.g. 78" />
            </div>
            <div className="ep-form-field">
              <label className="ep-form-label">Body Fat %</label>
              <input type="number" step="0.1" value={memberProfile.bodyFat || ''} onChange={e => setMemberProfile({ ...memberProfile, bodyFat: e.target.value })} className="ep-form-input" placeholder="e.g. 18" />
            </div>
            <div className="ep-form-field">
              <label className="ep-form-label">Fitness Goal *</label>
              <select value={memberProfile.fitnessGoal || ''} onChange={e => setMemberProfile({ ...memberProfile, fitnessGoal: e.target.value })} className="ep-form-select">
                <option value="">Select Goal</option>
                <option value="Weight loss">Weight Loss</option>
                <option value="Muscle gain">Muscle Gain</option>
                <option value="Strength">Strength</option>
                <option value="General fitness">General Fitness</option>
              </select>
            </div>
            <div className="ep-form-field">
              <label className="ep-form-label">Gym Experience *</label>
              <select value={memberProfile.gymExperience || ''} onChange={e => setMemberProfile({ ...memberProfile, gymExperience: e.target.value })} className="ep-form-select">
                <option value="">Select Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="ep-form-field">
              <label className="ep-form-label">Want a Diet Plan?</label>
              <select value={optedForDietPlan ? "yes" : "no"} onChange={e => setOptedForDietPlan(e.target.value === 'yes')} className="ep-form-select">
                <option value="no">No, skip diet plan</option>
                <option value="yes">Yes, create diet plan</option>
              </select>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <p className="ep-form-section-label">Choose Diet Preference</p>
            <div className="ep-diet-options-grid">
              {[
                { key: 'Vegetarian', label: 'Vegetarian', desc: 'Paneer, tofu, lentils, dairy, eggs' },
                { key: 'Non-Vegetarian', label: 'Non-Vegetarian', desc: 'Chicken, fish, eggs, lean meats' },
                { key: 'Vegan', label: 'Vegan', desc: 'No animal products — plant-based only' },
              ].map(opt => (
                <div
                  key={opt.key}
                  className={`ep-diet-option-card ${memberProfile.dietPreference === opt.key ? 'selected' : ''}`}
                  onClick={() => setMemberProfile({ ...memberProfile, dietPreference: opt.key })}
                >
                  <p className="ep-diet-card-title">{opt.label}</p>
                  <p className="ep-diet-card-desc">{opt.desc}</p>
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
            <p className="ep-form-section-label">Your Specific Target — Based on "{goal}" goal</p>
            <div className="ep-diet-options-grid">
              {targetOptions.map(opt => (
                <div
                  key={opt.key}
                  className={`ep-diet-option-card ${memberProfile.dietTarget === opt.key ? 'selected' : ''}`}
                  onClick={() => setMemberProfile({ ...memberProfile, dietTarget: opt.key })}
                >
                  <p className="ep-diet-card-title">{opt.label}</p>
                  <p className="ep-diet-card-desc">{opt.sub}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 6:
        return (
          <div className="ep-plan-display-card">
            <div className="ep-plan-display-header">
              <h5>{memberProfile.dietPreference} • {memberProfile.fitnessGoal}</h5>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Target: {memberProfile.dietTarget}</p>
            </div>
            <div className="ep-plan-display-body">
              <div className="ep-plan-details-box">
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.88rem', lineHeight: '1.7', margin: 0 }}>
                  {generatePersonalizedDiet()}
                </pre>
              </div>
              <div className="ep-plan-footer-note">
                Our nutritionist will refine this plan and send detailed meal schedules to your email within 24 hours.
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const age = calculateAge(memberProfile.dob);
  const bmi = memberProfile.height && memberProfile.weight
    ? ((memberProfile.weight / ((memberProfile.height / 100) ** 2)).toFixed(1))
    : "—";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

        :root {
          --ep-primary-gradient: linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #1e3a8a 100%);
          --ep-secondary-gradient: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          --ep-card-bg: rgba(255, 255, 255, 0.97);
          --ep-card-white: #ffffff;
          --ep-text-dark: #1e293b;
          --ep-text-gray: #64748b;
          --ep-accent-blue: #3b82f6;
          --ep-accent-dark: #1e40af;
          --ep-success-green: #10b981;
          --ep-warning-orange: #f59e0b;
          --ep-border-light: rgba(59, 130, 246, 0.18);
          --ep-border-subtle: #e2e8f0;
          --ep-bg-page: #f0f6ff;
          --ep-sidebar-width: 240px;
        }

        /* ─── VIDEO BACKGROUND ─── */
        .ep-video-container {
          position: fixed;
          inset: 0;
          z-index: -3;
          overflow: hidden;
        }
        .ep-video-container video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .ep-video-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26, 26, 29, 0.72);
          z-index: -2;
        }

        /* ─── APP SHELL ─── */
        .ep-members-container {
          display: flex;
          min-height: 100vh;
          background: transparent;
          font-family: 'Poppins', sans-serif;
          color: var(--ep-text-dark);
          position: relative;
          z-index: 10;
        }

        /* ─── SIDEBAR ─── */
        .ep-sidebar {
          width: var(--ep-sidebar-width);
          background: linear-gradient(180deg, #111827 0%, #1e2537 100%);
          border-right: 1px solid rgba(59, 130, 246, 0.25);
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          left: 0;
          top: 0;
          z-index: 100;
          box-shadow: 4px 0 24px rgba(59, 130, 246, 0.18);
          transition: left 0.3s ease;
        }
        .ep-sidebar-header {
          padding: 1.2rem 1rem;
          border-bottom: 1px solid rgba(59, 130, 246, 0.2);
        }
        .ep-admin-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(59, 130, 246, 0.1);
          padding: 0.7rem 0.85rem;
          border-radius: 10px;
          border: 1px solid rgba(59, 130, 246, 0.25);
        }
        .ep-admin-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: var(--ep-primary-gradient);
          border: 2px solid var(--ep-accent-blue);
          flex-shrink: 0;
          box-shadow: 0 0 16px rgba(59, 130, 246, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          color: white;
          font-weight: 700;
        }
        .ep-admin-details { min-width: 0; }
        .ep-admin-name {
          font-size: 0.88rem;
          font-weight: 700;
          color: #f1f5f9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
        }
        .ep-admin-role {
          font-size: 0.72rem;
          color: #64748b;
          margin: 0;
        }
        .ep-sidebar-nav {
          flex: 1;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          overflow-y: auto;
        }
        .ep-nav-section-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #475569;
          padding: 0.6rem 0.5rem 0.3rem;
          margin: 0;
        }
        .ep-nav-item {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          padding: 0.65rem 0.85rem;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 9px;
          transition: all 0.25s ease;
          text-align: left;
          width: 100%;
          font-family: 'Poppins', sans-serif;
        }
        .ep-nav-item .ep-nav-icon { font-size: 1rem; flex-shrink: 0; }
        .ep-nav-item .ep-nav-label { flex: 1; }
        .ep-nav-item:hover {
          background: rgba(59, 130, 246, 0.12);
          color: #93c5fd;
          transform: translateX(3px);
        }
        .ep-nav-item.active {
          background: rgba(59, 130, 246, 0.18);
          color: #60a5fa;
          font-weight: 600;
          padding-left: 1.1rem;
          border-left: 3px solid var(--ep-accent-blue);
        }
        .ep-sidebar-footer {
          padding: 0.85rem;
          border-top: 1px solid rgba(59, 130, 246, 0.15);
        }
        .ep-logout-btn {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          width: 100%;
          padding: 0.65rem 0.85rem;
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 9px;
          color: #f87171;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: 'Poppins', sans-serif;
        }
        .ep-logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.5);
        }

        /* ─── MAIN CONTENT ─── */
        .ep-main-content {
          margin-left: var(--ep-sidebar-width);
          flex: 1;
          min-height: 100vh;
          background: rgba(240, 246, 255, 0.97);
          display: flex;
          flex-direction: column;
          max-width: calc(100vw - var(--ep-sidebar-width));
          box-sizing: border-box;
        }

        /* ─── TOP BAR ─── */
        .ep-top-bar {
          background: var(--ep-card-white);
          border-bottom: 1px solid var(--ep-border-light);
          padding: 0.65rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 2px 12px rgba(59, 130, 246, 0.07);
        }
        .ep-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.82rem;
          color: var(--ep-text-gray);
        }
        .ep-breadcrumb .ep-current {
          font-weight: 700;
          background: var(--ep-primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ep-breadcrumb-sep { color: #cbd5e1; }
        .ep-mobile-menu-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--ep-primary-gradient);
          color: white;
          border: none;
          cursor: pointer;
          font-size: 1.1rem;
          position: fixed;
          top: 0.9rem;
          left: 0.9rem;
          z-index: 101;
        }

        /* ─── PAGE WRAPPER ─── */
        .ep-page-wrapper {
          flex: 1;
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          overflow-y: auto;
        }

        /* ─── PROFILE HEADER CARD ─── */
        .ep-profile-header-card {
          background: var(--ep-card-white);
          border-radius: 12px;
          border: 1px solid var(--ep-border-light);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
          overflow: hidden;
          position: relative;
        }
        .ep-profile-header-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--ep-primary-gradient);
          z-index: 5;
        }
        .ep-profile-header-inner {
          display: grid;
          grid-template-columns: 160px 1fr auto;
          align-items: center;
          min-height: 140px;
        }
        .ep-member-detail-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          border-right: 1px solid var(--ep-border-subtle);
        }
        .ep-member-detail-img {
          width: 80px;
          height: 80px;
          border-radius: 10px;
          border: 2px solid var(--ep-accent-blue);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        .ep-member-detail-img.has-photo {
          background-size: cover;
          background-position: center;
          font-size: 0;
        }
        .ep-photo-upload-btn {
          position: absolute;
          bottom: -6px;
          right: -3px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--ep-primary-gradient);
          border: 2px solid var(--ep-card-white);
          color: white;
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 12px rgba(59, 130, 246, 0.35);
          z-index: 10;
          transition: transform 0.25s ease;
        }
        .ep-photo-upload-btn:hover { transform: scale(1.1); }
        .ep-photo-label {
          font-size: 0.65rem;
          color: var(--ep-text-gray);
          text-align: center;
        }
        .ep-photo-label span {
          display: block;
          font-weight: 600;
          color: var(--ep-accent-blue);
          font-size: 0.6rem;
        }
        .ep-member-detail-right {
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          min-width: 0;
        }
        .ep-profile-name {
          font-size: 1.5rem;
          font-weight: 800;
          background: var(--ep-primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          line-height: 1.2;
          word-break: break-word;
        }
        .ep-profile-meta {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .ep-profile-meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--ep-text-gray);
        }
        .ep-meta-separator { color: #cbd5e1; }
        .ep-profile-info-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          align-items: center;
        }
        .ep-membership-badge,
        .ep-status-badge,
        .ep-age-display,
        .ep-goal-badge {
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          font-size: 0.65rem;
          font-weight: 600;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 0.2rem;
          min-height: 22px;
        }
        .ep-membership-badge {
          background: var(--ep-primary-gradient);
          color: white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
        }
        .ep-status-badge {
          background: rgba(16, 185, 129, 0.1);
          color: var(--ep-success-green);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .ep-age-display {
          background: rgba(59, 130, 246, 0.08);
          color: var(--ep-accent-blue);
          border: 1px solid var(--ep-border-light);
        }
        .ep-goal-badge {
          background: rgba(245, 158, 11, 0.1);
          color: var(--ep-warning-orange);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        .ep-profile-body-info {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem;
        }
        .ep-body-info-item {
          font-size: 0.7rem;
          color: var(--ep-text-gray);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .ep-body-info-item strong { color: var(--ep-text-dark); font-weight: 600; }

        /* Quick stats column */
        .ep-profile-quick-stats {
          padding: 1rem 1rem 1rem 1.2rem;
          border-left: 1px solid var(--ep-border-subtle);
          min-width: 160px;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          justify-content: center;
        }
        .ep-quick-stats-label {
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--ep-text-gray);
          margin: 0 0 0.3rem;
        }
        .ep-quick-stat-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.8rem;
          padding: 0.25rem 0;
        }
        .ep-quick-stat-key { font-size: 0.7rem; color: var(--ep-text-gray); }
        .ep-quick-stat-val { font-size: 0.75rem; font-weight: 700; color: var(--ep-accent-blue); }
        .ep-quick-stat-val.green { color: var(--ep-success-green); }
        .ep-quick-stat-val.orange { color: var(--ep-warning-orange); }
        .ep-quick-stat-val.purple { color: #8b5cf6; }
        .ep-quick-stat-divider { height: 1px; background: var(--ep-border-subtle); margin: 0.3rem 0; }
        .ep-quick-stat-pb-label { font-size: 0.6rem; color: var(--ep-text-gray); margin: 0 0 0.1rem; }
        .ep-quick-stat-pb-val { font-size: 0.7rem; font-weight: 700; color: var(--ep-text-dark); margin: 0; }

        /* ─── STATS ROW ─── */
        .ep-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        .ep-stat-card {
          background: var(--ep-card-white);
          border-radius: 12px;
          border: 1px solid var(--ep-border-light);
          padding: 1rem 1.2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 3px 12px rgba(59, 130, 246, 0.07);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .ep-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.14);
        }
        .ep-stat-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
        }
        .ep-stat-icon-wrap.blue   { background: rgba(59, 130, 246, 0.12); }
        .ep-stat-icon-wrap.orange { background: rgba(245, 158, 11, 0.12); }
        .ep-stat-icon-wrap.purple { background: rgba(139, 92, 246, 0.12); }
        .ep-stat-icon-wrap.green  { background: rgba(16, 185, 129, 0.12); }
        .ep-stat-info { min-width: 0; }
        .ep-stat-label { font-size: 0.7rem; color: var(--ep-text-gray); line-height: 1.2; margin: 0; }
        .ep-stat-value { font-size: 1.5rem; font-weight: 800; color: var(--ep-text-dark); line-height: 1.2; margin: 0; }
        .ep-stat-value .ep-stat-unit { font-size: 0.7rem; font-weight: 500; color: var(--ep-text-gray); margin-left: 2px; }

        /* ─── CONTENT GRID ─── */
        .ep-content-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 1.25rem;
          align-items: start;
        }

        /* ─── FORM CARD ─── */
        .ep-form-card {
          background: var(--ep-card-white);
          border-radius: 14px;
          border: 1px solid var(--ep-border-light);
          box-shadow: 0 6px 24px rgba(59, 130, 246, 0.1);
          overflow: hidden;
          position: relative;
        }
        .ep-form-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: var(--ep-primary-gradient);
        }
        .ep-form-card-header {
          padding: 1.2rem 1.5rem 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .ep-form-card-title {
          font-size: 1.05rem;
          font-weight: 800;
          background: var(--ep-primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
        }
        .ep-form-card-title-icon {
          background: var(--ep-primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.1rem;
        }

        /* ─── STEPPER ─── */
        .ep-stepper {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0;
          padding: 0.5rem 1.5rem 1rem;
        }
        .ep-step-item {
          display: flex;
          align-items: center;
          flex-direction: column;
          position: relative;
        }
        .ep-step-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f1f5f9;
          border: 2px solid var(--ep-border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: var(--ep-text-gray);
          font-size: 0.9rem;
          transition: all 0.35s ease;
          position: relative;
          z-index: 1;
        }
        .ep-step-label {
          font-size: 0.68rem;
          color: var(--ep-text-gray);
          font-weight: 600;
          margin-top: 0.4rem;
          text-align: center;
          white-space: nowrap;
        }
        .ep-step-item.active .ep-step-number {
          background: var(--ep-primary-gradient);
          color: white;
          border-color: var(--ep-accent-blue);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
          transform: scale(1.08);
        }
        .ep-step-item.active .ep-step-label { color: var(--ep-accent-blue); }
        .ep-step-item.done .ep-step-number { background: var(--ep-success-green); border-color: var(--ep-success-green); color: white; }
        .ep-step-connector {
          width: 60px;
          height: 2px;
          background: var(--ep-border-subtle);
          margin: 0 0 1.2rem;
          align-self: flex-start;
          margin-top: 17px;
        }
        .ep-step-connector.done { background: var(--ep-success-green); }

        /* ─── FORM BODY ─── */
        .ep-form-body { padding: 1.4rem 1.5rem 1.5rem; }
        .ep-form-section-label {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--ep-text-gray);
          margin-bottom: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .ep-form-section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--ep-border-subtle);
        }
        .ep-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.2rem;
        }
        .ep-form-grid-2 { grid-template-columns: repeat(2, 1fr); }
        .ep-form-grid-3 { grid-template-columns: repeat(3, 1fr); }
        .ep-form-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .ep-form-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--ep-text-dark);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .ep-form-input,
        .ep-form-select,
        .ep-form-textarea {
          width: 100%;
          padding: 0.6rem 0.85rem;
          background: #f8fafc;
          border: 1.5px solid var(--ep-border-subtle);
          border-radius: 8px;
          color: var(--ep-text-dark);
          font-size: 0.88rem;
          font-weight: 500;
          font-family: 'Poppins', sans-serif;
          transition: all 0.25s ease;
          box-sizing: border-box;
        }
        .ep-form-input:focus,
        .ep-form-select:focus,
        .ep-form-textarea:focus {
          outline: none;
          border-color: var(--ep-accent-blue);
          background: var(--ep-card-white);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .ep-form-input::placeholder,
        .ep-form-textarea::placeholder { color: #94a3b8; }
        .ep-form-select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%233b82f6' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1.3em;
          padding-right: 2.5rem;
          cursor: pointer;
          appearance: none;
        }
        .ep-form-textarea { resize: vertical; min-height: 80px; }

        /* ─── FORM ACTIONS ─── */
        .ep-form-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 1.5rem 1.5rem;
          border-top: 1px solid var(--ep-border-subtle);
          margin-top: 0.5rem;
        }
        .ep-btn {
          padding: 0.6rem 1.3rem;
          border-radius: 9px;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          border: none;
          font-family: 'Poppins', sans-serif;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .ep-btn-ghost {
          background: #f1f5f9;
          color: var(--ep-text-gray);
          border: 1.5px solid var(--ep-border-subtle);
        }
        .ep-btn-ghost:hover { background: #e2e8f0; }
        .ep-btn-primary {
          background: var(--ep-primary-gradient);
          color: white;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
        }
        .ep-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(59, 130, 246, 0.45); }
        .ep-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
        .ep-btn-danger {
          background: rgba(239, 68, 68, 0.08);
          color: #dc2626;
          border: 1.5px solid rgba(239, 68, 68, 0.25);
        }
        .ep-btn-danger:hover { background: #dc2626; color: white; }

        /* ─── RIGHT PANEL ─── */
        .ep-right-panel {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        .ep-panel-card {
          background: var(--ep-card-white);
          border-radius: 14px;
          border: 1px solid var(--ep-border-light);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
          overflow: hidden;
          position: relative;
        }
        .ep-panel-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--ep-primary-gradient);
        }
        .ep-panel-header {
          padding: 1rem 1.1rem 0.65rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .ep-panel-header-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: rgba(59, 130, 246, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }
        .ep-panel-title {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--ep-text-dark);
          margin: 0;
        }
        .ep-panel-body { padding: 0 1.1rem 1.1rem; }
        .ep-panel-divider { height: 1px; background: var(--ep-border-subtle); margin: 0.65rem 0; }

        /* ─── MEMBERSHIP PANEL ─── */
        .ep-membership-hero {
          background: var(--ep-primary-gradient);
          border-radius: 10px;
          padding: 1rem 1.1rem;
          color: white;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-bottom: 0.85rem;
        }
        .ep-membership-hero-label { font-size: 0.68rem; opacity: 0.75; margin: 0; }
        .ep-membership-hero-type { font-size: 1.3rem; font-weight: 800; margin: 0; }
        .ep-membership-hero-since { font-size: 0.68rem; opacity: 0.7; margin: 0; }
        .ep-membership-counts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
          margin-bottom: 0.85rem;
        }
        .ep-count-box {
          background: #f8fafc;
          border: 1px solid var(--ep-border-subtle);
          border-radius: 8px;
          padding: 0.6rem 0.5rem;
          text-align: center;
        }
        .ep-count-box-val { font-size: 1.2rem; font-weight: 800; color: var(--ep-accent-blue); line-height: 1; margin: 0; }
        .ep-count-box-label { font-size: 0.65rem; color: var(--ep-text-gray); margin: 0.2rem 0 0; }
        .ep-upgrade-btn {
          width: 100%;
          padding: 0.55rem;
          border-radius: 8px;
          border: 1.5px solid var(--ep-border-light);
          background: transparent;
          color: var(--ep-accent-blue);
          font-family: 'Poppins', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .ep-upgrade-btn:hover { background: var(--ep-primary-gradient); color: white; border-color: transparent; }

        /* ─── METRICS PANEL ─── */
        .ep-metric-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.4rem 0;
          gap: 0.75rem;
        }
        .ep-metric-key { font-size: 0.75rem; color: var(--ep-text-gray); flex-shrink: 0; }
        .ep-metric-val {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--ep-accent-blue);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .ep-metric-badge {
          font-size: 0.62rem;
          font-weight: 700;
          padding: 0.1rem 0.4rem;
          border-radius: 5px;
        }
        .ep-metric-badge.green { background: rgba(16, 185, 129, 0.1); color: var(--ep-success-green); border: 1px solid rgba(16, 185, 129, 0.25); }
        .ep-metric-badge.blue  { background: rgba(59, 130, 246, 0.1); color: var(--ep-accent-blue); border: 1px solid rgba(59, 130, 246, 0.25); }

        /* ─── PROGRESS BARS PANEL ─── */
        .ep-progress-item { margin-bottom: 0.8rem; }
        .ep-progress-item:last-child { margin-bottom: 0; }
        .ep-progress-meta { display: flex; justify-content: space-between; margin-bottom: 0.3rem; }
        .ep-progress-label { font-size: 0.75rem; font-weight: 600; color: var(--ep-text-dark); }
        .ep-progress-pct   { font-size: 0.75rem; font-weight: 800; }
        .ep-progress-track { height: 7px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
        .ep-progress-fill  { height: 100%; border-radius: 99px; background: var(--ep-primary-gradient); transition: width 0.5s ease; }

        /* ─── DIET / PLAN CARDS ─── */
        .ep-diet-options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin: 1.2rem 0;
        }
        .ep-diet-option-card {
          padding: 1.4rem 1.2rem;
          background: var(--ep-card-white);
          border: 2px solid var(--ep-border-subtle);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: var(--ep-text-dark);
          position: relative;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .ep-diet-option-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--ep-primary-gradient);
        }
        .ep-diet-option-card:hover {
          transform: translateY(-4px);
          border-color: var(--ep-accent-blue);
          box-shadow: 0 12px 32px rgba(59, 130, 246, 0.2);
        }
        .ep-diet-option-card.selected {
          border-color: var(--ep-success-green);
          background: linear-gradient(135deg, rgba(16,185,129,0.07), rgba(34,197,94,0.03));
          box-shadow: 0 12px 36px rgba(16, 185, 129, 0.22);
        }
        .ep-diet-card-title {
          font-size: 1rem;
          font-weight: 800;
          margin: 0 0 0.4rem;
          background: var(--ep-primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ep-diet-card-desc { font-size: 0.8rem; line-height: 1.55; color: var(--ep-text-gray); margin: 0; }

        /* ─── PLAN DISPLAY CARD ─── */
        .ep-plan-display-card {
          background: var(--ep-card-white);
          border: 1.5px solid var(--ep-border-light);
          border-radius: 14px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 8px 28px rgba(59, 130, 246, 0.12);
        }
        .ep-plan-display-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: var(--ep-primary-gradient);
        }
        .ep-plan-display-header { padding: 1.2rem 1.4rem 0.75rem; text-align: center; }
        .ep-plan-display-header h5 {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0 0 0.25rem;
          background: var(--ep-primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ep-plan-display-body { padding: 0 1.4rem 1.2rem; }
        .ep-plan-details-box {
          background: #f8fafc;
          border: 1px solid var(--ep-border-subtle);
          border-radius: 9px;
          padding: 1rem 1.1rem;
          font-size: 0.85rem;
          line-height: 1.65;
          color: var(--ep-text-dark);
          white-space: pre-wrap;
        }
        .ep-plan-footer-note {
          background: rgba(59, 130, 246, 0.05);
          border: 1px solid var(--ep-border-light);
          border-radius: 9px;
          padding: 0.75rem 1rem;
          font-size: 0.8rem;
          color: var(--ep-text-gray);
          text-align: center;
          margin-top: 0.75rem;
        }

        /* ─── INFO ALERT ─── */
        .ep-info-alert {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          padding: 0.85rem 1rem;
          border-radius: 9px;
          background: rgba(59, 130, 246, 0.05);
          border: 1px solid rgba(59, 130, 246, 0.18);
          margin-bottom: 1.1rem;
        }
        .ep-info-alert-icon { font-size: 1rem; color: var(--ep-accent-blue); flex-shrink: 0; margin-top: 1px; }
        .ep-info-alert-title { font-size: 0.82rem; font-weight: 700; color: var(--ep-text-dark); margin: 0; }
        .ep-info-alert-desc  { font-size: 0.75rem; color: var(--ep-text-gray); margin: 0.1rem 0 0; }

        /* ─── TOAST ─── */
        .ep-toast-container {
          position: fixed;
          top: 1.1rem;
          right: 1.1rem;
          z-index: 999999;
          width: 320px;
          max-width: 90vw;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          pointer-events: none;
        }
        .ep-toast {
          background: linear-gradient(135deg, #10b981, #059669);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 12px;
          padding: 0.8rem 1rem;
          color: white;
          font-family: 'Poppins', sans-serif;
          font-size: 0.86rem;
          font-weight: 500;
          line-height: 1.45;
          box-shadow: 0 12px 40px rgba(16, 185, 129, 0.38);
          display: flex;
          align-items: flex-start;
          gap: 0.55rem;
          animation: epToastIn 0.35s ease-out forwards;
          pointer-events: all;
        }
        .ep-toast.error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-color: rgba(239, 68, 68, 0.3);
          box-shadow: 0 12px 40px rgba(239, 68, 68, 0.38);
        }
        .ep-toast-icon { font-size: 1rem; margin-top: 1px; flex-shrink: 0; }
        .ep-toast-text { flex: 1; }
        .ep-toast-title { font-weight: 700; display: block; }
        .ep-toast-msg   { opacity: 0.88; font-size: 0.78rem; }
        @keyframes epToastIn {
          from { transform: translateX(115%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 1200px) {
          .ep-content-grid { grid-template-columns: 1fr 280px; }
        }
        @media (max-width: 1024px) {
          .ep-content-grid { grid-template-columns: 1fr; }
          .ep-right-panel { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
          .ep-profile-header-inner { grid-template-columns: 160px 1fr; }
          .ep-profile-quick-stats { display: none; }
          .ep-stats-row { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .ep-sidebar { left: -240px; }
          .ep-sidebar.open { left: 0; }
          .ep-mobile-menu-toggle { display: flex; }
          .ep-main-content { margin-left: 0; max-width: 100vw; }
          .ep-page-wrapper { padding: 0.85rem; }
          .ep-profile-header-inner { grid-template-columns: 1fr; }
          .ep-member-detail-left {
            flex-direction: row;
            justify-content: flex-start;
            padding: 1rem;
            border-right: none;
            border-bottom: 1px solid var(--ep-border-subtle);
            gap: 1rem;
          }
          .ep-member-detail-right { padding: 1rem; }
          .ep-profile-quick-stats { display: none; }
          .ep-profile-name { font-size: 1.35rem; }
          .ep-stats-row { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
          .ep-form-grid, .ep-form-grid-2, .ep-form-grid-3 { grid-template-columns: 1fr; }
          .ep-form-actions { flex-direction: row; justify-content: flex-end; }
          .ep-right-panel { grid-template-columns: 1fr; }
          .ep-diet-options-grid { grid-template-columns: 1fr; }
          .ep-toast-container { top: 0.75rem; right: 0.75rem; left: 0.75rem; width: auto; max-width: none; }
        }
        @media (max-width: 480px) {
          .ep-profile-info-row { gap: 0.35rem; }
          .ep-membership-badge, .ep-status-badge, .ep-age-display, .ep-goal-badge {
            font-size: 0.67rem;
            padding: 0.22rem 0.5rem;
          }
          .ep-stats-row { grid-template-columns: 1fr; }
          .ep-stat-card { padding: 0.85rem 1rem; }
        }
      `}</style>

      {/* Video BG */}
      <div className="ep-video-container">
        <video autoPlay loop muted playsInline preload="auto">
          <source src="/videos/gym-video.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="ep-video-overlay" />

      <div className="ep-members-container">

        {/* ── SIDEBAR ── */}
        <aside className={`ep-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="ep-sidebar-header">
            <div className="ep-admin-info">
              <div className="ep-admin-avatar">
                {memberProfile.photo
                  ? <img src={memberProfile.photo} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : (memberProfile.name ? memberProfile.name.charAt(0).toUpperCase() : 'M')}
              </div>
              <div className="ep-admin-details">
                <p className="ep-admin-name">{memberProfile.name || 'Member'}</p>
                <p className="ep-admin-role">{membershipName}</p>
              </div>
            </div>
          </div>

          <nav className="ep-sidebar-nav">
            <p className="ep-nav-section-label">Navigation</p>
            <button className="ep-nav-item" onClick={() => navigate(`/member-dashboard/${memberId}`)}>
              <span className="ep-nav-icon">📊</span>
              <span className="ep-nav-label">Dashboard</span>
            </button>
            <button className="ep-nav-item active">
              <span className="ep-nav-icon">✏️</span>
              <span className="ep-nav-label">Edit Profile</span>
            </button>
            <button className="ep-nav-item">
              <span className="ep-nav-icon">📋</span>
              <span className="ep-nav-label">Membership</span>
            </button>
            <button className="ep-nav-item">
              <span className="ep-nav-icon">📈</span>
              <span className="ep-nav-label">Progress</span>
            </button>
            <button className="ep-nav-item">
              <span className="ep-nav-icon">💰</span>
              <span className="ep-nav-label">Payments</span>
            </button>
            <button className="ep-nav-item">
              <span className="ep-nav-icon">🏋️</span>
              <span className="ep-nav-label">Workouts</span>
            </button>
            <button className="ep-nav-item">
              <span className="ep-nav-icon">🥗</span>
              <span className="ep-nav-label">Diet Plans</span>
            </button>
            <button className="ep-nav-item">
              <span className="ep-nav-icon">⚙️</span>
              <span className="ep-nav-label">Settings</span>
            </button>
          </nav>

          <div className="ep-sidebar-footer">
            <button className="ep-logout-btn" onClick={() => navigate('/')}>
              <span>🚪</span> Logout
            </button>
          </div>
        </aside>

        {/* Mobile toggle */}
        {!sidebarOpen && (
          <button className="ep-mobile-menu-toggle" onClick={() => setSidebarOpen(true)}>☰</button>
        )}

        {/* ── MAIN CONTENT ── */}
        <div className="ep-main-content">

          {/* Top bar */}
          <div className="ep-top-bar">
            <div className="ep-breadcrumb">
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.82rem', padding: 0 }}
                onClick={() => navigate(`/member-dashboard/${memberId}`)}>
                Dashboard
              </button>
              <span className="ep-breadcrumb-sep">/</span>
              <span className="ep-current">Edit Profile</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className="ep-btn ep-btn-ghost"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                onClick={() => setSidebarOpen(o => !o)}
              >
                ☰ Menu
              </button>
            </div>
          </div>

          <div className="ep-page-wrapper">

            {/* ── PROFILE HEADER ── */}
            <div className="ep-profile-header-card">
              <div className="ep-profile-header-inner">

                {/* Avatar */}
                <div className="ep-member-detail-left">
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <div
                      className={`ep-member-detail-img ${memberProfile.photo ? 'has-photo' : ''}`}
                      style={memberProfile.photo ? { backgroundImage: `url(${memberProfile.photo})` } : {}}
                    >
                      {!memberProfile.photo && (memberProfile.name ? memberProfile.name.charAt(0).toUpperCase() : '?')}
                    </div>
                    <label htmlFor="ep-photo-upload" className="ep-photo-upload-btn" title="Change photo">📷</label>
                    <input id="ep-photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  </div>
                  <div className="ep-photo-label">
                    {memberProfile.photo ? 'Photo uploaded' : 'No photo'}
                    <span>Click camera to change</span>
                  </div>
                </div>

                {/* Info */}
                <div className="ep-member-detail-right">
                  <h1 className="ep-profile-name">{memberProfile.name || 'Loading...'}</h1>
                  <div className="ep-profile-meta">
                    <span className="ep-profile-meta-item">✉️ {memberProfile.email || '—'}</span>
                    <span className="ep-meta-separator">•</span>
                    <span className="ep-profile-meta-item">📞 {memberProfile.phone || '—'}</span>
                    <span className="ep-meta-separator">•</span>
                    <span className="ep-profile-meta-item">📍 {memberProfile.address || '—'}</span>
                  </div>
                  <div className="ep-profile-info-row">
                    <span className="ep-membership-badge">🏅 {membershipName}</span>
                    <span className="ep-status-badge">
                      {memberProfile.status === 'active' ? '🟢 Active' : memberProfile.status === 'inactive' ? '🔴 Inactive' : '🟡 Pending'}
                    </span>
                    {age && <span className="ep-age-display">{age} yrs</span>}
                    {memberProfile.fitnessGoal && <span className="ep-goal-badge">🎯 {memberProfile.fitnessGoal}</span>}
                    {memberProfile.gymExperience && <span className="ep-age-display">{memberProfile.gymExperience}</span>}
                  </div>
                  <div className="ep-profile-body-info">
                    {memberProfile.height && <span className="ep-body-info-item">📏 <strong>{memberProfile.height} cm</strong></span>}
                    {memberProfile.weight && <span className="ep-body-info-item">⚖️ <strong>{memberProfile.weight} kg</strong></span>}
                    {memberProfile.bodyFat && <span className="ep-body-info-item">🔥 <strong>{memberProfile.bodyFat}%</strong> body fat</span>}
                  </div>
                </div>

                {/* Quick stats */}
                <div className="ep-profile-quick-stats">
                  <p className="ep-quick-stats-label">Quick Stats</p>
                  <div className="ep-quick-stat-row">
                    <span className="ep-quick-stat-key">BMI</span>
                    <span className="ep-quick-stat-val">{bmi}</span>
                  </div>
                  <div className="ep-quick-stat-row">
                    <span className="ep-quick-stat-key">Body Fat</span>
                    <span className="ep-quick-stat-val orange">{memberProfile.bodyFat ? `${memberProfile.bodyFat}%` : '—'}</span>
                  </div>
                  <div className="ep-quick-stat-row">
                    <span className="ep-quick-stat-key">Experience</span>
                    <span className="ep-quick-stat-val purple" style={{ fontSize: '0.72rem' }}>{memberProfile.gymExperience || '—'}</span>
                  </div>
                  <div className="ep-quick-stat-divider" />
                  <p className="ep-quick-stat-pb-label">Diet Plan</p>
                  <p className="ep-quick-stat-pb-val">{optedForDietPlan ? (memberProfile.dietPreference || 'Selected') : 'Not opted'}</p>
                </div>

              </div>
            </div>

            {/* ── STATS ROW ── */}
            <div className="ep-stats-row">
              <div className="ep-stat-card">
                <div className="ep-stat-icon-wrap blue">📊</div>
                <div className="ep-stat-info">
                  <p className="ep-stat-label">Current Step</p>
                  <p className="ep-stat-value">{currentStep} <span className="ep-stat-unit">/ {totalSteps}</span></p>
                </div>
              </div>
              <div className="ep-stat-card">
                <div className="ep-stat-icon-wrap orange">🔥</div>
                <div className="ep-stat-info">
                  <p className="ep-stat-label">Diet Plan</p>
                  <p className="ep-stat-value" style={{ fontSize: '1rem' }}>{optedForDietPlan ? 'Active' : 'Skipped'}</p>
                </div>
              </div>
              <div className="ep-stat-card">
                <div className="ep-stat-icon-wrap green">📏</div>
                <div className="ep-stat-info">
                  <p className="ep-stat-label">BMI</p>
                  <p className="ep-stat-value">{bmi}</p>
                </div>
              </div>
              <div className="ep-stat-card">
                <div className="ep-stat-icon-wrap purple">🎯</div>
                <div className="ep-stat-info">
                  <p className="ep-stat-label">Goal</p>
                  <p className="ep-stat-value" style={{ fontSize: '0.95rem' }}>{memberProfile.fitnessGoal || '—'}</p>
                </div>
              </div>
            </div>

            {/* ── CONTENT GRID: FORM + RIGHT PANEL ── */}
            <div className="ep-content-grid">

              {/* ── FORM CARD ── */}
              <div className="ep-form-card">
                <div className="ep-form-card-header">
                  <h2 className="ep-form-card-title">
                    <span className="ep-form-card-title-icon">✏️</span>
                    {stepTitles[currentStep - 1]}
                  </h2>
                </div>

                {/* Stepper */}
                <div className="ep-stepper">
                  {allSteps.map((step, idx) => (
                    <React.Fragment key={step}>
                      <div className={`ep-step-item ${currentStep > step ? 'done' : currentStep === step ? 'active' : ''}`}>
                        <div className="ep-step-number">
                          {currentStep > step ? '✓' : step}
                        </div>
                        <span className="ep-step-label">{stepLabels[step - 1]}</span>
                      </div>
                      {idx < allSteps.length - 1 && (
                        <div className={`ep-step-connector ${currentStep > step ? 'done' : ''}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Step Content */}
                <div className="ep-form-body">
                  {renderStepContent()}
                </div>

                {/* Actions */}
                <div className="ep-form-actions">
                  <button
                    className="ep-btn ep-btn-ghost"
                    onClick={currentStep === 1 ? () => window.history.back() : prevStep}
                    disabled={isLoading}
                  >
                    {currentStep === 1 ? 'Cancel' : '← Previous'}
                  </button>

                  <button
                    className="ep-btn ep-btn-danger"
                    onClick={() => setShowResetPassword(true)}
                    disabled={isLoading}
                    style={{ marginRight: 'auto' }}
                  >
                    🔐 Reset Password
                  </button>

                  {currentStep < totalSteps && (
                    <button className="ep-btn ep-btn-primary" onClick={nextStep} disabled={isLoading}>
                      Next →
                    </button>
                  )}

                  {currentStep === totalSteps && (
                    <button className={`ep-btn ep-btn-primary`} onClick={handleSave} disabled={isLoading}>
                      {isLoading ? '⏳ Saving...' : '💾 Save Profile'}
                    </button>
                  )}
                </div>
              </div>

              {/* ── RIGHT PANEL ── */}
              <div className="ep-right-panel">

                {/* Membership card */}
                <div className="ep-panel-card">
                  <div className="ep-panel-header">
                    <div className="ep-panel-header-icon">🏅</div>
                    <h3 className="ep-panel-title">Membership</h3>
                  </div>
                  <div className="ep-panel-body">
                    <div className="ep-membership-hero">
                      <p className="ep-membership-hero-label">Current Plan</p>
                      <p className="ep-membership-hero-type">{membershipName}</p>
                      <p className="ep-membership-hero-since">Member ID: {memberId}</p>
                    </div>
                    <div className="ep-membership-counts">
                      <div className="ep-count-box">
                        <p className="ep-count-box-val">{memberProfile.height || '—'}</p>
                        <p className="ep-count-box-label">Height (cm)</p>
                      </div>
                      <div className="ep-count-box">
                        <p className="ep-count-box-val">{memberProfile.weight || '—'}</p>
                        <p className="ep-count-box-label">Weight (kg)</p>
                      </div>
                    </div>
                    <button className="ep-upgrade-btn">Upgrade Plan</button>
                  </div>
                </div>

                {/* Progress card */}
                <div className="ep-panel-card">
                  <div className="ep-panel-header">
                    <div className="ep-panel-header-icon">📈</div>
                    <h3 className="ep-panel-title">Form Progress</h3>
                  </div>
                  <div className="ep-panel-body">
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
                        <div key={item.step} className="ep-progress-item">
                          <div className="ep-progress-meta">
                            <span className="ep-progress-label">{item.label}</span>
                            <span className="ep-progress-pct" style={{ color: pct === 100 ? '#10b981' : '#3b82f6' }}>
                              {pct === 100 ? '✓ Done' : pct === 50 ? 'In progress' : 'Pending'}
                            </span>
                          </div>
                          <div className="ep-progress-track">
                            <div className="ep-progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'var(--ep-primary-gradient)' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Body Metrics card */}
                <div className="ep-panel-card">
                  <div className="ep-panel-header">
                    <div className="ep-panel-header-icon">⚖️</div>
                    <h3 className="ep-panel-title">Body Metrics</h3>
                  </div>
                  <div className="ep-panel-body">
                    {[
                      { key: 'BMI',      val: bmi,                                                extra: bmi !== '—' && parseFloat(bmi) < 25 ? { label: 'Normal', cls: 'green' } : null },
                      { key: 'Body Fat', val: memberProfile.bodyFat ? `${memberProfile.bodyFat}%` : '—', extra: null },
                      { key: 'Height',   val: memberProfile.height  ? `${memberProfile.height} cm`  : '—', extra: null },
                      { key: 'Weight',   val: memberProfile.weight  ? `${memberProfile.weight} kg`  : '—', extra: null },
                      { key: 'Age',      val: age !== '—' ? `${age} yrs` : '—',                    extra: null },
                      { key: 'Gender',   val: memberProfile.gender  || '—',                         extra: null },
                    ].map(m => (
                      <div key={m.key} className="ep-metric-row">
                        <span className="ep-metric-key">{m.key}</span>
                        <span className="ep-metric-val">
                          {m.val}
                          {m.extra && <span className={`ep-metric-badge ${m.extra.cls}`}>{m.extra.label}</span>}
                        </span>
                      </div>
                    ))}
                    <div className="ep-panel-divider" />
                    {memberProfile.medicalConditions && (
                      <div>
                        <p style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Medical Notes</p>
                        <p style={{ fontSize: '0.75rem', color: '#1e293b', lineHeight: 1.5 }}>{memberProfile.medicalConditions}</p>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="ep-panel-card" style={{ width: '100%', maxWidth: '420px', margin: '1rem' }}>
            <div className="ep-panel-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="ep-panel-header-icon">🔐</div>
                <h3 className="ep-panel-title">Reset Password</h3>
              </div>
              <button onClick={() => setShowResetPassword(false)} style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            <div className="ep-panel-body">
              <div className="ep-info-alert">
                <span className="ep-info-alert-icon">ℹ️</span>
                <div>
                  <p className="ep-info-alert-title">Send Reset Link</p>
                  <p className="ep-info-alert-desc">A password reset link will be sent to <strong>{memberProfile.email}</strong></p>
                </div>
              </div>
              <div className="ep-form-actions" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <button className="ep-btn ep-btn-ghost" onClick={() => setShowResetPassword(false)}>Cancel</button>
                <button className="ep-btn ep-btn-primary" onClick={handlePasswordReset}>Send Reset Link</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast.visible && (
        <div className="ep-toast-container">
          <div className={`ep-toast ${toast.type === 'error' ? 'error' : ''}`}>
            <span className="ep-toast-icon">{toast.type === 'error' ? '❌' : '✅'}</span>
            <div className="ep-toast-text">
              <span className="ep-toast-title">{toast.type === 'error' ? 'Error' : 'Success'}</span>
              <span className="ep-toast-msg">{toast.message}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfile;
