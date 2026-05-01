import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PublicPortal.css";
import gymImg from "./assets/gym.jpeg";
import api from "./api/axios";
import axios from "axios";
import PasswordField from "./components/PasswordField.jsx";

const GYM_INFO = {
  name: "MuscleFit Gym",
  tagline: "Stronger Every Day",
  description: "Transform your body and mind at MuscleFit — a premium fitness center with world-class trainers, modern equipment, and a motivating community.",
  address: "123, Fitness Avenue, Andheri West",
  city: "Mumbai",
  state: "Maharashtra",
  contact: "+91 98765 43210",
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
    whatsapp: "https://wa.me/919876543210",
  },
  amenities: [
    { label: "AC", icon: "fa-snowflake" },
    { label: "Parking", icon: "fa-car" },
    { label: "Locker Room", icon: "fa-lock" },
    { label: "Steam Room", icon: "fa-hot-tub" },
    { label: "Protein Bar", icon: "fa-blender" },
    { label: "WiFi", icon: "fa-wifi" },
  ],
  gallery: [gymImg, gymImg, gymImg],
  stats: [
    { value: "500+", label: "Members" },
    { value: "15+", label: "Trainers" },
    { value: "50+", label: "Equipment" },
    { value: "5★", label: "Rating" },
  ],
  testimonials: [
    { name: "Riya Mehta", text: "Best gym in Mumbai! Lost 12kg in 3 months with their expert trainers.", avatar: "RM" },
    { name: "Arjun Patel", text: "Amazing facilities and very supportive community. Highly recommend!", avatar: "AP" },
    { name: "Sneha Joshi", text: "The Zumba and Yoga batches are fantastic. I feel so energetic now!", avatar: "SJ" },
  ],
  classes: [
    { id: 1, name: "Strength Training", level: "Beginner", duration: "60 min", capacity: 15, enrolled: 12, image: gymImg, description: "Build muscle and strength with our comprehensive weight training program." },
    { id: 2, name: "Cardio Blast", level: "Intermediate", duration: "45 min", capacity: 20, enrolled: 18, image: gymImg, description: "High-intensity cardio workout to boost your endurance and burn calories." },
    { id: 3, name: "Yoga Flow", level: "All Levels", duration: "75 min", capacity: 25, enrolled: 20, image: gymImg, description: "Relax and rejuvenate with our mindful yoga sessions." },
    { id: 4, name: "HIIT", level: "Advanced", duration: "30 min", capacity: 12, enrolled: 10, image: gymImg, description: "High-intensity interval training for maximum results in minimum time." },
    { id: 5, name: "Pilates", level: "Beginner", duration: "50 min", capacity: 18, enrolled: 15, image: gymImg, description: "Core strengthening and flexibility training with Pilates." },
    { id: 6, name: "Dance Fitness", level: "All Levels", duration: "55 min", capacity: 22, enrolled: 19, image: gymImg, description: "Fun dance-based workout combining cardio and coordination." },
  ],
  trainers: [
    { id: 1, name: "Priya Sharma", specialty: "Yoga & Pilates", experience: "8 years", rating: 4.9, sessions: 1250, image: gymImg, achievements: ["Certified Yoga Instructor", "Pilates Specialist", "Nutrition Coach"] },
    { id: 2, name: "Rahul Verma", specialty: "Strength Training", experience: "6 years", rating: 4.8, sessions: 980, image: gymImg, achievements: ["Powerlifting Champion", "Bodybuilding Coach", "Rehab Specialist"] },
    { id: 3, name: "Amit Singh", specialty: "Cardio & HIIT", experience: "5 years", rating: 4.9, sessions: 750, image: gymImg, achievements: ["Marathon Runner", "HIIT Expert", "Group Fitness Leader"] },
    { id: 4, name: "Sneha Patel", specialty: "Dance Fitness", experience: "7 years", rating: 4.7, sessions: 1100, image: gymImg, achievements: ["Dance Choreographer", "Zumba Instructor", "Fitness Model"] },
  ],
  hours: [
    { day: "Monday - Friday", time: "5:00 AM - 11:00 PM" },
    { day: "Saturday", time: "6:00 AM - 10:00 PM" },
    { day: "Sunday", time: "7:00 AM - 9:00 PM" },
  ],
};

const PLANS = [
  { id: 1, label: "Monthly",   duration: 30,  price: 999,  features: ["All Equipment", "1 PT Session", "Locker Access"], popular: false },
  { id: 2, label: "Quarterly", duration: 90,  price: 2499, features: ["All Equipment", "3 PT Sessions", "Locker Access", "Steam Room"], popular: true },
  { id: 3, label: "Annual",    duration: 365, price: 7999, features: ["All Equipment", "Unlimited PT", "Locker Access", "Steam Room", "Diet Plan"], popular: false },
];

const BATCHES = [
  { id: 1, batchType: "ZUMBA", slotType: "MORNING", startTime: "06:00", endTime: "07:00", trainer: "Priya Sharma", capacity: 20, enrolled: 20 },
  { id: 2, batchType: "YOGA",  slotType: "MORNING", startTime: "07:00", endTime: "08:00", trainer: "Rahul Verma",  capacity: 15, enrolled: 10 },
  { id: 3, batchType: "DANCE", slotType: "MORNING", startTime: "08:00", endTime: "09:00", trainer: "Amit Singh",   capacity: 25, enrolled: 18 },
  { id: 4, batchType: "ZUMBA", slotType: "EVENING", startTime: "18:00", endTime: "19:00", trainer: "Priya Sharma", capacity: 20, enrolled: 12 },
  { id: 5, batchType: "YOGA",  slotType: "EVENING", startTime: "19:00", endTime: "20:00", trainer: "Rahul Verma",  capacity: 15, enrolled: 8  },
];

const BATCH_TYPES = ["ALL", "ZUMBA", "YOGA", "DANCE"];
const BATCH_ICONS = { ZUMBA: "fa-music", YOGA: "fa-spa", DANCE: "fa-star" };
const CLASS_LEVELS = ["ALL", "Beginner", "Intermediate", "Advanced", "All Levels"];

const EMPTY_FORM = { name: "", email: "", phone: "", password: "", confirmPassword: "", batchId: "", couponCode: "FREEDEMO", inquirySource: "", demoDate: "" };

export default function PublicPortal() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("home");
  const [batchFilter, setBatchFilter]     = useState("ALL");
  const [classFilter, setClassFilter]     = useState("ALL");
  const [menuOpen, setMenuOpen]           = useState(false);
  const [scrolled, setScrolled]           = useState(false);

  const [demoForm, setDemoForm]           = useState(EMPTY_FORM);
  const [demoErrors, setDemoErrors]       = useState({});
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoLoading, setDemoLoading]     = useState(false);
  const [demoApiError, setDemoApiError]   = useState("");
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filteredBatches = batchFilter === "ALL" ? BATCHES : BATCHES.filter(b => b.batchType === batchFilter);
  const filteredClasses = classFilter === "ALL" ? GYM_INFO.classes : GYM_INFO.classes.filter(c => c.level === classFilter);
  const activePlans     = [...PLANS].sort((a, b) => a.price - b.price);
  const selectedBatch   = BATCHES.find(b => String(b.id) === demoForm.batchId);

  const validate = () => {
    const e = {};
    if (!demoForm.name.trim())                               e.name    = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(demoForm.email)) e.email   = "Valid email required";
    if (!/^\d{10}$/.test(demoForm.phone))                    e.phone   = "10-digit phone required";
    if (!demoForm.batchId)                                   e.batchId = "Select a batch";
    if (!demoForm.password)                                  e.password = "Password is required";
    else if (demoForm.password.length < 6)                   e.password = "Minimum 6 characters";
    else if (demoForm.confirmPassword !== demoForm.password) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setDemoErrors(errs); return; }
    setDemoApiError(""); setDemoErrors({}); setDemoLoading(true);
    let bookingSucceeded = false;
    try {
      let token = null;
      let visitorId = null;

      // Step 1 — register visitor
      try {
        await api.post("/api/auth/visitor/register", {
          name: demoForm.name,
          email: demoForm.email,
          phone: demoForm.phone,
          password: demoForm.password,
          inquirySource: demoForm.inquirySource || null,
          demoDatePreference: demoForm.demoDate || null,
          demoTimeSlotPreference: selectedBatch ? selectedBatch.slotType : null,
          preferredBatches: selectedBatch
            ? [{
                batchType: selectedBatch.batchType,
                timeSlot: `${selectedBatch.startTime} - ${selectedBatch.endTime}`,
              }]
            : [],
        });
      } catch (regErr) {
        if (regErr.response?.status === 409) {
          setDemoApiError("This email is already registered. Please login first, then book a demo.");
          setDemoLoading(false); return;
        }
        throw regErr;
      }

      if (!selectedBatch) {
        setDemoApiError("Please select a demo batch before booking.");
        setDemoLoading(false);
        return;
      }

      // Step 2 — login to get token + visitorId
      const loginRes = await api.post("/api/auth/login", { email: demoForm.email, password: demoForm.password });
      token     = loginRes.data?.token;
      visitorId = loginRes.data?.visitorId ?? loginRes.data?.id ?? null;
      console.log("Login response:", { token: token?.substring(0,20), visitorId });

      if (!token || !visitorId) {
        setDemoApiError("Login failed after registration. Please try again.");
        setDemoLoading(false); return;
      }

      // Step 3 — book demo using raw axios to avoid interceptor sending old token
      console.log("Step 3: booking with visitorId=", visitorId, "token=", token?.substring(0,20));
      const bookRes = await axios.post(
        "http://localhost:8080/api/demo/book",
        {
          visitorId,
          batchType:  selectedBatch.batchType,
          slotType:   selectedBatch.slotType,
          startTime:  selectedBatch.startTime,
          endTime:    selectedBatch.endTime,
          demoDate:   demoForm.demoDate || null,
          couponCode: demoForm.couponCode || null,
        },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      console.log("Step 3 SUCCESS:", bookRes.data);

      // Booking confirmed — store visitor auth and redirect to visitor dashboard
      localStorage.setItem('token',     token);
      localStorage.setItem('role',      'VISITOR');
      localStorage.setItem('name',      demoForm.name);
      localStorage.setItem('email',     demoForm.email);
      localStorage.setItem('visitorId', String(visitorId));
      localStorage.setItem('_vpass',    demoForm.password);
      if (bookRes.data?.batchType) localStorage.setItem('batchType', bookRes.data.batchType);
      if (bookRes.data?.slotType)  localStorage.setItem('slotType',  bookRes.data.slotType);

      setDemoApiError("");
      setBookingResult(bookRes.data);
      setDemoSubmitted(true);
      bookingSucceeded = true;

    } catch (err) {
      if (bookingSucceeded) return; // booking worked, ignore any post-success errors
      console.error("Demo booking error:", err.response?.status, err.response?.data, err.message);
      const msg = err.response?.data;
      const status = err.response?.status;
      if (status === 403) setDemoApiError("Session expired. Please refresh and try again.");
      else setDemoApiError(typeof msg === "string" ? msg : msg?.message || err.message || "Booking failed. Please try again.");
    } finally {
      setDemoLoading(false);
    }
  };

  const resetDemo = () => {
    setDemoSubmitted(false); setDemoApiError(""); setBookingResult(null);
    setDemoForm(EMPTY_FORM); setDemoErrors({});
  };

  const navItems = [
    { key: "home",    label: "Home",      icon: "fa-home"     },
    { key: "classes", label: "Classes",   icon: "fa-dumbbell" },
    { key: "trainers", label: "Trainers", icon: "fa-users"    },
    { key: "plans",   label: "Plans",     icon: "fa-tags"     },
    { key: "batches", label: "Batches",   icon: "fa-calendar" },
    { key: "demo",    label: "Book Demo", icon: "fa-calendar-check" },
  ];

  const goTo = (key) => { setActiveSection(key); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="pp-root">

      {/* ── NAV ── */}
      <nav className={`pp-nav ${scrolled ? "pp-nav--scrolled" : ""}`}>
        <div className="pp-nav-brand" onClick={() => goTo("home")}>
          <span className="pp-brand-icon"><i className="fas fa-dumbbell" /></span>
          <span className="pp-brand-text">MuscleFit</span>
        </div>

        <div className={`pp-nav-links ${menuOpen ? "open" : ""}`}>
          {navItems.map(n => (
            <button key={n.key}
              className={`pp-nav-btn ${activeSection === n.key ? "active" : ""}`}
              onClick={() => goTo(n.key)}>
              <i className={`fas ${n.icon}`} /> {n.label}
            </button>
          ))}
          <button className="pp-login-btn mobile-only" onClick={() => navigate("/login")}>
            <i className="fas fa-sign-in-alt" /> Login
          </button>
        </div>

        <div className="pp-nav-right">
          <button className="pp-login-btn desktop-only" onClick={() => navigate("/login")}>
            <i className="fas fa-sign-in-alt" /> Login
          </button>
          <button className="pp-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="menu">
            <span className={menuOpen ? "open" : ""} />
            <span className={menuOpen ? "open" : ""} />
            <span className={menuOpen ? "open" : ""} />
          </button>
        </div>
      </nav>

      {menuOpen && <div className="pp-overlay" onClick={() => setMenuOpen(false)} />}

      <main className="pp-main">

        {/* ══ HOME ══ */}
        {activeSection === "home" && (
          <div className="pp-section">

            {/* Hero */}
            <div className="pp-hero">
              <div className="pp-hero-copy">
                <span className="pp-hero-topline">Premium training in Andheri West</span>
                <h1 className="pp-hero-title">Transform your body. Gain strength, confidence and energy.</h1>
                <p className="pp-hero-desc">MuscleFit Gym delivers expert coaching, modern equipment, and vibrant small-group classes for every level. Start your fitness journey with a proven program and a motivating community.</p>
                <div className="pp-hero-btns">
                  <button className="pp-btn pp-btn--primary" onClick={() => goTo("demo")}>
                    <i className="fas fa-calendar-check" /> Book Free Demo
                  </button>
                  <button className="pp-btn pp-btn--white" onClick={() => goTo("plans")}>
                    <i className="fas fa-tags" /> View Plans
                  </button>
                </div>
                <div className="pp-hero-features">
                  <span>24/7 access</span>
                  <span>Personal training</span>
                  <span>Nutrition support</span>
                </div>
                <div className="pp-hero-quickstats">
                  <div>
                    <strong>500+</strong>
                    <small>Active members</small>
                  </div>
                  <div>
                    <strong>15+</strong>
                    <small>Expert trainers</small>
                  </div>
                  <div>
                    <strong>30+</strong>
                    <small>Weekly classes</small>
                  </div>
                </div>
              </div>

              <div className="pp-hero-visual">
                <div className="pp-hero-image-wrap">
                  <img src={gymImg} alt="gym" className="pp-hero-img" />
                  <div className="pp-image-tag">Starting at ₹999 / month</div>
                  <div className="pp-hero-card">
                    <div className="pp-hero-card-item">
                      <i className="fas fa-user-check" /> Dedicated coach support
                    </div>
                    <div className="pp-hero-card-item">
                      <i className="fas fa-dumbbell" /> Strength + cardio training
                    </div>
                    <div className="pp-hero-card-item">
                      <i className="fas fa-heartbeat" /> Safe progress tracking
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="pp-stats pp-stats--home">
              {GYM_INFO.stats.map(s => (
                <div key={s.label} className="pp-stat">
                  <span className="pp-stat-value">{s.value}</span>
                  <span className="pp-stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Info Cards */}
            <div className="pp-info-grid">
              <div className="pp-info-card">
                <div className="pp-info-icon"><i className="fas fa-map-marker-alt" /></div>
                <div>
                  <h4>Location</h4>
                  <p>{GYM_INFO.address}, {GYM_INFO.city}, {GYM_INFO.state}</p>
                </div>
              </div>
              <div className="pp-info-card">
                <div className="pp-info-icon"><i className="fas fa-phone" /></div>
                <div>
                  <h4>Contact Us</h4>
                  <p>{GYM_INFO.contact}</p>
                </div>
              </div>
              <div className="pp-info-card">
                <div className="pp-info-icon"><i className="fas fa-share-alt" /></div>
                <div>
                  <h4>Follow Us</h4>
                  <div className="pp-social">
                    <a href={GYM_INFO.social.instagram} target="_blank" rel="noreferrer" className="pp-social-btn ig"><i className="fab fa-instagram" /></a>
                    <a href={GYM_INFO.social.facebook}  target="_blank" rel="noreferrer" className="pp-social-btn fb"><i className="fab fa-facebook"  /></a>
                    <a href={GYM_INFO.social.youtube}   target="_blank" rel="noreferrer" className="pp-social-btn yt"><i className="fab fa-youtube"   /></a>
                    <a href={GYM_INFO.social.whatsapp}  target="_blank" rel="noreferrer" className="pp-social-btn wa"><i className="fab fa-whatsapp"  /></a>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="pp-section-header">
              <h2 className="pp-section-title">Our Amenities</h2>
              <div className="pp-title-line" />
            </div>
            <div className="pp-amenities">
              {GYM_INFO.amenities.map(a => (
                <div key={a.label} className="pp-amenity">
                  <i className={`fas ${a.icon}`} />
                  <span>{a.label}</span>
                </div>
              ))}
            </div>

            {/* Gallery */}
            <div className="pp-section-header">
              <h2 className="pp-section-title">Gallery</h2>
              <div className="pp-title-line" />
            </div>
            <div className="pp-gallery">
              {GYM_INFO.gallery.map((img, i) => (
                <div key={i} className="pp-gallery-item">
                  <img src={img} alt={`gym-${i}`} />
                  <div className="pp-gallery-overlay"><i className="fas fa-expand" /></div>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="pp-section-header">
              <h2 className="pp-section-title">What Members Say</h2>
              <div className="pp-title-line" />
            </div>
            <div className="pp-testimonials">
              {GYM_INFO.testimonials.map(t => (
                <div key={t.name} className="pp-testimonial">
                  <div className="pp-testimonial-stars">{"★★★★★"}</div>
                  <p className="pp-testimonial-text">"{t.text}"</p>
                  <div className="pp-testimonial-author">
                    <div className="pp-avatar">{t.avatar}</div>
                    <span>{t.name}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="pp-stats" style={{ marginTop: '2rem' }}>
              <div className="pp-stat">
                <span className="pp-stat-value">500+</span>
                <span className="pp-stat-label">Success Stories</span>
              </div>
              <div className="pp-stat">
                <span className="pp-stat-value">4.9★</span>
                <span className="pp-stat-label">Average Rating</span>
              </div>
              <div className="pp-stat">
                <span className="pp-stat-value">95%</span>
                <span className="pp-stat-label">Goal Achievement</span>
              </div>
            </div>

            {/* CTA Banner */}
            <div className="pp-cta-banner">
              <div>
                <h3>Ready to Start Your Fitness Journey?</h3>
                <p>Join 500+ members who transformed their lives at MuscleFit</p>
              </div>
              <button className="pp-btn pp-btn--white" onClick={() => goTo("demo")}>
                <i className="fas fa-rocket" /> Get Started Free
              </button>
            </div>
          </div>
        )}

        {/* ══ CLASSES ══ */}
        {activeSection === "classes" && (
          <div className="pp-section">
            <div className="pp-section-header">
              <h2 className="pp-section-title">Our Classes</h2>
              <div className="pp-title-line" />
              <p className="pp-section-sub">Find the perfect class for your fitness level</p>
            </div>
            <div className="pp-filter-row">
              {CLASS_LEVELS.map(level => (
                <button key={level}
                  className={`pp-filter-btn ${classFilter === level ? "active" : ""}`}
                  onClick={() => setClassFilter(level)}>
                  {level}
                </button>
              ))}
            </div>
            <div className="pp-classes-grid">
              {filteredClasses.map(cls => (
                <div key={cls.id} className="pp-class-card">
                  <img src={cls.image} alt={cls.name} className="pp-class-img" />
                  <div className="pp-class-content">
                    <h3 className="pp-class-title">{cls.name}</h3>
                    <div className="pp-class-meta">
                      <span><i className="fas fa-clock" /> {cls.duration}</span>
                      <span><i className="fas fa-users" /> {cls.level}</span>
                      <span><i className="fas fa-user-friends" /> {cls.enrolled}/{cls.capacity}</span>
                    </div>
                    <p>{cls.description}</p>
                    <button className="pp-class-btn" onClick={() => goTo("demo")}>
                      Reserve Spot <i className="fas fa-arrow-right" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TRAINERS ══ */}
        {activeSection === "trainers" && (
          <div className="pp-section">
            <div className="pp-section-header">
              <h2 className="pp-section-title">Meet Our Trainers</h2>
              <div className="pp-title-line" />
              <p className="pp-section-sub">Expert trainers dedicated to your success</p>
            </div>
            <div className="pp-trainers-grid">
              {GYM_INFO.trainers.map(trainer => (
                <div key={trainer.id} className="pp-trainer-card">
                  <img src={trainer.image} alt={trainer.name} className="pp-trainer-img" />
                  <h3 className="pp-trainer-name">{trainer.name}</h3>
                  <p className="pp-trainer-specialty">{trainer.specialty}</p>
                  <div className="pp-trainer-stats">
                    <div className="pp-trainer-stat">
                      <div className="pp-trainer-stat-value">{trainer.experience}</div>
                      <div>Experience</div>
                    </div>
                    <div className="pp-trainer-stat">
                      <div className="pp-trainer-stat-value">{trainer.rating}★</div>
                      <div>Rating</div>
                    </div>
                    <div className="pp-trainer-stat">
                      <div className="pp-trainer-stat-value">{trainer.sessions}</div>
                      <div>Sessions</div>
                    </div>
                  </div>
                  <ul>
                    {trainer.achievements.map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                  <button className="pp-trainer-btn" onClick={() => goTo("demo")}>
                    Book Session <i className="fas fa-calendar-plus" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ PLANS ══ */}
        {activeSection === "plans" && (
          <div className="pp-section">
            <div className="pp-section-header">
              <h2 className="pp-section-title">Membership Plans</h2>
              <div className="pp-title-line" />
              <p className="pp-section-sub">Choose the plan that fits your goals</p>
            </div>
            <div className="pp-cta-banner" style={{ marginBottom: '3rem' }}>
              <div>
                <h3>🎉 First Month Free!</h3>
                <p>Start your fitness journey with no upfront cost</p>
              </div>
              <button className="pp-btn pp-btn--white" onClick={() => goTo("demo")}>
                <i className="fas fa-rocket" /> Claim Free Month
              </button>
            </div>
            <div className="pp-plans-grid">
              {activePlans.map(p => (
                <div key={p.id} className={`pp-plan-card ${p.popular ? "popular" : ""}`}>
                  {p.popular && <div className="pp-popular-badge"><i className="fas fa-crown" /> Most Popular</div>}
                  <div className="pp-plan-icon"><i className="fas fa-medal" /></div>
                  <h3 className="pp-plan-label">{p.label}</h3>
                  <div className="pp-plan-price">
                    <span className="pp-price-currency">₹</span>
                    <span className="pp-price-amount">{p.price}</span>
                  </div>
                  <div className="pp-plan-duration"><i className="fas fa-clock" /> {p.duration} days</div>
                  <ul className="pp-plan-features">
                    {p.features.map(f => (
                      <li key={f}><i className="fas fa-check-circle" /> {f}</li>
                    ))}
                  </ul>
                  <button className="pp-btn pp-btn--plan" onClick={() => goTo("demo")}>
                    Get Started <i className="fas fa-arrow-right" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ BATCHES ══ */}
        {activeSection === "batches" && (
          <div className="pp-section">
            <div className="pp-section-header">
              <h2 className="pp-section-title">Batch Schedule</h2>
              <div className="pp-title-line" />
              <p className="pp-section-sub">Pick a batch that suits your timing</p>
            </div>
            <div className="pp-filter-row">
              {BATCH_TYPES.map(t => (
                <button key={t}
                  className={`pp-filter-btn ${batchFilter === t ? "active" : ""}`}
                  onClick={() => setBatchFilter(t)}>
                  {t !== "ALL" && <i className={`fas ${BATCH_ICONS[t]}`} />} {t}
                </button>
              ))}
            </div>
            {filteredBatches.length === 0 ? (
              <p className="pp-empty">No batches currently scheduled.</p>
            ) : (
              <div className="pp-batches-grid">
                {filteredBatches.map(b => {
                  const isFull = b.enrolled >= b.capacity;
                  const pct = Math.round((b.enrolled / b.capacity) * 100);
                  return (
                    <div key={b.id} className={`pp-batch-card ${isFull ? "full" : ""}`}>
                      <div className="pp-batch-header">
                        <div className="pp-batch-icon"><i className={`fas ${BATCH_ICONS[b.batchType] || "fa-dumbbell"}`} /></div>
                        <div className="pp-batch-type">{b.batchType}</div>
                        {isFull
                          ? <span className="pp-badge pp-badge--full">Full</span>
                          : <span className="pp-badge pp-badge--open">Open</span>}
                      </div>
                      <div className="pp-batch-info">
                        <span><i className="fas fa-clock" /> {b.startTime}–{b.endTime}</span>
                        <span><i className={`fas ${b.slotType === "MORNING" ? "fa-sun" : "fa-moon"}`} /> {b.slotType}</span>
                        <span><i className="fas fa-user-tie" /> {b.trainer}</span>
                      </div>
                      <div className="pp-batch-capacity-bar">
                        <div className="pp-cap-label">
                          <span><i className="fas fa-users" /> {b.enrolled}/{b.capacity}</span>
                          <span>{pct}% full</span>
                        </div>
                        <div className="pp-cap-track">
                          <div className="pp-cap-fill" style={{ width: `${pct}%`, background: isFull ? "#ef4444" : undefined }} />
                        </div>
                      </div>
                      {!isFull && (
                        <button className="pp-btn pp-btn--sm"
                          onClick={() => { setDemoForm(d => ({ ...d, batchId: String(b.id) })); goTo("demo"); }}>
                          Select for Demo <i className="fas fa-arrow-right" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ DEMO ══ */}
        {activeSection === "demo" && (
          <div className="pp-section">
            <div className="pp-section-header">
              <h2 className="pp-section-title">Book a Free Demo</h2>
              <div className="pp-title-line" />
              <p className="pp-section-sub">Fill in your details and we'll confirm your session</p>
            </div>

            {demoSubmitted ? (
              <div className="pp-success">
                <div className="pp-success-icon"><i className="fas fa-check-circle" /></div>
                <h3>Demo Booked Successfully!</h3>
                {bookingResult && (
                  <div className="pp-booking-details">
                    {bookingResult.batchType  && <div className="pp-detail-row"><i className="fas fa-layer-group" /><span><b>Batch:</b> {bookingResult.batchType}</span></div>}
                    {bookingResult.slotType   && <div className="pp-detail-row"><i className="fas fa-sun" /><span><b>Slot:</b> {bookingResult.slotType}</span></div>}
                    {bookingResult.timeSlot   && <div className="pp-detail-row"><i className="fas fa-clock" /><span><b>Time:</b> {bookingResult.timeSlot}</span></div>}
                    {bookingResult.finalAmount !== undefined && (
                      <div className="pp-detail-row"><i className="fas fa-rupee-sign" /><span><b>Fee:</b> {bookingResult.finalAmount === 0 ? "Free" : `₹${bookingResult.finalAmount}`}</span></div>
                    )}
                    {bookingResult.message && <div className="pp-detail-row"><i className="fas fa-info-circle" /><span>{bookingResult.message}</span></div>}
                  </div>
                )}
                <p>Your demo session is confirmed. Visit your dashboard to track your journey.</p>
                <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap", marginTop:"1rem" }}>
                  <button className="pp-btn pp-btn--primary" onClick={() => navigate("/visitor-dashboard")}>
                    <i className="fas fa-tachometer-alt" /> Go to My Dashboard
                  </button>
                  <button className="pp-btn pp-btn--white" onClick={resetDemo}>Book Another</button>
                </div>
              </div>
            ) : (
              <form className="pp-form" onSubmit={handleDemoSubmit} noValidate autoComplete="off">
                <div className="pp-form-row">
                  <div className="pp-field">
                    <label><i className="fas fa-user" /> Full Name *</label>
                    <input value={demoForm.name}
                      onChange={e => setDemoForm(d => ({ ...d, name: e.target.value }))}
                      placeholder="Your full name" className={demoErrors.name ? "err" : ""} />
                    {demoErrors.name && <span className="pp-err">{demoErrors.name}</span>}
                  </div>
                  <div className="pp-field">
                    <label><i className="fas fa-envelope" /> Email *</label>
                    <input type="email" value={demoForm.email}
                      onChange={e => setDemoForm(d => ({ ...d, email: e.target.value }))}
                      placeholder="you@example.com" className={demoErrors.email ? "err" : ""} />
                    {demoErrors.email && <span className="pp-err">{demoErrors.email}</span>}
                  </div>
                </div>
                <div className="pp-form-row">
                  <div className="pp-field">
                    <label><i className="fas fa-lock" /> Password *</label>
                      <PasswordField
                        value={demoForm.password}
                        onChange={e => setDemoForm(d => ({ ...d, password: e.target.value }))}
                        placeholder="Min. 6 characters"
                        autoComplete="new-password"
                        inputClassName={demoErrors.password ? "err" : ""}
                      />
                    {demoErrors.password && <span className="pp-err">{demoErrors.password}</span>}
                  </div>
                  <div className="pp-field">
                    <label><i className="fas fa-lock" /> Confirm Password *</label>
                      <PasswordField
                        value={demoForm.confirmPassword}
                        onChange={e => setDemoForm(d => ({ ...d, confirmPassword: e.target.value }))}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                        inputClassName={demoErrors.confirmPassword ? "err" : ""}
                      />
                    {demoErrors.confirmPassword && <span className="pp-err">{demoErrors.confirmPassword}</span>}
                  </div>
                </div>
                <div className="pp-form-row">
                  <div className="pp-field">
                    <label><i className="fas fa-phone" /> Phone *</label>
                    <input type="tel" value={demoForm.phone}
                      onChange={e => setDemoForm(d => ({ ...d, phone: e.target.value }))}
                      placeholder="10-digit number" maxLength={10} className={demoErrors.phone ? "err" : ""} />
                    {demoErrors.phone && <span className="pp-err">{demoErrors.phone}</span>}
                  </div>
                  <div className="pp-field">
                    <label><i className="fas fa-tag" /> Coupon Code</label>
                    <select
                      value={demoForm.couponCode}
                      onChange={e => setDemoForm(d => ({ ...d, couponCode: e.target.value }))}>
                      <option value="FREEDEMO">FREEDEMO — 100% off (Free Demo)</option>
                      <option value="">No coupon — pay ₹100</option>
                    </select>
                    {demoForm.couponCode === "FREEDEMO"
                      ? <span style={{ fontSize: "0.78rem", color: "#22c55e", marginTop: "0.3rem", display: "block" }}><i className="fas fa-check-circle" /> Demo fee waived — you pay ₹0</span>
                      : <span style={{ fontSize: "0.78rem", color: "var(--primary)", marginTop: "0.3rem", display: "block" }}><i className="fas fa-info-circle" /> Demo fee: ₹100</span>
                    }
                  </div>
                </div>
                <div className="pp-field">
                  <label><i className="fas fa-calendar-alt" /> Select Batch *</label>
                  <select value={demoForm.batchId}
                    onChange={e => setDemoForm(d => ({ ...d, batchId: e.target.value }))}
                    className={demoErrors.batchId ? "err" : ""}>
                    <option value="">Choose a batch</option>
                    {BATCHES.filter(b => b.enrolled < b.capacity).map(b => (
                      <option key={b.id} value={b.id}>
                        {b.batchType} · {b.slotType} · {b.startTime}–{b.endTime} ({b.trainer})
                      </option>
                    ))}
                  </select>
                  {demoErrors.batchId && <span className="pp-err">{demoErrors.batchId}</span>}
                </div>
                {selectedBatch && (
                  <div className="pp-batch-summary">
                    <i className="fas fa-info-circle" />
                    <span><b>{selectedBatch.batchType}</b> · {selectedBatch.slotType} · {selectedBatch.startTime}–{selectedBatch.endTime} with {selectedBatch.trainer}</span>
                  </div>
                )}
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '1.5rem' }}>
                  <h4 style={{ color: 'var(--primary)', margin: '0 0 1rem', fontSize: '1.1rem' }}>What's Included in Your Free Demo:</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fas fa-check-circle" style={{ color: 'var(--primary)' }} />
                      <span>Personal trainer consultation</span>
                    </li>
                    <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fas fa-check-circle" style={{ color: 'var(--primary)' }} />
                      <span>Facility tour and equipment demo</span>
                    </li>
                    <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fas fa-check-circle" style={{ color: 'var(--primary)' }} />
                      <span>Customized fitness assessment</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fas fa-check-circle" style={{ color: 'var(--primary)' }} />
                      <span>Membership options discussion</span>
                    </li>
                  </ul>
                </div>
                <div className="pp-field">
                  <label><i className="fas fa-search" /> How did you hear about us?</label>
                  <select value={demoForm.inquirySource}
                    onChange={e => setDemoForm(d => ({ ...d, inquirySource: e.target.value }))}>
                    <option value="">Select source (optional)</option>
                    {["Instagram", "Google", "Walk-in", "Referral", "Friend"].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="pp-field">
                  <label><i className="fas fa-calendar-alt" /> Preferred Demo Date</label>
                  <input
                    type="date"
                    value={demoForm.demoDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => setDemoForm(d => ({ ...d, demoDate: e.target.value }))}
                  />
                  <span style={{ fontSize:"0.78rem", color:"#94a3b8", marginTop:"0.25rem", display:"block" }}>
                    Optional — we'll confirm the exact date with you
                  </span>
                </div>
                {demoApiError && (
                  <div className="pp-api-error">
                    <i className="fas fa-exclamation-circle" /> {demoApiError}
                  </div>
                )}
                <button type="submit" className="pp-btn pp-btn--primary pp-btn--full" disabled={demoLoading}>
                  {demoLoading
                    ? <><i className="fas fa-spinner fa-spin" /> Booking…</>
                    : <><i className="fas fa-calendar-check" /> Confirm Demo Booking</>}
                </button>
              </form>
            )}
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="pp-footer">
        <div className="pp-footer-content">
          <div className="pp-footer-section">
            <h4>About Us</h4>
            <p>{GYM_INFO.description}</p>
            <div className="pp-social-links">
              <a href={GYM_INFO.social.instagram} target="_blank" rel="noreferrer" className="pp-social-btn">
                <i className="fab fa-instagram" />
              </a>
              <a href={GYM_INFO.social.facebook} target="_blank" rel="noreferrer" className="pp-social-btn">
                <i className="fab fa-facebook" />
              </a>
              <a href={GYM_INFO.social.youtube} target="_blank" rel="noreferrer" className="pp-social-btn">
                <i className="fab fa-youtube" />
              </a>
              <a href={GYM_INFO.social.whatsapp} target="_blank" rel="noreferrer" className="pp-social-btn">
                <i className="fab fa-whatsapp" />
              </a>
            </div>
          </div>
          <div className="pp-footer-section">
            <h4>Contact Info</h4>
            <div className="pp-contact-info">
              <div className="pp-contact-item">
                <i className="fas fa-map-marker-alt" />
                <span>{GYM_INFO.address}, {GYM_INFO.city}, {GYM_INFO.state}</span>
              </div>
              <div className="pp-contact-item">
                <i className="fas fa-phone" />
                <span>{GYM_INFO.contact}</span>
              </div>
              <div className="pp-contact-item">
                <i className="fas fa-envelope" />
                <span>info@musclefit.com</span>
              </div>
            </div>
          </div>
          <div className="pp-footer-section">
            <h4>Opening Hours</h4>
            <div className="pp-hours-card">
              <h5 className="pp-hours-title">Visit Us</h5>
              <div className="pp-hours-list">
                {GYM_INFO.hours.map((hour, i) => (
                  <div key={i} className="pp-hours-item">
                    <span>{hour.day}</span>
                    <span>{hour.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pp-footer-section">
            <h4>Quick Links</h4>
            <div className="pp-footer-links">
              {navItems.map(item => (
                <a key={item.key} href="#" onClick={(e) => { e.preventDefault(); goTo(item.key); }} className="pp-footer-link">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="pp-footer-bottom">
          <p>© 2025 MuscleFit Gym. All rights reserved. | Terms of Service | Privacy Policy</p>
        </div>
        <div className="pp-footer-accent"></div>
      </footer>
    </div>
  );
}
