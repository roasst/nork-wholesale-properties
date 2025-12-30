export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  role: UserRole;
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface Inquiry {
  id: string;
  property_id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  notes: string | null;
  marked_read_by: string | null;
  marked_read_at: string | null;
  is_deleted: boolean;
  deleted_by: string | null;
  deleted_at: string | null;
  created_at: string;
  property?: {
    street_address: string;
    city: string;
    state: string;
  };
}

export interface PropertyFormData {
  street_address: string;
  city: string;
  county: string;
  state: string;
  zip_code: string;
  asking_price: number;
  arv: number | null;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  square_footage: number;
  status: string;
  comments: string | null;
  image_url: string | null;
  is_active: boolean;
}
