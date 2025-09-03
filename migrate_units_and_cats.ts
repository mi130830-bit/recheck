// migrate_units_and_cats.ts (Final Corrected Version)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration script...');

  // --- 1. Migrate Units using Raw SQL ---
  console.log('Migrating distinct units...');
  // ใช้ Raw Query เพื่อดึงค่าที่ไม่ซ้ำจากคอลัมน์ 'unit' เก่า
  const distinctUnits: { unit: string }[] = 
    await prisma.$queryRaw`SELECT DISTINCT unit FROM Product WHERE unit IS NOT NULL AND unit != ''`;
  
  const unitNames = distinctUnits.map(u => ({ name: u.unit }));
  
  if (unitNames.length > 0) {
    try {
      const createdUnits = await prisma.unit.createMany({
        data: unitNames,
        skipDuplicates: true,
      });
      console.log(`Successfully created ${createdUnits.count} new unique units.`);
    } catch (e) {
        console.error("Could not create units:", e)
    }
  } else {
    console.log('No distinct units to migrate.');
  }

  // --- 2. Migrate Categories using Raw SQL ---
  console.log('\nMigrating distinct categories...');
  const distinctCategories: { category: string }[] = 
    await prisma.$queryRaw`SELECT DISTINCT category FROM Product WHERE category IS NOT NULL AND category != ''`;
  
  const categoryNames = distinctCategories.map(c => ({ name: c.category }));
  
  if (categoryNames.length > 0) {
    try {
      const createdCategories = await prisma.category.createMany({
        data: categoryNames,
        skipDuplicates: true,
      });
      console.log(`Successfully created ${createdCategories.count} new unique categories.`);
    } catch(e) {
        console.error("Could not create categories:", e)
    }
  } else {
    console.log('No distinct categories to migrate.');
  }
  
  console.log('\nMigration script finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });