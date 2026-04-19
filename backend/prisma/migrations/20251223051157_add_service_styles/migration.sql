-- DropIndex
DROP INDEX "ProviderProfile_userId_key";

-- AlterTable
ALTER TABLE "ProviderProfile" ADD COLUMN     "primaryType" "ProviderType";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "roles" "UserRole"[] DEFAULT ARRAY['CLIENT']::"UserRole"[];

-- CreateIndex
CREATE INDEX "ProviderProfile_userId_idx" ON "ProviderProfile"("userId");
