import api from './axios';

// Visitors
export const getAllVisitors    = ()           => api.get('/api/visitors');
export const getVisitor        = (id)         => api.get(`/api/visitors/${id}`);
export const registerVisitor   = (data)       => api.post('/api/auth/visitor/register', data);
export const updateVisitor     = (id, data)   => api.put(`/api/visitors/${id}`, data);
export const deleteVisitor     = (id)         => api.delete(`/api/visitors/${id}`);
export const markVisitorAttended = (id)        => api.patch(`/api/visitors/${id}/mark-attended`);

// Admin-created login accounts
export const registerMember    = (data)       => api.post('/api/auth/admin/register-member', data);

// Demo bookings
export const getAllDemoBookings = ()           => api.get('/api/demo/bookings');
export const getDemoStats      = ()           => api.get('/api/demo/bookings/stats');
export const confirmDemoDate   = (id, date)   => api.put(`/api/demo/bookings/${id}/confirm-date?date=${date}`);
export const cancelDemoBooking = (id)         => api.delete(`/api/demo/bookings/${id}`);
export const createDemoBookingAsAdmin = (data) => api.post('/api/demo/admin/create-booking', data);

// Convert visitor to member
export const convertToMember   = (data)       => api.post('/api/auth/convert-to-member', data);
export const getMemberIdByVisitorId = (visitorId) => api.get(`/api/auth/members/by-visitor/${visitorId}`);
export const changeMemberRole  = (memberId, role, visitorId) => api.patch(`/api/auth/members/${memberId}/role?role=${role}${visitorId ? `&visitorId=${visitorId}` : ''}`);

// Finance
export const getMonthlyFinance = (year, month) => api.get(`/api/payments/finance/summary/monthly?year=${year}&month=${month}`);
export const getTransactions   = (from, to)    => api.get(`/api/payments/finance/transactions/by-date?from=${from}&to=${to}`);
export const getExpenses       = (from, to)    => api.get(`/api/payments/finance/expenses/by-date?from=${from}&to=${to}`);
export const addExpense        = (data)        => api.post('/api/payments/finance/expenses', data);
export const deleteExpense     = (id)          => api.delete(`/api/payments/finance/expenses/${id}`);

// Equipment
export const getEquipments     = ()            => api.get('/api/payments/equipment');
export const addEquipment      = (data)        => api.post('/api/payments/equipment', data);
export const updateEquipment   = (id, data)    => api.put(`/api/payments/equipment/${id}`, data);
export const deleteEquipment   = (id)          => api.delete(`/api/payments/equipment/${id}`);

// Staff
export const getAllStaff = () => api.get('/api/auth/staff');
export const deleteStaff = (memberId) => api.delete(`/api/auth/staff/${memberId}`);
export const getAllMembersByRole = (role) => api.get(`/api/auth/members?role=${role}`);

// Trainer Leaves
export const applyLeave        = (data)   => api.post('/api/leaves/apply', data);
export const getMyLeaves       = ()       => api.get('/api/leaves/my');
export const getAllLeaves       = (status) => api.get(`/api/leaves/all${status ? '?status=' + status : ''}`);
export const approveLeave      = (id, remark) => api.patch(`/api/leaves/${id}/approve`, { remark });
export const rejectLeave       = (id, remark) => api.patch(`/api/leaves/${id}/reject`, { remark });
export const deleteLeave       = (id)     => api.delete(`/api/leaves/${id}`);
