-- Ensure all ProviderProfile columns exist (idempotent — safe to run multiple times).
-- This catches Render dev databases that may have missed earlier migrations.

-- Step 1 identity + location fields
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "tagline"              TEXT;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "websiteUrl"           TEXT;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "instagramHandle"      TEXT;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "yearsInBusiness"      INTEGER;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "languages"            TEXT[]  NOT NULL DEFAULT '{}';
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "travelOutsideRegion"  BOOLEAN NOT NULL DEFAULT false;

-- Step 2 type-specific fields — RESTO_VENUE
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "seatedCapacity"           INTEGER;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "standingCapacity"         INTEGER;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "venueCuisine"             TEXT;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "venueIndoorOutdoor"       TEXT;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "avTechAvailable"          BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "dietaryOptions"           TEXT[]  NOT NULL DEFAULT '{}';

-- CATERER
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "equipmentRentalAvailable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "caterSetupIncluded"       BOOLEAN NOT NULL DEFAULT false;

-- ENTERTAINMENT
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "genreTags"               TEXT[]  NOT NULL DEFAULT '{}';
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "setupTimeMinutes"        INTEGER;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "equipmentIncluded"       BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "overtimeRatePerHour"     DOUBLE PRECISION;

-- PHOTO_VIDEO
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "styleTags"               TEXT[]  NOT NULL DEFAULT '{}';
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "deliveryTimelineDays"    INTEGER;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "editedPhotosCount"       INTEGER;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "travelFeePolicy"         TEXT;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "rawFilesIncluded"        BOOLEAN NOT NULL DEFAULT false;

-- FLORIST_DECOR
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "floristStyleTags"        TEXT[]  NOT NULL DEFAULT '{}';
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "seasonalCustomFloral"    BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "floristSetupIncluded"    BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProviderProfile" ADD COLUMN IF NOT EXISTS "rentalItemsAvailable"    BOOLEAN NOT NULL DEFAULT false;

-- Implicit many-to-many join tables (cuisine types and event themes)
CREATE TABLE IF NOT EXISTS "_CuisineTypeToProviderProfile" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "_CuisineTypeToProviderProfile_AB_unique"
    ON "_CuisineTypeToProviderProfile"("A", "B");
CREATE INDEX IF NOT EXISTS "_CuisineTypeToProviderProfile_B_index"
    ON "_CuisineTypeToProviderProfile"("B");

CREATE TABLE IF NOT EXISTS "_EventThemeToProviderProfile" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "_EventThemeToProviderProfile_AB_unique"
    ON "_EventThemeToProviderProfile"("A", "B");
CREATE INDEX IF NOT EXISTS "_EventThemeToProviderProfile_B_index"
    ON "_EventThemeToProviderProfile"("B");

CREATE TABLE IF NOT EXISTS "_CuisineTypeToEventRequest" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "_CuisineTypeToEventRequest_AB_unique"
    ON "_CuisineTypeToEventRequest"("A", "B");
CREATE INDEX IF NOT EXISTS "_CuisineTypeToEventRequest_B_index"
    ON "_CuisineTypeToEventRequest"("B");

CREATE TABLE IF NOT EXISTS "_EventThemeToEventRequest" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "_EventThemeToEventRequest_AB_unique"
    ON "_EventThemeToEventRequest"("A", "B");
CREATE INDEX IF NOT EXISTS "_EventThemeToEventRequest_B_index"
    ON "_EventThemeToEventRequest"("B");
