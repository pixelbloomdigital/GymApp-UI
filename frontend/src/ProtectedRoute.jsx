import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (role && user.role?.toLowerCase() !== role.toLowerCase()) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;