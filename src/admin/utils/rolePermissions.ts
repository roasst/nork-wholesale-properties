import { UserRole } from '../types';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

export const canManageUsers = (role: UserRole): boolean => {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.admin;
};

export const canEditProperties = (role: UserRole): boolean => {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.editor;
};

export const canDeleteProperties = (role: UserRole): boolean => {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.admin;
};

export const canDeleteInquiries = (role: UserRole): boolean => {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.editor;
};

export const canInviteRole = (inviterRole: UserRole, targetRole: UserRole): boolean => {
  if (inviterRole === 'owner') return true;
  if (inviterRole === 'admin' && targetRole !== 'owner' && targetRole !== 'admin') return true;
  return false;
};

export const getRoleColor = (role: UserRole): string => {
  switch (role) {
    case 'owner':
      return 'bg-purple-100 text-purple-800';
    case 'admin':
      return 'bg-blue-100 text-blue-800';
    case 'editor':
      return 'bg-green-100 text-green-800';
    case 'viewer':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getRoleLabel = (role: UserRole): string => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const PROPERTY_TYPES = [
  'SFR',
  'Duplex',
  'Triplex',
  'Quad',
  'Multi-Family',
  'Commercial'
];

export const PROPERTY_STATUSES = [
  'Available',
  'Under Contract',
  'Sold'
];
