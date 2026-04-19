# Deployment script for Menu Item Pricing Tiers Feature

Write-Host "=== Deploying Menu Item Pricing Tiers Feature ===" -ForegroundColor Cyan
Write-Host ""

# Navigate to project root
Set-Location "D:\Workplace\Claudespace\caterease"

Write-Host "Step 1: Generate Prisma Client..." -ForegroundColor Yellow
Set-Location backend
npx prisma generate

Write-Host ""
Write-Host "Step 2: Push schema to database..." -ForegroundColor Yellow
npx prisma db push

Write-Host ""
Write-Host "Step 3: Git add changes..." -ForegroundColor Yellow
Set-Location ..
git add backend/prisma/schema.prisma
git add backend/prisma/migrations/20260210_add_menu_item_pricing_tiers/migration.sql
git add backend/src/controllers/providerController.ts
git add frontend/src/pages/ProviderMenu.tsx

Write-Host ""
Write-Host "Step 4: Commit changes..." -ForegroundColor Yellow
git commit -m "Add quantity-based pricing tiers for menu items

- Add MenuItemPricingTier model to schema
- Update menu item create/update endpoints to handle pricing tiers
- Add pricing tier UI in provider menu page
- Display pricing tiers on menu item cards
- Support min/max quantity ranges with different prices"

Write-Host ""
Write-Host "Step 5: Push to GitHub..." -ForegroundColor Yellow
git push

Write-Host ""
Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "The changes will auto-deploy on Render."
