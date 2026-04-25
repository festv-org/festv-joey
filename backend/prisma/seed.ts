/**
 * Prisma seed entry point. Run with: npm run prisma:seed
 *
 * Safeguard: refuses to run against a production database unless
 * ENABLE_TEST_ACCOUNTS=true is set explicitly.
 */
import prisma from '../src/config/database.js';
import { seedTestAccounts } from '../src/seedTestAccounts.js';

async function main() {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.ENABLE_TEST_ACCOUNTS !== 'true'
  ) {
    console.error(
      '❌ Refusing to seed in production. Set ENABLE_TEST_ACCOUNTS=true to override.'
    );
    process.exit(1);
  }

  console.log('🌱 Seeding test accounts...');
  const results = await seedTestAccounts(prisma);
  for (const r of results) {
    const userTag = r.userCreated ? '✨ created' : '♻️  refreshed';
    let profileTag = '';
    if (r.profileCreated) profileTag = '  + profile created';
    else if (r.profileSkipped) profileTag = '  (profile already exists, skipped)';
    console.log(`  ${userTag}  ${r.email}${profileTag}`);
  }
  console.log(`✅ Done — ${results.length} accounts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
