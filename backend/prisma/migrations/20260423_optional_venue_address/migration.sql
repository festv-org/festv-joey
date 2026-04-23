-- Make venue address fields optional (planners may not have a venue yet)
ALTER TABLE "EventRequest"
  ALTER COLUMN "venueAddress" DROP NOT NULL,
  ALTER COLUMN "venueCity"    DROP NOT NULL,
  ALTER COLUMN "venueState"   DROP NOT NULL,
  ALTER COLUMN "venueZipCode" DROP NOT NULL;

-- Track which venue provider filled in the address
ALTER TABLE "EventRequest" ADD COLUMN IF NOT EXISTS "venueProviderId" TEXT;
