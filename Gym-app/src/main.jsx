import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import './index.css'
import LoginScreen from './LoginScreen.jsx'
import ForgotPassword from './ForgotPassword.jsx'
// In your App.jsx or main router file
import EditProfile from './EditProfile';
import MemberDashboard from './MemberDashboard';  // ← ADD THIS LINE
import AdminDashboard from './AdminDashboard.jsx'
import Members from './Members.jsx'
import AttendanceList from './AttendanceList.jsx'
import MemberReports from './MemberReports.jsx'
import MemberMonthlyReport from './MemberMonthlyReport.jsx' 
// Add this route (using React Router v6)

const router = createBrowserRouter([
  { path: "/", element: <LoginScreen /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/ForgotPassword", element: <ForgotPassword /> },
  { path: "/admin-dashboard", element: <AdminDashboard /> },  // ← ADD THIS LINE
  { path: "/edit-profile/:memberId", element: <EditProfile /> },
  { path: "/member-dashboard/:memberId", element: <MemberDashboard />}, // ← ADD THIS LINE
  { path: "/members", element: <Members /> }, // ← ADD THIS LINE
  { path: "/attendance-list", element: <AttendanceList /> },  // ← ADD THIS LINE
  { path: "/member-reports", element: <MemberReports /> }, // ← ADD THIS LINE
  { path: "/member-monthly-report/:memberId", element: <MemberMonthlyReport /> }  // ← ADD THIS LINE
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
