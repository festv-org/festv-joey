/**
 * pricingEngine manual test script
 *
 * Creates a temporary Package with seasonal + day-of-week rules, runs two
 * calculatePackagePrice calls (Saturday high-season vs. Wednesday low-season),
 * logs the results side by side, then cleans up all created records.
 *
 * Run with:
 *   tsx src/services/pricingEngine.test.ts
 *
 * Requires a live DATABASE_URL in the environment (dev DB is fine).
 * All created records are deleted in the finally block.
 *
 * Expected results for 100 guests, PER_PERSON, base $80/person, min spend $5,000:
 *
 *   Saturday July 18, 2026  (weekend rule → $100/pp, then ×1.30 summer)
 *     basePrice after rules : $130.00/person
 *     packagePrice          : $13,000.00
 *     appliedPrice          : $13,000.00  (min spend $7,500 not triggered)
 *
 *   Wednesday January 14, 2026  (no weekend rule, ×0.80 winter)
 *     basePrice after rules : $64.00/person
 *     packagePrice          : $6,400.00
 *     appliedPrice          : $6,400.00   (min spend $5,000 not triggered)
 */

import prisma from '../config/database.js';
import { calculatePackagePrice, PricingResult } from './pricingEngine.js';

// ─── Test dates ───────────────────────────────────────────────────────────────
// July 18 2026 → Saturday   (verified: April 28 2026 is Tue; +81 days = Sat)
const SAT_JULY   = new Date(2026, 6, 18); // month is 0-indexed
// January 14 2026 → Wednesday (verified: Jan 1 2026 is Thu; +13 = Wed)
const WED_JAN    = new Date(2026, 0, 14);

// ─── Formatting helpers ───────────────────────────────────────────────────────
const usd = (n: number) => `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
const pct = (n: number, of: number) => `(${((n / of) * 100).toFixed(1)}%)`;

function printResult(label: string, r: PricingResult): void {
  console.log(`\n${'─'.repeat(52)}`);
  console.log(`  ${label}`);
  console.log(`${'─'.repeat(52)}`);
  console.log(`  Package price        ${usd(r.packagePrice)}`);
  console.log(`  Minimum spend        ${usd(r.minimumSpend)}`);
  console.log(`  Applied price        ${usd(r.appliedPrice)}`);
  if (r.addOns.length > 0) {
    console.log(`  Add-ons:`);
    for (const a of r.addOns) {
      const auto = a.isAutoIncluded ? ' [auto]' : a.isRequired ? ' [req]' : '';
      console.log(`    ${a.name.padEnd(28)} ${a.pricingType.padEnd(10)} ×${a.quantity}  ${usd(a.total)}${auto}`);
    }
  }
  console.log(`  Add-ons total        ${usd(r.addOnsTotal)}`);
  console.log(`  Subtotal             ${usd(r.subtotal)}`);
  console.log(`  Tax (15%)            ${usd(r.tax)} ${pct(r.tax, r.subtotal)}`);
  console.log(`  ─────────────────────────────────────────`);
  console.log(`  TOTAL                ${usd(r.total)}`);
  console.log(`  Deposit (10%)        ${usd(r.depositAmount)}`);
  if (r.isOutOfParameters) {
    console.log(`\n  ⚠️  OUT OF PARAMETERS:`);
    for (const reason of r.outOfParameterReasons) {
      console.log(`     • ${reason}`);
    }
  } else {
    console.log(`\n  ✓  Within parameters`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  let userId: string | null    = null;
  let packageId: string | null = null;

  try {
    // 1. Create a temporary user
    const user = await prisma.user.create({
      data: {
        email:        'pricing-engine-test@test.local',
        passwordHash: '$2b$12$placeholder-not-real',
        firstName:    'Pricing',
        lastName:     'TestBot',
        role:         'PROVIDER',
        roles:        ['PROVIDER'],
        status:       'ACTIVE',
        emailVerified: true,
      },
    });
    userId = user.id;
    console.log(`\n✓ Created test user: ${user.id}`);

    // 2. Create a temporary provider profile
    const provider = await prisma.providerProfile.create({
      data: {
        userId:             user.id,
        businessName:       'Test Grand Hall (pricing engine)',
        providerTypes:      ['RESTO_VENUE'],
        primaryType:        'RESTO_VENUE',
        minGuestCount:      50,
        maxGuestCount:      300,
        verificationStatus: 'VERIFIED',
      },
    });
    console.log(`✓ Created test provider: ${provider.id}`);

    // 3. Create the package with pricing rules
    //
    //    Seasonal rules:
    //      Summer High Season  Jun 15 → Aug 31  ×1.30
    //      Winter Low Season   Jan  1 → Feb 14  ×0.80
    //
    //    Day-of-week rules:
    //      Saturday + Sunday  priceOverride $100/pp, minSpend override $7,500
    //
    const pkg = await prisma.package.create({
      data: {
        providerProfileId: provider.id,
        name:         'Grand Hall Package',
        category:     'Venue Packages',
        pricingModel: 'PER_PERSON',
        basePrice:    80,          // $80 per person base
        minimumSpend: 5_000,
        minGuests:    50,
        maxGuests:    300,
        included:     ['Tables & chairs', 'Basic AV', 'Coat check'],
        seasonalRules: {
          createMany: {
            data: [
              {
                name:       'Summer High Season',
                startMonth: 6,  startDay: 15,
                endMonth:   8,  endDay:   31,
                multiplier: 1.30,
              },
              {
                name:       'Winter Low Season',
                startMonth: 1,  startDay: 1,
                endMonth:   2,  endDay:   14,
                multiplier: 0.80,
              },
            ],
          },
        },
        dayOfWeekRules: {
          createMany: {
            data: [
              {
                days:                  ['SATURDAY', 'SUNDAY'],
                priceOverride:         100,   // $100/pp on weekends
                minimumSpendOverride:  7_500,
              },
            ],
          },
        },
      },
    });
    packageId = pkg.id;
    console.log(`✓ Created test package: ${pkg.id}`);

    // 4. Also add an optional add-on (universal — no applicablePackages)
    //    and a required add-on specific to this package
    const [optionalAddOn, requiredAddOn] = await Promise.all([
      prisma.addOn.create({
        data: {
          providerProfileId: provider.id,
          name:        'Valet Parking',
          pricingType: 'PER_PERSON',
          price:       12,
          isRequired:  false,
          // No applicablePackages → universal
        },
      }),
      prisma.addOn.create({
        data: {
          providerProfileId:  provider.id,
          name:               'Coat Check Attendant',
          pricingType:        'FLAT',
          price:              350,
          isRequired:         true,
          applicablePackages: { connect: [{ id: pkg.id }] },
        },
      }),
    ]);
    console.log(`✓ Created add-ons: [${optionalAddOn.id}, ${requiredAddOn.id}]`);

    // ── Scenario A: Saturday July 18 2026 — 100 guests, valet selected ────
    // Day rule fires first  → basePrice = $100/pp,  minSpend = $7,500
    // Seasonal rule fires   → multiplier 1.30 → basePrice = $130/pp
    // PER_PERSON            → packagePrice = $13,000
    // appliedPrice          → max(13000, 7500) = $13,000
    // Coat check (required) → FLAT 1 × $350 = $350   [auto-included]
    // Valet (optional)      → PER_PERSON 100 × $12 = $1,200   [user-selected]
    // addOnsTotal           → $1,550
    // subtotal              → $14,550
    // tax 15%               → $2,182.50
    // total                 → $16,732.50
    // deposit 10%           → $1,673.25

    const resultA = await calculatePackagePrice({
      packageId,
      eventDate:        SAT_JULY,
      guestCount:       100,
      selectedAddOnIds: [optionalAddOn.id], // user picked valet; coat check auto-required
    });

    // ── Scenario B: Wednesday January 14 2026 — 100 guests, no add-ons ───
    // No day rule (no Wed rule)
    // Seasonal rule fires   → multiplier 0.80 → basePrice = $64/pp
    // PER_PERSON            → packagePrice = $6,400
    // appliedPrice          → max(6400, 5000) = $6,400
    // Coat check (required) → FLAT 1 × $350 = $350   [auto-included]
    // Valet (optional)      → NOT selected, not required → skipped
    // addOnsTotal           → $350
    // subtotal              → $6,750
    // tax 15%               → $1,012.50
    // total                 → $7,762.50
    // deposit 10%           → $776.25

    const resultB = await calculatePackagePrice({
      packageId,
      eventDate:        WED_JAN,
      guestCount:       100,
      selectedAddOnIds: [], // no optional add-ons
    });

    // ── Print comparison ──────────────────────────────────────────────────
    console.log('\n\n════════════════════════════════════════════════════════');
    console.log('  FESTV PRICING ENGINE — SCENARIO COMPARISON');
    console.log('════════════════════════════════════════════════════════');
    console.log('  Package:  Grand Hall Package  ($80/pp base, min $5,000)');
    console.log('  Guests:   100   |   Package rules applied before model');

    printResult('Saturday July 18 2026  [Weekend + Summer High Season]', resultA);
    printResult('Wednesday January 14 2026  [Weekday + Winter Low Season]', resultB);

    console.log('\n════════════════════════════════════════════════════════\n');

  } finally {
    // Clean up: deleting the user cascades to providerProfile → packages →
    // seasonalRules, dayOfWeekRules, and the implicit PackageAddOns join rows.
    // AddOns are deleted via the providerProfileId cascade.
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(e =>
        console.error('⚠️  Cleanup failed (user):', e.message),
      );
      console.log('✓ Cleaned up test records');
    }
    await prisma.$disconnect();
  }
}

main().catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
