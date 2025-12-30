import { UserRole } from '../types';
import { getRoleColor, getRoleLabel } from '../utils/rolePermissions';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export const RoleBadge = ({ role, className = '' }: RoleBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)} ${className}`}
    >
      {getRoleLabel(role)}
    </span>
  );
};
