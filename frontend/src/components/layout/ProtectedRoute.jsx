import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VouchLogo from '../ui/VouchLogo';

/**
 * ProtectedRoute — redirects unauthenticated users to /login,
 * and users who haven't completed onboarding to /onboarding.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    // Show minimal loading state while verifying token
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center animate-pulse">
          <VouchLogo size="lg" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  if (user && !user.onboarding_complete) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
