import { useState, useEffect } from "react";
import { getActiveAnnouncements } from "../api/announcementService";
import "./Announcement.css";

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    getActiveAnnouncements()
      .then(r => setAnnouncements(r.data || []))
      .catch(() => setAnnouncements([]));
  }, []);

  useEffect(() => {
    if (announcements.length === 0) return;
    const interval = setInterval(() => setCurrentIndex(p => (p + 1) % announcements.length), 5000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  if (announcements.length === 0) return null;

  return (
    <div className="announcement-banner">
      <div className="announcement-banner-content">
        <div className="announcement-icon"><i className="fas fa-bullhorn" /></div>
        <div className="announcement-text-wrapper">
          <div className="announcement-text" key={currentIndex}>
            <strong>Announcement:</strong> {announcements[currentIndex]?.message}
          </div>
        </div>
        <div className="announcement-nav">
          <button onClick={() => setCurrentIndex(p => (p - 1 + announcements.length) % announcements.length)} className="nav-btn">
            <i className="fas fa-chevron-left" />
          </button>
          <span className="announcement-counter">{currentIndex + 1} / {announcements.length}</span>
          <button onClick={() => setCurrentIndex(p => (p + 1) % announcements.length)} className="nav-btn">
            <i className="fas fa-chevron-right" />
          </button>
        </div>
      </div>
    </div>
  );
}
