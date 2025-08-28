// File: src/routes/reports/top-selling/+page.server.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function load() {
  // --- Prisma Query ขั้นสูง ---
  const topSellingProducts = await prisma.orderItem.groupBy({
    by: ['productId'], // 1. จัดกลุ่มตาม ID ของสินค้า
    _sum: {
      quantity: true, // 2. คำนวณ "ผลรวม" ของจำนวนที่ขายได้ในแต่ละกลุ่ม
    },
    orderBy: {
      _sum: {
        quantity: 'desc', // 3. "เรียงลำดับ" กลุ่มจากจำนวนที่ขายได้มากที่สุดไปน้อยที่สุด
      },
    },
    take: 10, // 4. เอามาแค่ 10 อันดับแรก
  });

  // ตอนนี้ topSellingProducts จะมีหน้าตาแบบนี้:
  // [ { productId: 1, _sum: { quantity: 50 } }, { productId: 2, _sum: { quantity: 45 } } ]

  // เราต้องดึงข้อมูลสินค้า (ชื่อ, บาร์โค้ด) มาประกอบร่างด้วย
  const productIds = topSellingProducts.map(item => item.productId);

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
    select: {
      id: true,
      name: true,
      barcode: true,
    }
  });

  // นำข้อมูล 2 ส่วนมาประกอบร่างกันให้สมบูรณ์
  const reportData = topSellingProducts.map(item => {
    const productInfo = products.find(p => p.id === item.productId);
    return {
      productId: item.productId,
      totalQuantity: item._sum.quantity,
      name: productInfo?.name || 'N/A',
      barcode: productInfo?.barcode || 'N/A',
    };
  });

  return { topSellingProducts: reportData };
}