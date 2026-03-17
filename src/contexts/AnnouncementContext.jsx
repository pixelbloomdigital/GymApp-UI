
import React, { createContext, useContext, useState } from 'react';

const AnnouncementContext = createContext();

export function useAnnouncements() {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error('useAnnouncements must be used within AnnouncementProvider');
  }
  return context;
}

export function AnnouncementProvider({ children }) {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      date: "2020-03-30",
      message: "This is to announce that our GYM will remain close for 51 days due to COVID-19.",
      published: true,
    },
    {
      id: 2,
      date: "2020-04-03",
      message: "Opening of GYM Halls and Clubs are not fixed yet. Stay tuned for more updates!!",
      published: true,
    },
    {
      id: 3,
      date: "2020-04-04",
      message: "Renovation Going On...",
      published: true,
    },
    {
      id: 4,
      date: "2022-06-03",
      message: "This is a demo announcement from admin",
      published: false,
    },
    {
      id: 5,
      date: "2023-09-09",
      message: "New yoga classes every Monday and Wednesday at 7 PM!",
      published: true,
    },
  ]);

 
  const publishedAnnouncements = announcements.filter(a => a.published);

 
  const addAnnouncement = (announcement) => {
    const newAnnouncement = {
      id: Date.now(),
      ...announcement,
    };
    setAnnouncements([newAnnouncement, ...announcements]);
  };

  // Update announcement
  const updateAnnouncement = (id, updatedData) => {
    setAnnouncements(
      announcements.map(a => (a.id === id ? { ...a, ...updatedData } : a))
    );
  };

  // Delete announcement
  const deleteAnnouncement = (id) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  // Toggle publish status
  const togglePublish = (id) => {
    setAnnouncements(
      announcements.map(a => (a.id === id ? { ...a, published: !a.published } : a))
    );
  };

  const value = {
    announcements,
    publishedAnnouncements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    togglePublish,
  };

  return (
    <AnnouncementContext.Provider value={value}>
      {children}
    </AnnouncementContext.Provider>
  );
}