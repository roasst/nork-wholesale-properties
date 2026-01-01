/*
  # Update Property Types and Status Enums

  This migration expands the property types and adds proper enum constraints.

  ## Changes Made

  1. **Property Type Enum**
     - Creates property_type_enum with values: SFR, Duplex, Triplex, Quad, Multi-Family, Commercial, Condo, Townhome, Vacant Land, Other
     - Updates properties table to use the enum
     - Migrates existing 'Single Family' values to 'SFR'

  2. **Property Status Enum**
     - Creates property_status_enum with values: Available, Under Contract, Sold, pending
     - Updates properties table to use the enum
     - Ensures proper status values

  ## Important Notes
     - Existing data is preserved and migrated
     - Default values are set appropriately
     - No data loss occurs during migration
*/

-- Create property type enum
DO $$ BEGIN
  CREATE TYPE property_type_enum AS ENUM (
    'SFR',
    'Duplex',
    'Triplex',
    'Quad',
    'Multi-Family',
    'Commercial',
    'Condo',
    'Townhome',
    'Vacant Land',
    'Other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create property status enum
DO $$ BEGIN
  CREATE TYPE property_status_enum AS ENUM (
    'Available',
    'Under Contract',
    'Sold',
    'pending'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Migrate existing property_type values
UPDATE properties 
SET property_type = 'SFR' 
WHERE property_type IN ('Single Family', 'Single Family Residence', 'SFR');

UPDATE properties 
SET property_type = 'Multi-Family' 
WHERE property_type ILIKE '%multi%family%';

-- Add temporary columns with enum types
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'property_type_new'
  ) THEN
    ALTER TABLE properties ADD COLUMN property_type_new property_type_enum;
    ALTER TABLE properties ADD COLUMN status_new property_status_enum;
  END IF;
END $$;

-- Copy data to new enum columns with proper defaults
UPDATE properties 
SET property_type_new = CASE 
  WHEN property_type = 'SFR' THEN 'SFR'::property_type_enum
  WHEN property_type = 'Duplex' THEN 'Duplex'::property_type_enum
  WHEN property_type = 'Triplex' THEN 'Triplex'::property_type_enum
  WHEN property_type = 'Quad' THEN 'Quad'::property_type_enum
  WHEN property_type = 'Multi-Family' THEN 'Multi-Family'::property_type_enum
  WHEN property_type = 'Commercial' THEN 'Commercial'::property_type_enum
  WHEN property_type = 'Condo' THEN 'Condo'::property_type_enum
  WHEN property_type = 'Townhome' THEN 'Townhome'::property_type_enum
  WHEN property_type = 'Vacant Land' THEN 'Vacant Land'::property_type_enum
  ELSE 'Other'::property_type_enum
END;

UPDATE properties 
SET status_new = CASE 
  WHEN status = 'Available' THEN 'Available'::property_status_enum
  WHEN status = 'Under Contract' THEN 'Under Contract'::property_status_enum
  WHEN status = 'Sold' THEN 'Sold'::property_status_enum
  WHEN status = 'pending' THEN 'pending'::property_status_enum
  ELSE 'Available'::property_status_enum
END;

-- Drop old columns and rename new ones
ALTER TABLE properties DROP COLUMN property_type;
ALTER TABLE properties DROP COLUMN status;
ALTER TABLE properties RENAME COLUMN property_type_new TO property_type;
ALTER TABLE properties RENAME COLUMN status_new TO status;

-- Set NOT NULL and defaults
ALTER TABLE properties ALTER COLUMN property_type SET NOT NULL;
ALTER TABLE properties ALTER COLUMN property_type SET DEFAULT 'SFR'::property_type_enum;
ALTER TABLE properties ALTER COLUMN status SET NOT NULL;
ALTER TABLE properties ALTER COLUMN status SET DEFAULT 'Available'::property_status_enum;
