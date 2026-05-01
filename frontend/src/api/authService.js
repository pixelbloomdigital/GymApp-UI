import api from './axios';

export const visitorRegister = (data) =>
  api.post('/api/auth/visitor/register', data);

export const unifiedLogin = (email, password) =>
  api.post('/api/auth/login', { email, password });

// kept for backward compat
export const visitorLogin = (email, password) =>
  api.post('/api/auth/visitor/login', { email, password });

export const memberLogin = (email, password) =>
  api.post('/api/auth/member/login', { email, password });

export const sendOtp = (phone) =>
  api.post('/api/auth/otp/send', { phone });

export const verifyOtp = (phone, otp) =>
  api.post('/api/auth/otp/verify', { phone, otp });

export const completeProfile = (visitorId, data) =>
  api.put(`/api/visitors/${visitorId}/batch-preferences`, data);

export const getVisitorNotifications = (visitorId) =>
  api.get(`/api/visitors/${visitorId}/notifications`);

export const bookDemo = (payload) =>
  api.post('/api/demo/book', payload);

export const storeAuth = ({ token, role, name, email, visitorId, memberId, id }) => {
  localStorage.setItem('token',     token);
  localStorage.setItem('role',      role  ?? '');
  localStorage.setItem('name',      name  ?? '');
  localStorage.setItem('email',     email ?? '');
  localStorage.setItem('id',        id ?? '');
  localStorage.setItem('visitorId', visitorId ?? id ?? '');
  localStorage.setItem('memberId',  memberId ?? id ?? '');
  // trainerId = memberId for TRAINER role — stored explicitly so TrainerDashboard can read it
  if (role?.toUpperCase() === 'TRAINER') {
    localStorage.setItem('trainerId', memberId ?? id ?? '');
  }
};

export const getRoleRedirect = (role) => {
  switch (role?.toUpperCase()) {
    case 'ADMIN':   return '/admin-dashboard';
    case 'TRAINER': return '/trainer-dashboard';
    case 'MEMBER':  return '/member-dashboard';
    case 'VISITOR': return '/visitor-dashboard';
    default:        return '/visitor-dashboard';
  }
};
