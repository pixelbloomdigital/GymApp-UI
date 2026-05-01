import { useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Home() {
  const navigate = useNavigate();
  const name  = localStorage.getItem('name')  || 'Visitor';
  const role  = localStorage.getItem('role')  || 'VISITOR';
  const email = localStorage.getItem('email') || '';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-brand"><i className="fas fa-dumbbell" /> MuscleFit</div>
        <div className="home-welcome">
          <i className="fas fa-user-circle home-avatar" />
          <h2>Welcome, {name}!</h2>
          <p className="auth-sub">{email}</p>
          <span className="home-role-badge">{role}</span>
        </div>
        <p style={{ textAlign: 'center', color: '#555', marginTop: '1rem' }}>
          You're logged in as a visitor. Explore our gym, book a demo, or browse membership plans.
        </p>
        <button className="auth-btn" onClick={() => navigate('/')}>
          <i className="fas fa-home" /> Visit Portal
        </button>
        <button className="auth-btn outline" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt" /> Logout
        </button>
      </div>
    </div>
  );
}
