import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { unifiedLogin, sendOtp, verifyOtp, storeAuth, getRoleRedirect } from '../api/authService';
import { getMemberByEmail } from '../api/coreService';
import api from '../api/axios';
import { useAuth } from '../AuthContext';
import PasswordField from '../components/PasswordField.jsx';

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  // Show success banner if redirected from Google registration
  const googleSuccess    = location.state?.googleSuccess;
  const googleMsg        = location.state?.msg;
  const googleError      = location.state?.googleError;
  const switchToRegister = location.state?.switchToRegister;

  // Auto-switch to Register tab when redirected from "no account" Google login
  useEffect(() => { if (switchToRegister) setMode('register'); }, [switchToRegister]);
  const [mode, setMode]       = useState('login');   // 'login' | 'register'
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'otp'
  const [status, setStatus]   = useState(null);
  const [loading, setLoading] = useState(false);

  // login / register fields
  const [form, setForm] = useState({ name: '', email: '', contact: '', password: '' });

  // otp fields
  const [phone, setPhone]     = useState('');
  const [otp, setOtp]         = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpHint, setOtpHint] = useState('');

  const clearForm = () => setForm({ name: '', email: '', contact: '', password: '' });

  const handleInput = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    localStorage.setItem('google_intent', 'login');
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleGoogleRegister = () => {
    setGoogleLoading(true);
    localStorage.setItem('google_intent', 'register');
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const GoogleBtn = ({ onClick, label }) => (
    <button type="button" disabled={googleLoading}
      style={{
        ...styles.googleBtn,
        opacity: googleLoading ? 0.75 : 1,
        background: googleLoading ? '#2a2a35' : '#1A1A1D',
        border: googleLoading ? '1px solid #6366f1' : '1px solid #4b4b55',
        cursor: googleLoading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
      }}
      onClick={onClick}>
      {googleLoading ? (
        <>
          <span style={{ display:'inline-block', width:18, height:18, border:'2px solid #6366f1', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
          Connecting to Google…
        </>
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.1C9.5 35.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C41.3 35.3 44 30 44 24c0-1.3-.1-2.7-.4-3.9z"/>
          </svg>
          {label}
        </>
      )}
    </button>
  );

  const redirect = (data) => {
    storeAuth({ ...data, id: data.id });
    login({ ...data, role: data.role?.toLowerCase() });
    navigate(getRoleRedirect(data.role));
  };

  // ── REGISTER ──────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim()) {
      setStatus({ type: 'error', message: 'Please fill all fields.' }); return;
    }
    setStatus(null); setLoading(true);
    try {
      await api.post('/api/auth/visitor/register', {
        name:     form.name,
        email:    form.email,
        phone:    form.contact,
        password: form.password,
        preferredBatches: [],
      });
      // auto-login after register
      const { data } = await unifiedLogin(form.email, form.password);
      setStatus({ type: 'success', message: 'Account created! Redirecting…' });
      setTimeout(() => {
        redirect(data);
      }, 1500);
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message || err.response?.data;
      if (status === 409) setStatus({ type: 'error', message: 'Email already registered. Please login.' });
      else setStatus({ type: 'error', message: typeof msg === 'string' ? msg : 'Registration failed. Try again.' });
    } finally { setLoading(false); }
  };

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus(null); setLoading(true);
    try {
      const { data } = await unifiedLogin(form.email, form.password);
      setStatus({ type: 'success', message: 'Login successful! Redirecting…' });
      setTimeout(() => {
        redirect(data);
      }, 900);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      setStatus({ type: 'error', message: typeof msg === 'string' ? msg : 'Invalid email or password.' });
    } finally { setLoading(false); }
  };

  // ── OTP ───────────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(phone)) { setStatus({ type: 'error', message: 'Enter a valid 10-digit phone number' }); return; }
    setStatus(null); setLoading(true);
    try {
      const { data } = await api.post('/api/auth/otp/send', { phone });
      setOtpSent(true);
      if (typeof data === 'string') setOtpHint(data);
      setStatus({ type: 'success', message: 'OTP sent!' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to send OTP' });
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    setStatus(null); setLoading(true);
    try {
      const { data } = await api.post('/api/auth/otp/verify', { phone, otp });
      setStatus({ type: 'success', message: 'Verified! Redirecting…' });
      setTimeout(() => {
        redirect(data).catch((e) => {
          setStatus({ type: 'error', message: e?.message || 'Unable to map member to customers table.' });
        });
      }, 900);
    } catch (err) {
      setStatus({ type: 'error', message: 'Invalid or expired OTP' });
    } finally { setLoading(false); }
  };

  // ── STYLES (exact same as original LoginScreen) ───────────────────────────
  const styles = {
    videoContainer: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -3, overflow: 'hidden' },
    video:    { width: '100%', height: '100%', objectFit: 'cover' },
    overlay:  { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(26,26,29,0.7)', zIndex: -2 },
    container:{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', width: '100vw', position: 'relative', zIndex: 10 },
    card:     { width: '100%', maxWidth: '420px', background: '#292931', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#FFFFFF', boxSizing: 'border-box' },
    heading:  { textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #8e2bbd' },
    headingTitle: { fontSize: '3rem', fontWeight: 700, background: 'linear-gradient(135deg,#8e2bbd 0%,#98cfff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0, lineHeight: 1.1 },
    headingSubtitle: { fontSize: '0.9rem', color: '#98cfff', fontWeight: 500, margin: '0.25rem 0 0', letterSpacing: '0.05em', textTransform: 'uppercase' },
    tabs:     { display: 'flex', marginBottom: '1.5rem', marginTop: '1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #0d063b' },
    tabBtn:   { flex: 1, padding: '0.75rem 0', border: 'none', background: '#4b4b55', color: '#fff', cursor: 'pointer', fontWeight: 500, fontSize: '1rem', fontFamily: 'inherit' },
    tabActive:{ background: '#3e0994', color: '#FFFFFF' },
    field:    { marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' },
    label:    { fontSize: '1rem', color: '#98cfff' },
    input:    { padding: '0.75rem 0.875rem', borderRadius: '8px', border: '1px solid #3e0994', background: '#1A1A1D', color: '#FFFFFF', outline: 'none', fontSize: '1rem', boxSizing: 'border-box', width: '100%' },
    submitBtn:{ marginTop: '0.5rem', width: '100%', padding: '0.75rem 0.875rem', borderRadius: '8px', border: 'none', background: '#8e2bbd', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' },
    outlineBtn:{ marginTop: '0.5rem', width: '100%', padding: '0.65rem 0.875rem', borderRadius: '8px', border: '1px solid #3e0994', background: 'transparent', color: '#98cfff', fontWeight: 500, cursor: 'pointer', fontSize: '0.95rem' },
    helperText:{ marginTop: '0.85rem', fontSize: '0.85rem', textAlign: 'center', color: '#98cfff' },
    hint:     { fontSize: '0.8rem', color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid #4ade80', borderRadius: '6px', padding: '0.4rem 0.75rem', marginBottom: '0.5rem' },
    googleBtn:{ marginTop: '0.5rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #4b4b55', background: '#1A1A1D', color: '#fff', fontWeight: 500, cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'inherit' },
  };

  const StatusBox = () => status ? (
    <div style={{ padding: '1rem', borderRadius: '12px', textAlign: 'center', fontWeight: 500, fontSize: '0.95rem', marginTop: '1rem',
      backgroundColor: status.type === 'success' ? '#10b98120' : '#ef444420',
      border: `2px solid ${status.type === 'success' ? '#10b981' : '#ef4444'}`,
      color: status.type === 'success' ? '#059669' : '#dc2626' }}>
      {status.message}
    </div>
  ) : null;

  return (
    <>
      <div style={styles.videoContainer}>
        <video autoPlay muted loop playsInline preload="auto" style={styles.video}>
          <source src="/videos/gym-video.mp4" type="video/mp4" />
        </video>
      </div>
      <div style={styles.overlay} />

      <div style={styles.container}>
        <div style={styles.card}>

          <div style={styles.heading}>
            <h1 style={styles.headingTitle}>MuscleFit</h1>
            <p style={styles.headingSubtitle}>Management Portal</p>
          </div>

          {/* Google success / error / no-account banners */}
          {googleMsg && (
            <div style={{ background: googleSuccess ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', border: `1px solid ${googleSuccess ? '#22c55e' : '#f59e0b'}`, borderRadius:10, padding:'0.85rem 1rem', marginBottom:'1rem', color: googleSuccess ? '#22c55e' : '#f59e0b', fontSize:'0.88rem', fontWeight:500, lineHeight:1.5 }}>
              {googleMsg}
            </div>
          )}
          {googleError && (
            <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid #ef4444', borderRadius:10, padding:'0.85rem 1rem', marginBottom:'1rem', color:'#ef4444', fontSize:'0.88rem', fontWeight:500 }}>
              ⚠️ {googleError}
            </div>
          )}

          {/* Tabs: Login | Register */}
          <div style={styles.tabs}>
            {[{ key: 'login', label: 'Login' }, { key: 'register', label: 'Register' }].map(t => (
              <button key={t.key}
                style={mode === t.key ? { ...styles.tabBtn, ...styles.tabActive } : styles.tabBtn}
                onClick={() => { setMode(t.key); setStatus(null); clearForm(); setOtpSent(false); setLoginMethod('email'); }}>
                {t.label}
              </button>
            ))}
          </div>

          <h3 style={{ fontSize: '1.3rem', textAlign: 'center', marginBottom: '1rem', color: '#98cfff' }}>
            {mode === 'login' ? 'Welcome Back!' : 'Create Your Account'}
          </h3>

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <form onSubmit={loginMethod === 'email' ? handleLogin : (e) => { e.preventDefault(); otpSent ? handleVerifyOtp() : handleSendOtp(); }}>
              {/* Method selector */}
              <div style={styles.field}>
                <label style={styles.label}>Login Method</label>
                <select value={loginMethod}
                  onChange={e => { setLoginMethod(e.target.value); setStatus(null); setOtpSent(false); setOtp(''); setOtpHint(''); }}
                  style={styles.input}>
                  <option value="email">Email &amp; Password</option>
                  <option value="otp">Phone OTP</option>
                </select>
              </div>

              {/* Email + Password */}
              {loginMethod === 'email' && (
                <>
                  <div style={styles.field}>
                    <label style={styles.label}>Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleInput}
                      placeholder="you@example.com" style={styles.input} required />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Password</label>
                    <PasswordField
                      name="password"
                      value={form.password}
                      onChange={handleInput}
                      placeholder="••••••••"
                      inputStyle={styles.input}
                      required
                    />
                  </div>
                  <p style={{ fontSize: '0.85rem', textAlign: 'right', margin: '0 0 1rem', color: '#98cfff' }}>
                    <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/forgot-password')}>
                      Forgot Password?
                    </span>
                  </p>
                  <button type="submit" style={styles.submitBtn} disabled={loading}>
                    {loading ? 'Signing in…' : 'Login'}
                  </button>
                </>
              )}

              {/* Phone OTP */}
              {loginMethod === 'otp' && (
                <>
                  <div style={styles.field}>
                    <label style={styles.label}>Phone Number</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="10-digit number" maxLength={10} style={styles.input} />
                  </div>
                  {otpSent && (
                    <>
                      {otpHint && <p style={styles.hint}>Dev OTP: {otpHint}</p>}
                      <div style={styles.field}>
                        <label style={styles.label}>Enter OTP</label>
                        <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                          placeholder="6-digit OTP" maxLength={6} style={styles.input} />
                      </div>
                    </>
                  )}
                  <button type="submit" style={styles.submitBtn} disabled={loading}>
                    {loading ? (otpSent ? 'Verifying…' : 'Sending…') : (otpSent ? 'Verify OTP' : 'Send OTP')}
                  </button>
                  {otpSent && (
                    <button type="button" style={styles.outlineBtn}
                      onClick={() => { setOtpSent(false); setOtp(''); setOtpHint(''); setStatus(null); }}>
                      Resend OTP
                    </button>
                  )}
                </>
              )}

              <StatusBox />
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', margin:'0.75rem 0 0' }}>
                <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.12)' }} />
                <span style={{ color:'#94a3b8', fontSize:'0.8rem' }}>or</span>
                <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.12)' }} />
              </div>
              <GoogleBtn onClick={handleGoogleLogin} label="Continue with Google" />
            </form>
          )}

          {/* ── REGISTER ── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister}>
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleInput}
                  placeholder="Enter your name" style={styles.input} required minLength={2} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleInput}
                  placeholder="you@example.com" style={styles.input} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Contact</label>
                <input type="tel" name="contact" value={form.contact} onChange={handleInput}
                  placeholder="Enter your contact number" style={styles.input}
                  required maxLength={10} pattern="[0-9]{10}" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Password</label>
                <PasswordField
                  name="password"
                  value={form.password}
                  onChange={handleInput}
                  placeholder="••••••••"
                  inputStyle={styles.input}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <div style={{ fontSize: '0.75rem', color: '#98cfff', marginTop: '0.25rem' }}>
                  Min. 6 characters
                </div>
              </div>
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </button>
              <StatusBox />
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', margin:'0.75rem 0 0' }}>
                <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.12)' }} />
                <span style={{ color:'#94a3b8', fontSize:'0.8rem' }}>or</span>
                <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.12)' }} />
              </div>
              <GoogleBtn onClick={handleGoogleRegister} label="Sign up with Google" />
            </form>
          )}

          <p style={styles.helperText}>
            <span style={{ color: '#98cfff', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => navigate('/')}>
              ← Back to Portal
            </span>
          </p>

        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
