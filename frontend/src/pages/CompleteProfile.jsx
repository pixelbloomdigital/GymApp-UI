import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeProfile } from '../api/authService';
import './Auth.css';

const INQUIRY_SOURCES = ['Instagram', 'Google', 'Walk-in', 'Referral', 'Friend'];

export default function CompleteProfile() {
  const navigate    = useNavigate();
  const visitorId   = localStorage.getItem('visitorId');
  const [form, setForm] = useState({ phone: '', gymCenter: '', city: '', state: '', inquirySource: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.phone)) { setError('Enter a valid 10-digit phone number'); return; }
    setError(''); setLoading(true);
    try {
      await completeProfile(visitorId, form);
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-brand"><i className="fas fa-dumbbell" /> MuscleFit</div>
        <p className="auth-sub">Complete your profile to get started</p>

        {error && <p className="auth-error"><i className="fas fa-exclamation-circle" /> {error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Phone Number *</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="10-digit number" maxLength={10} required />
          </div>
          <div className="auth-row">
            <div className="auth-field">
              <label>City</label>
              <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Mumbai" />
            </div>
            <div className="auth-field">
              <label>State</label>
              <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="Maharashtra" />
            </div>
          </div>
          <div className="auth-field">
            <label>Gym Center</label>
            <input value={form.gymCenter} onChange={e => set('gymCenter', e.target.value)} placeholder="Branch name" />
          </div>
          <div className="auth-field">
            <label>How did you hear about us?</label>
            <select value={form.inquirySource} onChange={e => set('inquirySource', e.target.value)}>
              <option value="">Select source</option>
              {INQUIRY_SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Saving…' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
