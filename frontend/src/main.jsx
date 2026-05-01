import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import './index.css'

import { AuthProvider }         from "./AuthContext.jsx";
import { PaymentProvider }      from "./PaymentContext.jsx";
import { ProfileProvider }      from "./ProfileContext.jsx";
import { MembershipProvider }   from "./MembershipContext.jsx";
import { AnnouncementProvider } from "./contexts/AnnouncementContext.jsx";

// Public
import PublicPortal    from './PublicPortal.jsx'
import Login           from './pages/Login.jsx'
import Register        from './pages/Register.jsx'
import OAuth2Callback  from './pages/OAuth2Callback.jsx'
import ForgotPassword  from './ForgotPassword.jsx'

// Dashboards
import AdminDashboard   from './AdminDashboard.jsx'
import MemberDashboard  from './MemberDashboard.jsx'
import TrainerDashboard from './TrainerDashboard.jsx'
import VisitorDashboard from './VisitorDashboard.jsx'
import VisitorMembership from './VisitorMembership.jsx'

// Shraddha components
import Announcement       from './components/Announcement.jsx'
import Gymequipment       from './components/Gymequipment.jsx'
import Membershippurchase from './components/Membershippurchase.jsx'
import Stafflist          from './components/Stafflist.jsx'
import Staffentry         from './components/Staffentry.jsx'

// Admin sub-pages
import Members             from './Members.jsx'
import AttendanceList      from './AttendanceList.jsx'
import MemberReports       from './MemberReports.jsx'
import MemberMonthlyReport from './MemberMonthlyReport.jsx'
import EditProfile         from './EditProfile'

// Route guards
import PrivateRoute   from './components/PrivateRoute.jsx'
import ProtectedRoute from "./ProtectedRoute.jsx";

const router = createBrowserRouter([
  // Public — no auth needed
  { path: "/",                element: <PublicPortal /> },
  { path: "/login",           element: <Login /> },
  { path: "/register",        element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/oauth2/callback", element: <OAuth2Callback /> },

  // Visitor dashboard
  { path: "/visitor-dashboard",    element: <PrivateRoute><VisitorDashboard /></PrivateRoute> },
  { path: "/visitor-membership",   element: <PrivateRoute><VisitorMembership /></PrivateRoute> },

  // Trainer dashboard
  { path: "/trainer-dashboard", element: <PrivateRoute><TrainerDashboard /></PrivateRoute> },

  // Member dashboard
  {
    path: "/member-dashboard",
    element: <PrivateRoute><MemberDashboard /></PrivateRoute>
  },
  {
    path: "/member-dashboard/*",
    element: <PrivateRoute><MemberDashboard /></PrivateRoute>
  },
  {
    path: "/edit-profile/:memberId",
    element: <PrivateRoute><EditProfile /></PrivateRoute>
  },
  {
    path: "/member-monthly-report/:memberId",
    element: <ProtectedRoute role="member"><MemberMonthlyReport /></ProtectedRoute>
  },

  // Admin dashboard
  {
    path: "/admin-dashboard/*",
    element: <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
  },
  {
    path: "/members",
    element: <ProtectedRoute role="admin"><Members /></ProtectedRoute>
  },
  // Attendance — accessible by admin and member
  { path: "/attendance-list", element: <PrivateRoute><AttendanceList /></PrivateRoute> },
  // Reports — accessible by admin and member
  { path: "/member-reports",  element: <PrivateRoute><MemberReports /></PrivateRoute> },

  // Shraddha screens — admin area
  { path: "/announcements",      element: <ProtectedRoute role="admin"><Announcement /></ProtectedRoute> },
  { path: "/equipment",          element: <ProtectedRoute role="admin"><Gymequipment /></ProtectedRoute> },
  { path: "/membership-purchase",element: <ProtectedRoute role="admin"><Membershippurchase /></ProtectedRoute> },
  { path: "/staff-list",         element: <ProtectedRoute role="admin"><Stafflist /></ProtectedRoute> },
  { path: "/staff-entry",        element: <ProtectedRoute role="admin"><Staffentry /></ProtectedRoute> },

  // Fallback
  { path: "*", element: <Navigate to="/" replace /> },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AnnouncementProvider>
        <PaymentProvider>
          <ProfileProvider>
            <MembershipProvider>
              <RouterProvider router={router} />
            </MembershipProvider>
          </ProfileProvider>
        </PaymentProvider>
      </AnnouncementProvider>
    </AuthProvider>
  </StrictMode>
);
