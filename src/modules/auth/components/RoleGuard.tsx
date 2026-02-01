import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import type { UserRole } from '@/types/database.types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallbackPath = '/access-denied',
}: RoleGuardProps) {
  const { hasRole, profile } = useAuth();

  // If profile is not loaded yet, wait
  if (!profile) {
    return null;
  }

  // Check if user has required role
  if (!hasRole(allowedRoles)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
