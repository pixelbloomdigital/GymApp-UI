import api from './axios';

export const getActiveAnnouncements = ()        => api.get('/api/announcements/active');
export const createAnnouncement     = (data)    => api.post('/api/announcements', data);
export const deleteAnnouncement     = (id)      => api.delete(`/api/announcements/${id}`);
export const sendWhatsApp           = (memberId, data) => api.post(`/api/announcements/whatsapp/${memberId}`, data);
export const sendEmail              = (memberId, data) => api.post(`/api/announcements/email/${memberId}`, data);
