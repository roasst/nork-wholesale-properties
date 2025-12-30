export type PropertyType = 'SFR' | 'Duplex' | 'Triplex' | 'Quad' | 'Multi-Family' | 'Commercial';

export type PropertyStatus = 'pending' | 'Available' | 'Under Contract' | 'Sold';

export interface Property {
  id: string;
  street_address: string;
  city: string;
  county: string;
  state: string;
  zip_code: string;
  asking_price: number;
  arv: number;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  square_footage: number;
  status: PropertyStatus;
  image_url: string | null;
  comments: string | null;
  is_active: boolean;
  wholesaler_id: string | null;
  source_email_subject: string | null;
  source_email_body: string | null;
  source_email_date: string | null;
  auto_imported: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id?: string;
  property_id: string;
  property_address: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  is_read?: boolean;
  created_at?: string;
}

export interface PropertyFilters {
  state?: string;
  city?: string;
  county?: string;
  zip_code?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyTypes?: PropertyType[];
}

export interface Wholesaler {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  is_trusted: boolean;
  notes: string | null;
  total_deals: number;
  last_deal_date: string | null;
  created_at: string;
  updated_at: string;
}
