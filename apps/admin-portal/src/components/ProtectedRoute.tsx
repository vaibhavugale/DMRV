import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { activeProjectId, isLoading: projectLoading } = useProject();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const location = useLocation();

  if (authLoading || projectLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#f8fafc]">
        <div className="text-[var(--text-muted)]">Verifying Access...</div>
      </div>
    );
  }

  // 1. Check for authenticated user
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check for Role Authorization
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 3. Check for active project (for scoped routes)
  // Super admins and Auditors can bypass the project requirement for specific routes
  const isBypassRole = user?.role === 'super_admin' || user?.role === 'auditor';
  if (!activeProjectId && location.pathname !== '/launchpad' && !isBypassRole) {
    return <Navigate to="/launchpad" replace />;
  }

  return <Outlet />;
}
