// File: src/routes/reports/low-stock/+page.server.ts (ฉบับแก้ไข)

import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function load() {
  try {
    // --- ใช้ Raw Query เพื่อเปรียบเทียบคอลัมน์ stockQuantity และ reorderPoint ---
    const lowStockProductIds: { id: number }[] = await prisma.$queryRaw`
      SELECT id FROM Product 
      WHERE stockQuantity <= reorderPoint AND reorderPoint IS NOT NULL AND reorderPoint > 0
    `;

    // ตอนนี้เราได้แค่ ID ของสินค้าที่สต็อกน้อย
    const productIds = lowStockProductIds.map(p => p.id);

    // ถ้าไม่มีสินค้าสต็อกน้อยเลย ก็ส่ง array ว่างกลับไป
    if (productIds.length === 0) {
      return { lowStockProducts: [] };
    }
    
    // ดึงข้อมูลเต็มๆ ของสินค้าเหล่านั้นอีกครั้ง
    const lowStockProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        supplier: true,
      },
      orderBy: {
        stockQuantity: 'asc',
      },
    });

    return { lowStockProducts };

  } catch (error) {
    console.error("Failed to fetch low stock report:", error);
    // กรณีเกิด Error ให้ส่ง array ว่างกลับไปเพื่อไม่ให้หน้าเว็บพัง
    return { lowStockProducts: [] };
  }
}