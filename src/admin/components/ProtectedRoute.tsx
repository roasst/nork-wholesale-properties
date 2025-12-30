import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7CB342] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!profile.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Inactive</h2>
          <p className="text-gray-600 mb-6">
            Your account has been deactivated. Please contact an administrator for assistance.
          </p>
          <button
            onClick={() => window.location.href = '/admin/login'}
            className="bg-[#7CB342] hover:bg-[#689F38] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (requiredRoles && !requiredRoles.includes(profile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.location.href = '/admin/dashboard'}
            className="bg-[#7CB342] hover:bg-[#689F38] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
