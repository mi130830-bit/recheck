// File: src/routes/reports/+page.server.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function load() {
  // --- คำนวณยอดขาย "วันนี้" ---
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todaySales = await prisma.order.aggregate({
    _sum: { total: true },
    _count: { _all: true },
    where: {
      status: { in: ['COMPLETED', 'CREDIT'] }, // นับทั้งขายสดและขายเชื่อ
      createdAt: { gte: todayStart, lte: todayEnd },
    },
  });

  // --- คำนวณยอดขาย "ทั้งหมด" ---
  const allTimeSales = await prisma.order.aggregate({
    _sum: { total: true },
    _count: { _all: true },
    where: { status: { in: ['COMPLETED', 'CREDIT'] } },
  });

  // --- ดึงรายการบิล 10 บิลล่าสุด ---
  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { customer: true },
  });

  return {
    stats: {
      todayRevenue: todaySales._sum.total ?? 0,
      todayOrders: todaySales._count._all,
      allTimeRevenue: allTimeSales._sum.total ?? 0,
      allTimeOrders: allTimeSales._count._all,
    },
    recentOrders,
  };
}