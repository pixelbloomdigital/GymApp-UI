import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./StaffManagement.css";
import PasswordField from "./PasswordField.jsx";

export default function Staffentry() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { staff, mode } = location.state || {};
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({ fullname:"", username:"", password:"", confirmPassword:"", gender:"Male", designation:"Trainer", email:"", address:"", contact:"" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && staff) setFormData({ fullname:staff.fullname||"", username:staff.username||"", password:"", confirmPassword:"", gender:staff.gender||"Male", designation:staff.designation||"Trainer", email:staff.email||"", address:staff.address||"", contact:staff.contact||"" });
  }, [mode, staff]);

  const set = e => { setFormData(p => ({ ...p, [e.target.name]: e.target.value })); setErrors(p => ({ ...p, [e.target.name]: "" })); };

  const validateStep1 = () => {
    const e = {};
    if (!formData.fullname.trim()) e.fullname = "Full name is required";
    if (!formData.username.trim()) e.username = "Username is required";
    else if (!formData.username.startsWith('@')) e.username = "Username must start with @";
    if (mode !== 'edit') {
      if (!formData.password) e.password = "Password is required";
      else if (formData.password.length < 6) e.password = "Min 6 characters";
      if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = {};
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errs.email = "Valid email required";
    if (!formData.address.trim()) errs.address = "Address is required";
    if (!formData.contact.trim() || !/^\d{7,15}$/.test(formData.contact)) errs.contact = "Valid contact required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    alert(mode === 'edit' ? "Staff updated!" : "Staff added!");
    navigate('/staff-list');
  };

  return (
    <div className="staff-container">
      <div className="sidebar">
        <div className="sidebar-header"><h1 className="sidebar-title">MuscleFit</h1></div>
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate('/admin-dashboard')}><i className="fas fa-home" /><span>Dashboard</span></button>
          <button className="nav-item" onClick={() => navigate('/members')}><i className="fas fa-users" /><span>Members</span></button>
          <button className="nav-item" onClick={() => navigate('/equipment')}><i className="fas fa-dumbbell" /><span>Gym Equipment</span></button>
          <button className="nav-item" onClick={() => navigate('/announcements')}><i className="fas fa-bullhorn" /><span>Announcements</span></button>
          <button className="nav-item active"><i className="fas fa-user-tie" /><span>Staff Management</span></button>
          <button className="nav-item" onClick={() => { localStorage.clear(); navigate('/login'); }}><i className="fas fa-sign-out-alt" /><span>Logout</span></button>
        </nav>
      </div>

      <div className="main-content">
        <div className="staff-page">
          <div className="breadcrumb">
            <span onClick={() => navigate('/admin-dashboard')} className="breadcrumb-link"><i className="fas fa-home" /> Home</span>
            <i className="fas fa-chevron-right" />
            <span onClick={() => navigate('/staff-list')} className="breadcrumb-link">Staffs</span>
            <i className="fas fa-chevron-right" />
            <span className="breadcrumb-current">Staff Entry</span>
          </div>
          <div className="page-title"><h1><i className="fas fa-briefcase" /> Staff Entry Form</h1></div>
          <div className="staff-form-card">
            <div className="form-header"><h3><i className="fas fa-clipboard-list" /> Staff Details</h3></div>
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <div className="form-step">
                  {[['fullname','Full Name','text'],['username','Username','text']].map(([n,l,t]) => (
                    <div className="form-row" key={n}>
                      <div className="form-group">
                        <label>{l} <span className="required">*</span></label>
                        <input type={t} name={n} value={formData[n]} onChange={set} placeholder={n === 'username' ? '@username' : `Enter ${l.toLowerCase()}`} className={errors[n] ? "error" : ""} />
                        {errors[n] && <span className="error-message">{errors[n]}</span>}
                      </div>
                    </div>
                  ))}
                  {mode !== 'edit' && ['password','confirmPassword'].map(n => (
                    <div className="form-row" key={n}>
                      <div className="form-group">
                        <label>{n === 'password' ? 'Password' : 'Confirm Password'} <span className="required">*</span></label>
                        <PasswordField
                          name={n}
                          value={formData[n]}
                          onChange={set}
                          placeholder={n === 'password' ? 'Enter password' : 'Confirm password'}
                          inputClassName={errors[n] ? "error" : ""}
                        />
                        {errors[n] && <span className="error-message">{errors[n]}</span>}
                      </div>
                    </div>
                  ))}
                  <div className="form-actions">
                    <button type="button" className="next-btn" onClick={() => validateStep1() && setCurrentStep(2)}>Next <i className="fas fa-arrow-right" /></button>
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <div className="form-step">
                  <div className="form-row-two">
                    <div className="form-group">
                      <label>Gender <span className="required">*</span></label>
                      <select name="gender" value={formData.gender} onChange={set}><option>Male</option><option>Female</option><option>Other</option></select>
                    </div>
                    <div className="form-group">
                      <label>Designation <span className="required">*</span></label>
                      <select name="designation" value={formData.designation} onChange={set}><option>Trainer</option><option>Manager</option><option>Cashier</option><option>Receptionist</option><option>Cleaner</option></select>
                    </div>
                  </div>
                  {[['email','Email','email'],['address','Address','text'],['contact','Contact','tel']].map(([n,l,t]) => (
                    <div className="form-row" key={n}>
                      <div className="form-group">
                        <label>{l} <span className="required">*</span></label>
                        <input type={t} name={n} value={formData[n]} onChange={set} placeholder={`Enter ${l.toLowerCase()}`} className={errors[n] ? "error" : ""} />
                        {errors[n] && <span className="error-message">{errors[n]}</span>}
                      </div>
                    </div>
                  ))}
                  <div className="form-actions">
                    <button type="button" className="back-btn-form" onClick={() => setCurrentStep(1)}><i className="fas fa-arrow-left" /> Back</button>
                    <button type="submit" className="submit-btn">{mode === 'edit' ? 'Update Staff' : 'Add Staff'}</button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
