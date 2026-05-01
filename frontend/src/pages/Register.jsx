import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { visitorRegister, unifiedLogin, storeAuth, getRoleRedirect } from '../api/authService';
import { getMemberByEmail } from '../api/coreService';
import './Auth.css';
import PasswordField from '../components/PasswordField.jsx';

const INQUIRY_SOURCES  = ['Instagram', 'Google', 'Walk-in', 'Referral', 'Friend'];
const BATCH_TYPES      = ['ZUMBA', 'YOGA', 'FITNESS', 'AEROBICS', 'DANCE'];
const EVENT_INTERESTS  = ['CHOREOGRAPHY_WEDDING', 'CHOREOGRAPHY_SANGEET', 'DANDIYA_WORKSHOP', 'GARBA_WORKSHOP', 'OTHER'];

const EMPTY = {
  name: '', email: '', password: '', phone: '',
  gymCenter: '', city: '', state: '', inquirySource: '',
  preferredBatches: [],
  interestedMembershipPlanId: '',
  demoDatePreference: '', demoTimeSlotPreference: '',
  eventInterest: [], costumeInterest: false,
};

export default function Register() {
  const navigate        = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // batch builder state
  const [batchType, setBatchType]   = useState('ZUMBA');
  const [batchSlot, setBatchSlot]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleEvent = (ev) => {
    setForm(f => ({
      ...f,
      eventInterest: f.eventInterest.includes(ev)
        ? f.eventInterest.filter(e => e !== ev)
        : [...f.eventInterest, ev],
    }));
  };

  const addBatch = () => {
    if (!batchSlot.trim()) return;
    setForm(f => ({ ...f, preferredBatches: [...f.preferredBatches, { batchType, timeSlot: batchSlot }] }));
    setBatchSlot('');
  };

  const removeBatch = (i) =>
    setForm(f => ({ ...f, preferredBatches: f.preferredBatches.filter((_, idx) => idx !== i) }));

  const validateStep1 = () => {
    if (!form.name.trim())  return 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Valid email required';
    if (!/^\d{10}$/.test(form.phone)) return 'Valid 10-digit phone required';
    return '';
  };

  const next = () => {
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    }
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload = {
        ...form,
        preferredBatches: form.preferredBatches,
        interestedMembershipPlanId: form.interestedMembershipPlanId
          ? Number(form.interestedMembershipPlanId) : undefined,
      };
      await visitorRegister(payload);
      if (form.password) {
        const { data } = await unifiedLogin(form.email, form.password);
        storeAuth({ ...data, id: data.id });
        navigate(getRoleRedirect(data.role));
      } else {
        navigate('/login');
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) setError('Email already registered. Please login.');
      else setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card wide">
        <div className="auth-brand"><i className="fas fa-dumbbell" /> MuscleFit</div>
        <p className="auth-sub">Create your visitor account</p>

        {/* Step indicator */}
        <div className="auth-steps">
          {['Basic Info', 'Gym Preferences', 'Interests'].map((label, i) => (
            <div key={i} className={`auth-step ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
              <span className="auth-step-num">{step > i + 1 ? '✓' : i + 1}</span>
              <span className="auth-step-label">{label}</span>
            </div>
          ))}
        </div>

        {error && <p className="auth-error"><i className="fas fa-exclamation-circle" /> {error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div className="auth-row">
                <div className="auth-field">
                  <label>Full Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" />
                </div>
                <div className="auth-field">
                  <label>Phone *</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="10-digit number" maxLength={10} />
                </div>
              </div>
              <div className="auth-field">
                <label>Email *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com" />
              </div>
              <div className="auth-field">
                <label>Password <span className="auth-optional">(optional — can login via OTP/Google)</span></label>
                <PasswordField
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Min 8 chars"
                />
              </div>
              <button type="button" className="auth-btn" onClick={next}>Next →</button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div className="auth-row">
                <div className="auth-field">
                  <label>Gym Center</label>
                  <input value={form.gymCenter} onChange={e => set('gymCenter', e.target.value)} placeholder="Branch name" />
                </div>
                <div className="auth-field">
                  <label>City</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Mumbai" />
                </div>
              </div>
              <div className="auth-row">
                <div className="auth-field">
                  <label>State</label>
                  <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="Maharashtra" />
                </div>
                <div className="auth-field">
                  <label>How did you hear about us?</label>
                  <select value={form.inquirySource} onChange={e => set('inquirySource', e.target.value)}>
                    <option value="">Select source</option>
                    {INQUIRY_SOURCES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="auth-field">
                <label>Interested Membership Plan ID <span className="auth-optional">(optional)</span></label>
                <input type="number" value={form.interestedMembershipPlanId}
                  onChange={e => set('interestedMembershipPlanId', e.target.value)} placeholder="e.g. 2" min={1} />
              </div>

              {/* Preferred Batches */}
              <div className="auth-field">
                <label>Preferred Batches</label>
                <div className="auth-batch-builder">
                  <select value={batchType} onChange={e => setBatchType(e.target.value)}>
                    {BATCH_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <input value={batchSlot} onChange={e => setBatchSlot(e.target.value)}
                    placeholder="Time slot e.g. 06:00-07:00" />
                  <button type="button" className="auth-btn sm" onClick={addBatch}>+ Add</button>
                </div>
                {form.preferredBatches.length > 0 && (
                  <div className="auth-batch-list">
                    {form.preferredBatches.map((b, i) => (
                      <span key={i} className="auth-batch-tag">
                        {b.batchType} · {b.timeSlot}
                        <button type="button" onClick={() => removeBatch(i)}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="auth-row">
                <button type="button" className="auth-btn outline" onClick={() => setStep(1)}>← Back</button>
                <button type="button" className="auth-btn" onClick={next}>Next →</button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <div className="auth-row">
                <div className="auth-field">
                  <label>Demo Date Preference</label>
                  <input type="date" value={form.demoDatePreference}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => set('demoDatePreference', e.target.value)} />
                </div>
                <div className="auth-field">
                  <label>Demo Time Slot Preference</label>
                  <input value={form.demoTimeSlotPreference}
                    onChange={e => set('demoTimeSlotPreference', e.target.value)}
                    placeholder="e.g. 07:00-08:00" />
                </div>
              </div>

              <div className="auth-field">
                <label>Event Interests</label>
                <div className="auth-checkbox-group">
                  {EVENT_INTERESTS.map(ev => (
                    <label key={ev} className="auth-checkbox-label">
                      <input type="checkbox" checked={form.eventInterest.includes(ev)}
                        onChange={() => toggleEvent(ev)} />
                      {ev.replace(/_/g, ' ')}
                    </label>
                  ))}
                </div>
              </div>

              <div className="auth-field">
                <label>Interested in Costume Rental?</label>
                <div className="auth-toggle-row">
                  <button type="button"
                    className={`auth-toggle-btn ${form.costumeInterest ? 'active' : ''}`}
                    onClick={() => set('costumeInterest', true)}>Yes</button>
                  <button type="button"
                    className={`auth-toggle-btn ${!form.costumeInterest ? 'active' : ''}`}
                    onClick={() => set('costumeInterest', false)}>No</button>
                </div>
              </div>

              <div className="auth-row">
                <button type="button" className="auth-btn outline" onClick={() => setStep(2)}>← Back</button>
                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? 'Registering…' : 'Create Account'}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="auth-link-row center">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
