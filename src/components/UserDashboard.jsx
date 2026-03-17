import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnnouncements } from '../contexts/AnnouncementContext';
import './UserDashboard.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import AnnouncementBanner from './AnnouncementBanner';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { publishedAnnouncements } = useAnnouncements(); // Get published announcements from context

  const handleLogout = () => {
    navigate('/');
  };

  // User data (will come from backend/context)
  const userData = {
    name: "Vinay D",
    membershipType: "Premium",
    memberSince: "Oct 2024",
    nextBilling: "March 31, 2025",
    status: "Active",
    profileImage: "/assets/member3.jpg"
  };

  // User stats
  const userStats = {
    daysActive: 145,
    workoutsCompleted: 98,
    caloriesBurned: 45600,
    currentStreak: 12,
    goalProgress: 75
  };

  // Today's schedule
  const todayClasses = [
    { time: "06:00 AM", class: "Morning Cardio", trainer: "Rajesh Kumar", duration: "45 min", spots: 5 },
    { time: "08:00 AM", class: "Yoga Flow", trainer: "Priya Sharma", duration: "60 min", spots: 3 },
    { time: "10:00 AM", class: "Strength Training", trainer: "Amit Singh", duration: "50 min", spots: 8 },
    { time: "05:00 PM", class: "Zumba Dance", trainer: "Neha Patel", duration: "45 min", spots: 2 },
    { time: "07:00 PM", class: "CrossFit", trainer: "Rohit Verma", duration: "60 min", spots: 6 }
  ];

  // Recent workouts
  const recentWorkouts = [
    { date: "March 6", type: "Cardio", duration: "45 min", calories: 420 },
    { date: "March 5", type: "Weights", duration: "60 min", calories: 380 },
    { date: "March 4", type: "Yoga", duration: "50 min", calories: 220 },
    { date: "March 3", type: "CrossFit", duration: "55 min", calories: 510 }
  ];

  // Fitness goals
  const goals = [
    { name: "Weekly Workouts", current: 5, target: 6, unit: "sessions" },
    { name: "Calories Burned", current: 2100, target: 2500, unit: "kcal" },
    { name: "Body Weight", current: 72, target: 70, unit: "kg" }
  ];

  return (
    <>
      {/* Announcement Banner - Now showing live published announcements from admin */}
      <AnnouncementBanner announcements={publishedAnnouncements} />
      
      <div className="user-dashboard-container">
        {/* Top Navigation Bar */}
        <div className="user-navbar">
          <div className="navbar-brand">
            <i className="fas fa-dumbbell"></i>
            <h1>Fit Nexus</h1>
          </div>
          <div className="navbar-actions">
            <button className="nav-btn">
              <i className="fas fa-bell"></i>
              <span className="notification-badge">3</span>
            </button>
            <div className="user-menu">
              <img src={userData.profileImage} alt={userData.name} />
              <span>{userData.name}</span>
              <i className="fas fa-chevron-down"></i>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="user-main-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-text">
              <h1>Welcome back, <span className="highlight">{userData.name}!</span></h1>
              <p>Ready to crush your fitness goals today? 💪</p>
            </div>
            <div className="membership-badge">
              <i className="fas fa-crown"></i>
              <span>{userData.membershipType} Member</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="user-stats-grid">
            <div className="user-stat-card">
              <div className="stat-icon flame">
                <i className="fas fa-fire"></i>
              </div>
              <div className="stat-info">
                <p className="stat-label">Current Streak</p>
                <h3>{userStats.currentStreak} Days</h3>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="stat-icon workout">
                <i className="fas fa-running"></i>
              </div>
              <div className="stat-info">
                <p className="stat-label">Workouts Done</p>
                <h3>{userStats.workoutsCompleted}</h3>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="stat-icon calories">
                <i className="fas fa-bolt"></i>
              </div>
              <div className="stat-info">
                <p className="stat-label">Calories Burned</p>
                <h3>{userStats.caloriesBurned.toLocaleString()}</h3>
              </div>
            </div>

            <div className="user-stat-card">
              <div className="stat-icon active">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="stat-info">
                <p className="stat-label">Days Active</p>
                <h3>{userStats.daysActive}</h3>
              </div>
            </div>
          </div>

          {/* Content Columns */}
          <div className="content-columns">
            {/* Left Column */}
            <div className="left-column">
              {/* Membership Info */}
              <div className="info-card membership-info">
                <div className="card-header">
                  <h2>
                    <i className="fas fa-id-card"></i>
                    Membership Details
                  </h2>
                </div>
                <div className="card-body">
                  <div className="info-row">
                    <span className="info-label">Member Since</span>
                    <span className="info-value">{userData.memberSince}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Plan</span>
                    <span className="info-value premium">{userData.membershipType}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Status</span>
                    <span className="status-badge active">{userData.status}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Next Billing</span>
                    <span className="info-value">{userData.nextBilling}</span>
                  </div>
                  <button className="renew-btn">
                    <i className="fas fa-sync-alt"></i>
                    Renew Membership
                  </button>
                </div>
              </div>

              {/* Fitness Goals */}
              <div className="info-card goals-card">
                <div className="card-header">
                  <h2>
                    <i className="fas fa-bullseye"></i>
                    Weekly Goals
                  </h2>
                </div>
                <div className="card-body">
                  {goals.map((goal, index) => (
                    <div key={index} className="goal-item">
                      <div className="goal-header">
                        <span className="goal-name">{goal.name}</span>
                        <span className="goal-progress">{goal.current} / {goal.target} {goal.unit}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${(goal.current / goal.target) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Workouts */}
              <div className="info-card workouts-card">
                <div className="card-header">
                  <h2>
                    <i className="fas fa-history"></i>
                    Recent Workouts
                  </h2>
                </div>
                <div className="card-body">
                  <div className="workouts-list">
                    {recentWorkouts.map((workout, index) => (
                      <div key={index} className="workout-item">
                        <div className="workout-icon">
                          <i className="fas fa-dumbbell"></i>
                        </div>
                        <div className="workout-details">
                          <h4>{workout.type}</h4>
                          <p>{workout.date} • {workout.duration}</p>
                        </div>
                        <div className="workout-calories">
                          <i className="fas fa-fire"></i>
                          {workout.calories} cal
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="right-column">
              {/* Today's Classes */}
              <div className="info-card classes-card">
                <div className="card-header">
                  <h2>
                    <i className="fas fa-calendar-day"></i>
                    Today's Classes
                  </h2>
                  <span className="date-badge">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="card-body">
                  <div className="classes-list">
                    {todayClasses.map((classItem, index) => (
                      <div key={index} className="class-item">
                        <div className="class-time">
                          <i className="fas fa-clock"></i>
                          {classItem.time}
                        </div>
                        <div className="class-details">
                          <h4>{classItem.class}</h4>
                          <p>
                            <i className="fas fa-user"></i> {classItem.trainer}
                          </p>
                          <div className="class-meta">
                            <span>
                              <i className="fas fa-hourglass-half"></i> {classItem.duration}
                            </span>
                            <span className={`spots ${classItem.spots < 5 ? 'limited' : ''}`}>
                              <i className="fas fa-users"></i> {classItem.spots} spots left
                            </span>
                          </div>
                        </div>
                        <button className="book-btn">
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-card">
                <h2>Quick Actions</h2>
                <div className="quick-actions-grid">
                  <button className="quick-action-btn">
                    <i className="fas fa-qrcode"></i>
                    <span>Check In</span>
                  </button>
                  <button className="quick-action-btn">
                    <i className="fas fa-calendar-plus"></i>
                    <span>Book Class</span>
                  </button>
                  <button className="quick-action-btn">
                    <i className="fas fa-user-edit"></i>
                    <span>Edit Profile</span>
                  </button>
                  <button className="quick-action-btn">
                    <i className="fas fa-receipt"></i>
                    <span>Payment History</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}