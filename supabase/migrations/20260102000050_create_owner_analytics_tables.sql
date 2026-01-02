/*
  # Create Owner Analytics Tables

  This migration creates tables for tracking costs, usage, and analytics for the owner dashboard.

  ## New Tables

  1. **import_logs**
     - Tracks each email processing run
     - Records token usage and GPT costs
     - Links to tenant (nullable for now, for future multi-tenant)
     - Fields: email processing metadata, token counts, costs, properties extracted

  2. **property_extraction_logs**
     - Per-property extraction details
     - Records confidence scores for each field
     - Tracks image matching success
     - Links to import_logs and properties

  3. **cost_summary**
     - Aggregated costs by time period
     - Pre-calculated metrics for faster dashboard loading
     - Daily/monthly/yearly rollups

  ## Security
     - Enable RLS on all tables
     - Only authenticated admin/owner users can access
     - Public has no access

  ## Important Notes
     - Designed for owner analytics and cost tracking
     - Supports future multi-tenant architecture
     - Includes audit trail capabilities
*/

-- Create enum for import status
DO $$ BEGIN
  CREATE TYPE import_status_enum AS ENUM (
    'success',
    'partial',
    'failed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create enum for email platforms
DO $$ BEGIN
  CREATE TYPE email_platform_enum AS ENUM (
    'Constant Contact',
    'Mailchimp',
    'SendGrid',
    'Campaign Monitor',
    'ActiveCampaign',
    'Generic',
    'Unknown'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create import_logs table
CREATE TABLE IF NOT EXISTS import_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES auth.users(id),
  email_subject text,
  email_from text,
  email_platform_detected email_platform_enum DEFAULT 'Unknown',
  properties_extracted integer DEFAULT 0,
  properties_created integer DEFAULT 0,
  gpt_input_tokens integer DEFAULT 0,
  gpt_output_tokens integer DEFAULT 0,
  gpt_total_tokens integer DEFAULT 0,
  gpt_cost_usd numeric(10, 6) DEFAULT 0,
  avg_confidence_score numeric(3, 2),
  image_match_rate numeric(3, 2),
  status import_status_enum DEFAULT 'success',
  error_message text,
  processing_time_ms integer,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create property_extraction_logs table
CREATE TABLE IF NOT EXISTS property_extraction_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_log_id uuid REFERENCES import_logs(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  street_address text,
  city text,
  state text,
  zip_code text,
  asking_price numeric,
  arv numeric,
  property_type text,
  confidence_address numeric(3, 2),
  confidence_price numeric(3, 2),
  confidence_arv numeric(3, 2),
  confidence_property_type numeric(3, 2),
  overall_confidence numeric(3, 2),
  image_url text,
  image_matched boolean DEFAULT false,
  needs_manual_review boolean DEFAULT false,
  was_corrected boolean DEFAULT false,
  correction_notes text,
  created_at timestamptz DEFAULT now()
);

-- Create cost_summary table
CREATE TABLE IF NOT EXISTS cost_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_type text NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  tenant_id uuid REFERENCES auth.users(id),
  total_emails integer DEFAULT 0,
  total_properties integer DEFAULT 0,
  total_input_tokens bigint DEFAULT 0,
  total_output_tokens bigint DEFAULT 0,
  total_tokens bigint DEFAULT 0,
  total_cost_usd numeric(10, 2) DEFAULT 0,
  avg_cost_per_property numeric(10, 6),
  avg_confidence_score numeric(3, 2),
  error_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(period_type, period_start, tenant_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_import_logs_created_at ON import_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_logs_tenant_id ON import_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON import_logs(status);
CREATE INDEX IF NOT EXISTS idx_property_extraction_logs_import_log_id ON property_extraction_logs(import_log_id);
CREATE INDEX IF NOT EXISTS idx_property_extraction_logs_property_id ON property_extraction_logs(property_id);
CREATE INDEX IF NOT EXISTS idx_property_extraction_logs_confidence ON property_extraction_logs(overall_confidence);
CREATE INDEX IF NOT EXISTS idx_cost_summary_period ON cost_summary(period_type, period_start, tenant_id);

-- Enable Row Level Security
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_extraction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_summary ENABLE ROW LEVEL SECURITY;

-- Create policies for owner/admin access only
CREATE POLICY "Owners can view all import logs"
  ON import_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners can insert import logs"
  ON import_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners can view all extraction logs"
  ON property_extraction_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners can insert extraction logs"
  ON property_extraction_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners can view cost summary"
  ON cost_summary FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners can manage cost summary"
  ON cost_summary FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('owner', 'admin')
    )
  );

-- Create function to auto-update cost_summary updated_at
CREATE OR REPLACE FUNCTION update_cost_summary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cost_summary_updated_at
  BEFORE UPDATE ON cost_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_cost_summary_updated_at();
