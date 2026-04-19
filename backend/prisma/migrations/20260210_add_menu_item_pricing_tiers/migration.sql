-- CreateTable
CREATE TABLE "MenuItemPricingTier" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "maxQuantity" INTEGER,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenuItemPricingTier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MenuItemPricingTier_menuItemId_idx" ON "MenuItemPricingTier"("menuItemId");

-- CreateIndex
CREATE INDEX "MenuItemPricingTier_minQuantity_idx" ON "MenuItemPricingTier"("minQuantity");

-- AddForeignKey
ALTER TABLE "MenuItemPricingTier" ADD CONSTRAINT "MenuItemPricingTier_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
