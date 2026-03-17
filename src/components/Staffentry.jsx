import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./StaffManagement.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Staffentry() {
  const navigate = useNavigate();
  const location = useLocation();
  const { staff, mode } = location.state || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    password: "",
    confirmPassword: "",
    gender: "Male",
    designation: "Trainer",
    email: "",
    address: "",
    contact: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && staff) {
      setFormData({
        fullname: staff.fullname || "",
        username: staff.username || "",
        password: "",
        confirmPassword: "",
        gender: staff.gender || "Male",
        designation: staff.designation || "Trainer",
        email: staff.email || "",
        address: staff.address || "",
        contact: staff.contact || "",
      });
    }
  }, [mode, staff]);

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };

  const handleNavigateToMembers = () => {
    navigate('/members');
  };

  const handleNavigateToEquipment = () => {
    navigate('/equipment');
  };

  const handleNavigateToAnnouncements = () => {
    navigate('/announcements');
  };

  const handleNavigateToStaffList = () => {
    navigate('/staff-list');
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
 
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = "Full name is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (!formData.username.startsWith('@')) {
      newErrors.username = "Username must start with @";
    }

    if (!mode || mode !== 'edit') {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

   
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Contact is required";
    } else if (!/^\d{7,15}$/.test(formData.contact)) {
      newErrors.contact = "Contact must be 7-15 digits";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("Form submitted:", formData);
    
    if (mode === 'edit') {
      alert("Staff member updated successfully!");
    } else {
      alert("Staff member added successfully!");
    }
    
    navigate('/staff-list');
  };

  return (
    <div className="staff-container">
      {/* Sidebar */}
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
          <button className="nav-item" onClick={handleNavigateToDashboard}>
            <i className="fas fa-home"></i>
            <span>Dashboard</span>
          </button>
          <button className="nav-item" onClick={handleNavigateToMembers}>
            <i className="fas fa-users"></i>
            <span>Members</span>
          </button>
          <button className="nav-item" onClick={handleNavigateToEquipment}>
            <i className="fas fa-dumbbell"></i>
            <span>Gym Equipment</span>
          </button>
          <button className="nav-item" onClick={handleNavigateToAnnouncements}>
            <i className="fas fa-bullhorn"></i>
            <span>Announcements</span>
          </button>
          <button className="nav-item active">
            <i className="fas fa-user-tie"></i>
            <span>Staff Management</span>
          </button>
          <button className="nav-item" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </nav>
      </div>

 
      <div className="main-content">
        <div className="staff-page">
      
          <div className="breadcrumb">
            <span onClick={handleNavigateToDashboard} className="breadcrumb-link">
              <i className="fas fa-home"></i> Home
            </span>
            <i className="fas fa-chevron-right"></i>
            <span onClick={handleNavigateToStaffList} className="breadcrumb-link">
              Staffs
            </span>
            <i className="fas fa-chevron-right"></i>
            <span className="breadcrumb-current">Staff Entry</span>
          </div>

         
          <div className="page-title">
            <h1>
              <i className="fas fa-briefcase"></i> GYM's Staff Entry Form
            </h1>
          </div>


          <div className="staff-form-card">
            <div className="form-header">
              <h3>
                <i className="fas fa-clipboard-list"></i> Staff Details
              </h3>
            </div>

            <form onSubmit={handleSubmit}>
       
              {currentStep === 1 && (
                <div className="form-step">
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Enter Staff's Fullname <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                        className={errors.fullname ? "error" : ""}
                      />
                      {errors.fullname && (
                        <span className="error-message">{errors.fullname}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Enter a Username <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="@username"
                        className={errors.username ? "error" : ""}
                      />
                      {errors.username && (
                        <span className="error-message">{errors.username}</span>
                      )}
                    </div>
                  </div>

                  {(!mode || mode !== 'edit') && (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label>
                            Password <span className="required">*</span>
                          </label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter password"
                            className={errors.password ? "error" : ""}
                          />
                          {errors.password && (
                            <span className="error-message">{errors.password}</span>
                          )}
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>
                            Confirm Password <span className="required">*</span>
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm password"
                            className={errors.confirmPassword ? "error" : ""}
                          />
                          {errors.confirmPassword && (
                            <span className="error-message">{errors.confirmPassword}</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="form-actions">
                    <button
                      type="button"
                      className="next-btn"
                      onClick={handleNext}
                    >
                      Next <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              )}

     
              {currentStep === 2 && (
                <div className="form-step">
                  <div className="form-row-two">
                    <div className="form-group">
                      <label>
                        Gender <span className="required">*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        Designation <span className="required">*</span>
                      </label>
                      <select
                        name="designation"
                        value={formData.designation}
                        onChange={handleInputChange}
                      >
                        <option value="Trainer">Trainer</option>
                        <option value="Manager">Manager</option>
                        <option value="Cashier">Cashier</option>
                        <option value="Receptionist">Receptionist</option>
                        <option value="Cleaner">Cleaner</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Email <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="example@email.com"
                        className={errors.email ? "error" : ""}
                      />
                      {errors.email && (
                        <span className="error-message">{errors.email}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Address <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter address"
                        className={errors.address ? "error" : ""}
                      />
                      {errors.address && (
                        <span className="error-message">{errors.address}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Contact <span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        name="contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                        placeholder="Enter contact number"
                        className={errors.contact ? "error" : ""}
                      />
                      {errors.contact && (
                        <span className="error-message">{errors.contact}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="back-btn-form"
                      onClick={handleBack}
                    >
                      <i className="fas fa-arrow-left"></i> Back
                    </button>
                    <button type="submit" className="submit-btn">
                      {mode === 'edit' ? 'Update Staff' : 'Add Staff'}
                    </button>
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