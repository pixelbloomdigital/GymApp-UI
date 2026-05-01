import api from './axios';

// ── Members (Core Service /api/members) ──────────────────────────────────────
export const getAllMembers       = ()        => api.get('/api/members');
export const getMember          = (id)      => api.get(`/api/members/${id}`);
export const getMemberByEmail   = (email)   => api.get(`/api/members/by-email?email=${encodeURIComponent(email)}`);
export const createMember       = (data)    => api.post('/api/members', data);
export const updateMember       = (id, data)=> api.put(`/api/members/${id}`, data);
export const deleteMember       = (id)      => api.delete(`/api/members/${id}`);

// ── Membership Plans (/api/memberships/plans) ─────────────────────────────────
export const getPlans           = ()        => api.get('/api/memberships/plans');
export const getPlan            = (id)      => api.get(`/api/memberships/plans/${id}`);
export const createPlan         = (data)    => api.post('/api/memberships/plans', data);
export const updatePlan         = (id, data)=> api.put(`/api/memberships/plans/${id}`, data);
export const deletePlan         = (id)      => api.delete(`/api/memberships/plans/${id}`);

// ── Memberships (/api/memberships) ────────────────────────────────────────────
export const assignMembership   = (data)    => api.post('/api/memberships', data);
export const getMemberMemberships = (memberId) => api.get(`/api/memberships/member/${memberId}`);
export const renewMembership    = (id, data)=> api.post(`/api/memberships/${id}/renew`, data);
export const cancelMembership   = (id)      => api.delete(`/api/memberships/${id}`);

// ── Attendance (/api/attendance) ──────────────────────────────────────────────
export const markAttendance     = (data)    => api.post('/api/attendance', data);
export const checkIn            = (data)    => api.post('/api/attendance/check-in', data);
export const checkOut           = (memberId, batchId) => api.post(`/api/attendance/check-out?memberId=${memberId}&batchId=${batchId}`);
export const getTodayAttendance = ()        => api.get('/api/attendance/today');
export const getAttendanceByDate= (date)    => api.get(`/api/attendance/date/${date}`);
export const getMemberAttendance= (memberId)=> api.get(`/api/attendance/member/${memberId}`);
export const getMonthlyAttendance=(memberId, yearMonth) => api.get(`/api/attendance/member/${memberId}/month/${yearMonth}`);

// ── Dashboard (/api/dashboard) ────────────────────────────────────────────────
export const getDashboardSummary= ()        => api.get('/api/dashboard/summary');
export const getMonthlyIncome   = (year, month) => api.get(`/api/dashboard/income/monthly?year=${year}&month=${month}`);

// ── Batches (/api/batches) ────────────────────────────────────────────────────
export const getBatches         = ()        => api.get('/api/batches');
export const createBatch        = (data)    => api.post('/api/batches', data);
export const updateBatch        = (id, data)=> api.put(`/api/batches/${id}`, data);
export const deleteBatch        = (id)      => api.delete(`/api/batches/${id}`);

// ── Trainer Attendance (/api/trainer-attendance) ──────────────────────────────
export const getTrainerSessions = (trainerId) => api.get(`/api/trainer-attendance/trainer/${trainerId}`);
export const getTrainerMonthlySummary = (trainerId, yearMonth) => api.get(`/api/trainer-attendance/trainer/${trainerId}/month/${yearMonth}`);
export const startTrainerSession= (data)    => api.post('/api/trainer-attendance/session-start', data);
export const endTrainerSession  = (data)    => api.post('/api/trainer-attendance/session-end', data);

// ── Trainer Payroll (/api/trainer-payroll) ────────────────────────────────────
export const getTrainerPayroll  = (trainerId) => api.get(`/api/trainer-payroll/trainer/${trainerId}`);

// ── Diet Plans (/api/diet-plans) ─────────────────────────────────────────────
export const purchaseDietPlan   = (memberId) => api.post(`/api/diet-plans/purchase/${memberId}`);
export const getMemberDietPlan  = (memberId) => api.get(`/api/diet-plans/member/${memberId}`);
export const getTrainerDietPurchases = (trainerId) => api.get(`/api/diet-plans/trainer/${trainerId}/purchases`);
export const assignDietPlanByTrainer = (data) => api.post('/api/diet-plans/assign', data);

// ── Member Performance (/api/performance) ─────────────────────────────────────
export const getMemberProgress  = (memberId) => api.get(`/api/performance/goals/member/${memberId}`);
export const getMemberExtendedProfile = (memberId) => api.get(`/api/performance/profile/${memberId}`);
export const updateMemberExtendedProfile = (memberId, data) => api.put(`/api/performance/profile/${memberId}`, data);

// ── Event Registrations (/api/public/events) ──────────────────────────────────
export const getEventRegistrations = (eventId) => api.get(`/api/public/events/${eventId}/registrations`);
export const registerForEvent      = (eventId, data) => api.post(`/api/public/events/${eventId}/register`, data);
