-- Add new fields to ProviderProfile for vendor setup step 1

ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "tagline"             TEXT;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "websiteUrl"          TEXT;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "instagramHandle"     TEXT;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "yearsInBusiness"     INTEGER;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "languages"           TEXT[]  NOT NULL DEFAULT '{}';
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "travelOutsideRegion" BOOLEAN NOT NULL DEFAULT false;
