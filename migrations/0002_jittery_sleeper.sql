-- Add new columns for browser fingerprinting
ALTER TABLE "visitors" ADD COLUMN "browser_fingerprint" text;--> statement-breakpoint
ALTER TABLE "visitors" ADD COLUMN "browser_info" text;--> statement-breakpoint
ALTER TABLE "visitors" ADD COLUMN "screen_resolution" text;--> statement-breakpoint
ALTER TABLE "visitors" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "visitors" ADD COLUMN "language" text;--> statement-breakpoint

-- Update existing records with a legacy fingerprint based on IP and user agent
UPDATE "visitors" 
SET "browser_fingerprint" = 'legacy_' || REPLACE("ip_address", '.', '_') || '_' || EXTRACT(EPOCH FROM NOW())::TEXT
WHERE "browser_fingerprint" IS NULL;--> statement-breakpoint

-- Make browser_fingerprint NOT NULL after populating existing records
ALTER TABLE "visitors" ALTER COLUMN "browser_fingerprint" SET NOT NULL;--> statement-breakpoint

-- Add unique constraint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_browser_fingerprint_unique" UNIQUE("browser_fingerprint");