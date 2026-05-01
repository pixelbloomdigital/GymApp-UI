import React, { createContext, useContext, useState } from 'react';

const AnnouncementContext = createContext();

export function useAnnouncements() {
  const context = useContext(AnnouncementContext);
  if (!context) throw new Error('useAnnouncements must be used within AnnouncementProvider');
  return context;
}

export function AnnouncementProvider({ children }) {
  const [announcements, setAnnouncements] = useState([
    { id: 1, date: "2024-03-30", message: "Welcome to MuscleFit Gym! New batches starting this month.", published: true },
    { id: 2, date: "2024-04-03", message: "New Zumba and Yoga classes every Monday and Wednesday at 7 PM!", published: true },
    { id: 3, date: "2024-04-04", message: "Gym will remain closed on public holidays. Stay tuned for updates.", published: true },
    { id: 4, date: "2024-06-03", message: "This is a draft announcement", published: false },
  ]);

  const publishedAnnouncements = announcements.filter(a => a.published);

  const addAnnouncement    = (a)  => setAnnouncements(prev => [{ id: Date.now(), ...a }, ...prev]);
  const updateAnnouncement = (id, data) => setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  const deleteAnnouncement = (id) => setAnnouncements(prev => prev.filter(a => a.id !== id));
  const togglePublish      = (id) => setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, published: !a.published } : a));

  return (
    <AnnouncementContext.Provider value={{ announcements, publishedAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement, togglePublish }}>
      {children}
    </AnnouncementContext.Provider>
  );
}
