-- AlterTable
ALTER TABLE "ProviderProfile" ADD COLUMN     "fixedFee" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "hourlyRate" DOUBLE PRECISION,
ADD COLUMN     "isSoloWorker" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "minimumHours" INTEGER DEFAULT 2,
ALTER COLUMN "businessDescription" DROP NOT NULL;

-- CreateTable
CREATE TABLE "PricingLevel" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pricePerPerson" DOUBLE PRECISION NOT NULL,
    "minimumGuests" INTEGER,
    "features" TEXT[],
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingLevel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PricingLevel_providerId_idx" ON "PricingLevel"("providerId");

-- CreateIndex
CREATE INDEX "PricingLevel_isActive_idx" ON "PricingLevel"("isActive");

-- AddForeignKey
ALTER TABLE "PricingLevel" ADD CONSTRAINT "PricingLevel_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ProviderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
