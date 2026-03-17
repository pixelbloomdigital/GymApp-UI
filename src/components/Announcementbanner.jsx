// src/components/AnnouncementBanner.jsx
import { useState, useEffect } from "react";
import "./Announcement.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function AnnouncementBanner({ announcements }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter only published announcements
  const publishedAnnouncements = announcements.filter((a) => a.published);

  useEffect(() => {
    if (publishedAnnouncements.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % publishedAnnouncements.length);
    }, 5000); // Change announcement every 5 seconds

    return () => clearInterval(interval);
  }, [publishedAnnouncements.length]);

  if (publishedAnnouncements.length === 0) {
    return null;
  }

  const currentAnnouncement = publishedAnnouncements[currentIndex];

  return (
    <div className="announcement-banner">
      <div className="announcement-banner-content">
        <div className="announcement-icon">
          <i className="fas fa-bullhorn"></i>
        </div>
        <div className="announcement-text-wrapper">
          <div className="announcement-text" key={currentIndex}>
            <strong>Announcement:</strong> {currentAnnouncement.message}
          </div>
        </div>
        <div className="announcement-nav">
          <button
            onClick={() =>
              setCurrentIndex(
                (prev) =>
                  (prev - 1 + publishedAnnouncements.length) %
                  publishedAnnouncements.length
              )
            }
            className="nav-btn"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <span className="announcement-counter">
            {currentIndex + 1} / {publishedAnnouncements.length}
          </span>
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev + 1) % publishedAnnouncements.length)
            }
            className="nav-btn"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}