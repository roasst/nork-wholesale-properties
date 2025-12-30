/*
  # Add Wholesalers and Pending Property Review Features

  1. New Tables
    - `wholesalers`
      - `id` (uuid, primary key)
      - `name` (text, required) - Wholesaler contact name
      - `email` (text, required) - Email address
      - `phone` (text) - Phone number
      - `company_name` (text) - Company name
      - `is_trusted` (boolean, default false) - Auto-approve their deals
      - `notes` (text) - Internal notes about this wholesaler
      - `total_deals` (integer, default 0) - Count of properties from this wholesaler
      - `last_deal_date` (timestamptz) - Date of most recent property
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Property Table Updates
    - Add `wholesaler_id` - Reference to wholesalers table
    - Add `source_email_subject` - Subject line from import email
    - Add `source_email_body` - Full email body text
    - Add `source_email_date` - Date email was received
    - Add `auto_imported` - Boolean flag for auto-imported properties
    - Update `status` to include 'pending' option

  3. Security
    - Enable RLS on wholesalers table
    - Policies for authenticated users to view wholesalers
    - Policies for editors to manage wholesalers
    - Policies for admins to toggle trusted status
*/

-- Create wholesalers table
CREATE TABLE IF NOT EXISTS wholesalers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company_name text,
  is_trusted boolean DEFAULT false,
  notes text,
  total_deals integer DEFAULT 0,
  last_deal_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to properties table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'wholesaler_id'
  ) THEN
    ALTER TABLE properties ADD COLUMN wholesaler_id uuid REFERENCES wholesalers(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'source_email_subject'
  ) THEN
    ALTER TABLE properties ADD COLUMN source_email_subject text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'source_email_body'
  ) THEN
    ALTER TABLE properties ADD COLUMN source_email_body text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'source_email_date'
  ) THEN
    ALTER TABLE properties ADD COLUMN source_email_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'auto_imported'
  ) THEN
    ALTER TABLE properties ADD COLUMN auto_imported boolean DEFAULT false;
  END IF;
END $$;

-- Create trigger for wholesalers updated_at
DROP TRIGGER IF EXISTS wholesalers_updated_at ON wholesalers;
CREATE TRIGGER wholesalers_updated_at
  BEFORE UPDATE ON wholesalers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS on wholesalers
ALTER TABLE wholesalers ENABLE ROW LEVEL SECURITY;

-- Wholesalers policies: Authenticated users can view
CREATE POLICY "Authenticated users can view wholesalers"
  ON wholesalers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_active = true
    )
  );

-- Editors can insert wholesalers
CREATE POLICY "Editors can insert wholesalers"
  ON wholesalers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'admin', 'editor')
      AND user_profiles.is_active = true
    )
  );

-- Editors can update wholesalers
CREATE POLICY "Editors can update wholesalers"
  ON wholesalers FOR UPDATE
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

-- Admins can delete wholesalers
CREATE POLICY "Admins can delete wholesalers"
  ON wholesalers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'admin')
      AND user_profiles.is_active = true
    )
  );

-- Create function to update wholesaler stats
CREATE OR REPLACE FUNCTION update_wholesaler_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.wholesaler_id IS NOT NULL THEN
      UPDATE wholesalers
      SET 
        total_deals = (SELECT COUNT(*) FROM properties WHERE wholesaler_id = NEW.wholesaler_id),
        last_deal_date = (SELECT MAX(created_at) FROM properties WHERE wholesaler_id = NEW.wholesaler_id)
      WHERE id = NEW.wholesaler_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.wholesaler_id IS NOT NULL THEN
      UPDATE wholesalers
      SET 
        total_deals = (SELECT COUNT(*) FROM properties WHERE wholesaler_id = OLD.wholesaler_id),
        last_deal_date = (SELECT MAX(created_at) FROM properties WHERE wholesaler_id = OLD.wholesaler_id)
      WHERE id = OLD.wholesaler_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update wholesaler stats when properties change
DROP TRIGGER IF EXISTS update_wholesaler_stats_trigger ON properties;
CREATE TRIGGER update_wholesaler_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_wholesaler_stats();
