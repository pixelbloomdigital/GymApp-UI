import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { PaymentProvider } from "./PaymentContext";
import { ProfileProvider } from "./ProfileContext";
import { MembershipProvider } from "./MembershipContext";
import Login from "./Login";
import AdminDashboard from "./admin";
import UserDashboard from "./UserDashboard";
import ProtectedRoute from "./ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <PaymentProvider>
        <ProfileProvider>
          <MembershipProvider>
            <Router>
              <Routes>

                {/* LOGIN PAGE */}
                <Route path="/" element={<Login />} />

                {/* ADMIN ROUTE */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute role="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* USER ROUTE */}
                <Route
                  path="/user/*"
                  element={
                    <ProtectedRoute role="user">
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* ANY WRONG URL */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Router>
          </MembershipProvider>
        </ProfileProvider>
      </PaymentProvider>
    </AuthProvider>
  );
}
