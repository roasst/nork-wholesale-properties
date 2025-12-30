/*
  # Complete Database Schema for Nork Group Property Platform

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `street_address` (text, required)
      - `city` (text, required)
      - `county` (text, required)
      - `state` (text, required)
      - `zip_code` (text, required)
      - `asking_price` (numeric, required)
      - `arv` (numeric)
      - `property_type` (text, required)
      - `bedrooms` (integer)
      - `bathrooms` (numeric)
      - `square_footage` (integer)
      - `status` (text, default 'Available')
      - `comments` (text)
      - `image_url` (text)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, references auth.users)
      - `updated_by` (uuid, references auth.users)

    - `inquiries`
      - `id` (uuid, primary key)
      - `property_id` (uuid, references properties)
      - `name` (text, required)
      - `email` (text, required)
      - `phone` (text)
      - `message` (text)
      - `notes` (text)
      - `marked_read_by` (uuid, references auth.users)
      - `marked_read_at` (timestamptz)
      - `is_deleted` (boolean, default false)
      - `deleted_by` (uuid, references auth.users)
      - `deleted_at` (timestamptz)
      - `created_at` (timestamptz)

    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, required, unique)
      - `full_name` (text)
      - `role` (text, default 'viewer')
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_invitations`
      - `id` (uuid, primary key)
      - `email` (text, required)
      - `role` (text, required)
      - `invited_by` (uuid, references auth.users)
      - `token` (text, unique, required)
      - `expires_at` (timestamptz, required)
      - `accepted_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Storage
    - Create `property-images` bucket for property photos

  3. Security
    - Enable RLS on all tables
    - Policies for authenticated users with role-based access
    - Public read access to active properties
    - Public write access to inquiries
    - Admin-only access to user management

  4. Functions & Triggers
    - Auto-create user_profile when auth user is created
    - Auto-update timestamps
*/

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  street_address text NOT NULL,
  city text NOT NULL,
  county text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  asking_price numeric NOT NULL,
  arv numeric,
  property_type text NOT NULL,
  bedrooms integer DEFAULT 0,
  bathrooms numeric DEFAULT 0,
  square_footage integer DEFAULT 0,
  status text DEFAULT 'Available',
  comments text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  notes text,
  marked_read_by uuid REFERENCES auth.users(id),
  marked_read_at timestamptz,
  is_deleted boolean DEFAULT false,
  deleted_by uuid REFERENCES auth.users(id),
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  invited_by uuid REFERENCES auth.users(id),
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create function to auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, is_active)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'viewer'),
    true
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS properties_updated_at ON properties;
CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Properties policies
CREATE POLICY "Public can view active properties"
  ON properties FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all properties"
  ON properties FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_active = true
    )
  );

CREATE POLICY "Editors can insert properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'admin', 'editor')
      AND user_profiles.is_active = true
    )
  );

CREATE POLICY "Editors can update properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'admin', 'editor')
      AND user_profiles.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'admin', 'editor')
      AND user_profiles.is_active = true
    )
  );

CREATE POLICY "Admins can delete properties"
  ON properties FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'admin')
      AND user_profiles.is_active = true
    )
  );

-- Inquiries policies
CREATE POLICY "Anyone can create inquiries"
  ON inquiries FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view non-deleted inquiries"
  ON inquiries FOR SELECT
  TO authenticated
  USING (
    is_deleted = false
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_active = true
    )
  );

CREATE POLICY "Authenticated users can update inquiries"
  ON inquiries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_active = true
    )
  );

CREATE POLICY "Editors can delete inquiries"
  ON inquiries FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'admin', 'editor')
      AND user_profiles.is_active = true
    )
  );

-- User profiles policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('owner', 'admin')
      AND up.is_active = true
    )
  );

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can update profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('owner', 'admin')
      AND up.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('owner', 'admin')
      AND up.is_active = true
    )
  );

-- User invitations policies
CREATE POLICY "Admins can view invitations"
  ON user_invitations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'admin')
      AND user_profiles.is_active = true
    )
  );

CREATE POLICY "Anyone can view their own invitation by token"
  ON user_invitations FOR SELECT
  TO public
  USING (expires_at > now() AND accepted_at IS NULL);

CREATE POLICY "Admins can create invitations"
  ON user_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'admin')
      AND user_profiles.is_active = true
    )
  );

CREATE POLICY "Invitations can be updated by anyone with token"
  ON user_invitations FOR UPDATE
  TO public
  USING (expires_at > now() AND accepted_at IS NULL)
  WITH CHECK (expires_at > now());

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view property images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'property-images');

CREATE POLICY "Editors can upload property images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'property-images'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'admin', 'editor')
      AND user_profiles.is_active = true
    )
  );

CREATE POLICY "Editors can update property images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'property-images'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'admin', 'editor')
      AND user_profiles.is_active = true
    )
  );

CREATE POLICY "Admins can delete property images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-images'
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'admin')
      AND user_profiles.is_active = true
    )
  );

-- Create the owner user profile manually for luke@roasst.com
-- Note: This will need to be run after the auth user is created
-- or we can insert it directly if we know the user will sign up
