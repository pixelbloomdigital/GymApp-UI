import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { storeAuth, getRoleRedirect } from '../api/authService';

export default function OAuth2Callback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [ui, setUi] = useState({ icon: '⏳', msg: 'Verifying with Google…', color: '#fff' });

  useEffect(() => {
    const p       = new URLSearchParams(window.location.search);
    const token   = p.get('token');
    const isNew   = p.get('isNew') === 'true';
    const name    = p.get('name')  || '';
    const email   = p.get('email') || '';
    const role    = p.get('role')  || 'VISITOR';
    const id      = p.get('id');
    const visitorId = p.get('visitorId');

    // Read intent set before Google redirect
    const intent = localStorage.getItem('google_intent') || 'login';
    localStorage.removeItem('google_intent');

    if (!token) {
      navigate('/login', { replace: true, state: { googleError: 'Google sign-in failed. Please try again.' } });
      return;
    }

    // ── REGISTER INTENT ────────────────────────────────────────────────────
    if (intent === 'register') {
      if (!isNew) {
        // Account already exists — tell them to login instead
        setUi({ icon: '⚠️', msg: 'Account already exists. Redirecting to login…', color: '#f59e0b' });
        setTimeout(() => navigate('/login', {
          replace: true,
          state: {
            googleError: `An account with ${email} already exists. Please use "Continue with Google" on the Login tab.`
          }
        }), 2000);
      } else {
        // New account created — show success, redirect to login
        setUi({ icon: '🎉', msg: `Account created for ${name}! Redirecting to login…`, color: '#22c55e' });
        setTimeout(() => navigate('/login', {
          replace: true,
          state: {
            googleSuccess: true,
            msg: `✅ Your Google account (${email}) has been registered! Now click "Continue with Google" on the Login tab to access your dashboard.`
          }
        }), 2500);
      }
      return;
    }

    // ── LOGIN INTENT ───────────────────────────────────────────────────────
    if (isNew) {
      // No account existed — send to Register tab with message
      setUi({ icon: '❌', msg: `No account found for ${email}. Redirecting to Register…`, color: '#ef4444' });
      // Remove the newly auto-created account so they register properly
      setTimeout(() => navigate('/login', {
        replace: true,
        state: {
          switchToRegister: true,
          googleError: `No account found for ${email}. Please use "Sign up with Google" on the Register tab to create your account first.`
        }
      }), 2000);
      return;
    }

    // Existing account — log in and go to dashboard
    storeAuth({ token, visitorId, id, name, email, role });
    login({ token, visitorId, name, email, role: role.toLowerCase() });
    setUi({ icon: '✅', msg: `Welcome back, ${name}! Taking you to your dashboard…`, color: '#22c55e' });
    setTimeout(() => navigate(getRoleRedirect(role), { replace: true }), 1200);

  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#1e0050,#3e0994)',
      color: '#fff', fontFamily: 'Poppins,sans-serif',
      gap: '1.5rem', padding: '2rem', textAlign: 'center'
    }}>
      <div style={{ fontSize: '3.5rem' }}>{ui.icon}</div>
      <p style={{ fontSize: '1.1rem', fontWeight: 500, maxWidth: 440, color: ui.color, lineHeight: 1.6 }}>
        {ui.msg}
      </p>
      <div style={{ width: 200, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: '40%', height: '100%', background: 'rgba(255,255,255,0.7)', borderRadius: 2, animation: 'slide 1.2s ease-in-out infinite' }} />
      </div>
      <style>{`@keyframes slide{0%{transform:translateX(-250%)}100%{transform:translateX(600%)}}`}</style>
    </div>
  );
}
