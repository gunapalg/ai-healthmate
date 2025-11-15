-- Add missing columns to wearable_connections table
ALTER TABLE wearable_connections
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_sync TIMESTAMP WITH TIME ZONE;