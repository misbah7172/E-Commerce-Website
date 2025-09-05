-- Migration: Add browser fingerprinting to visitors table
-- Add browser fingerprint and related fields for unique visitor tracking

ALTER TABLE visitors 
ADD COLUMN browser_fingerprint TEXT NOT NULL DEFAULT '',
ADD COLUMN browser_info TEXT,
ADD COLUMN screen_resolution TEXT,
ADD COLUMN timezone TEXT,
ADD COLUMN language TEXT;

-- Add unique constraint on browser_fingerprint
ALTER TABLE visitors 
ADD CONSTRAINT visitors_browser_fingerprint_unique UNIQUE (browser_fingerprint);

-- Update existing records with a placeholder fingerprint based on IP + user agent
UPDATE visitors 
SET browser_fingerprint = 'legacy_' || substr(md5(ip_address || COALESCE(user_agent, '')), 1, 16)
WHERE browser_fingerprint = '';
