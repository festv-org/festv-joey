# Quantity-Based Pricing Tiers Implementation

## Overview
Implemented quantity-based pricing for menu items, allowing vendors to set different prices based on quantity ranges (e.g., 1-10: $15/unit, 11-50: $12/unit, 51+: $10/unit).

## What Was Implemented

### 1. Database Schema
- **New Table**: `MenuItemPricingTier`
  - `minQuantity`: Starting quantity for this tier
  - `maxQuantity`: Ending quantity (null = unlimited)
  - `pricePerUnit`: Price per unit at this tier
  - Automatically deleted when parent MenuItem is deleted (CASCADE)

### 2. Backend API Updates

**providerController.ts**:
- `createMenuItem`: Now accepts `pricingTiers` array and creates tiers with the menu item
- `updateMenuItem`: Deletes old tiers and creates new ones when `pricingTiers` is provided
- `getMenuItems`: Returns menu items with their pricing tiers sorted by minQuantity
- `getMyProfiles`: Includes pricing tiers in menu items
- `getProviderById`: Includes pricing tiers for public view

### 3. Frontend UI Updates

**ProviderMenu.tsx**:

**Menu Item Card Display**:
- Shows max price in large text (the highest price from all tiers)
- Shows all tiers in smaller gray text below in descending order
- Format: "1-10: $15.00" | "11-50: $12.00" | "51+: $10.00"

**Add/Edit Modal**:
- Purple checkbox to enable "Quantity-Based Pricing"
- When enabled, replaces single price field with tier management UI
- Each tier has: Min Qty, Max Qty (∞ for unlimited), Price
- "Add Tier" button to add more tiers
- Each tier can be individually removed
- Automatically calculates max price from tiers for storage

## How It Works

### Creating a Menu Item with Tiers
1. Provider checks "Use Quantity-Based Pricing"
2. Adds tiers (e.g., 1-10 @ $15, 11-50 @ $12, 51+ @ $10)
3. Frontend automatically sets `price` field to max price ($15)
4. Backend stores both the max price and all tier details

### Display Logic
- **Provider View**: Shows max price prominently, all tiers below
- **Client View**: Will show tiered pricing to help them understand volume discounts
- Tiers are always sorted by price (descending) for easy reading

### Example Usage
**Scenario**: Catering item with volume discounts
```
Grilled Salmon Entree        $25.00 per person
1-25: $25  |  26-75: $22  |  76+: $20
```

This clearly shows:
- Base price: $25 (for small orders)
- Better rates for larger groups
- Encourages booking larger events

## Files Modified

### Database
- `backend/prisma/schema.prisma` - Added MenuItemPricingTier model
- `backend/prisma/migrations/20260210_add_menu_item_pricing_tiers/migration.sql` - Migration file

### Backend
- `backend/src/controllers/providerController.ts` - Updated CRUD operations

### Frontend  
- `frontend/src/pages/ProviderMenu.tsx` - Added tier UI and display logic

## Deployment Instructions

Run this in PowerShell from project root:
```powershell
.\deploy_pricing_tiers.ps1
```

Or manually:
```powershell
cd D:\Workplace\Claudespace\caterease

# Generate Prisma client
cd backend
npx prisma generate
npx prisma db push

# Commit and push
cd ..
git add .
git commit -m "Add quantity-based pricing tiers for menu items"
git push
```

## Testing

1. **Create Menu Item with Tiers**:
   - Go to Provider Menu page
   - Click "Add Item"
   - Check "Use Quantity-Based Pricing"
   - Add tiers: 1-10 @ $15, 11-50 @ $12, 51+ @ $10
   - Save

2. **Verify Display**:
   - Menu card should show "$15.00" in large text
   - Below in gray: "11-50: $12.00" and "51+: $10.00"

3. **Edit Existing Item**:
   - Click Edit on menu item
   - Tiers should load correctly
   - Can add/remove tiers
   - Can toggle pricing type on/off

## Future Enhancements
- Client-side calculator showing total based on quantity
- Automatic price breaks in quote generation
- Analytics showing which tier is most popular
- Custom tier names (e.g., "Small Event", "Medium Event", "Large Event")
