// File: src/routes/reports/+page.server.ts (Final Corrected Version)

import { db } from '$lib/server/db'; // [แก้ไข] ใช้ db จากที่เดียว ไม่สร้าง PrismaClient ใหม่
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // --- 1. คำนวณยอดขาย "วันนี้" ---
  const todaySales = await db.order.aggregate({
    _sum: { total: true },
    _count: { _all: true },
    where: {
      status: { in: ['COMPLETED', 'CREDIT'] },
      createdAt: { gte: todayStart },
    },
  });

  // --- 2. คำนวณยอดขาย "ทั้งหมด" ---
  const allTimeSales = await db.order.aggregate({
    _sum: { total: true },
    _count: { _all: true },
    where: { status: { in: ['COMPLETED', 'CREDIT'] } },
  });

  // --- 3. ดึงรายการบิล 10 บิลล่าสุด ---
  const recentOrdersFromDb = await db.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { customer: true },
  });

  // [จุดแก้ไขที่ 1] สร้าง object stats และแปลงค่า Decimal เป็น Number
  const stats = {
    todayRevenue: todaySales._sum.total ? todaySales._sum.total.toNumber() : 0,
    todayOrders: todaySales._count._all,
    allTimeRevenue: allTimeSales._sum.total ? allTimeSales._sum.total.toNumber() : 0,
    allTimeOrders: allTimeSales._count._all,
  };

  // [จุดแก้ไขที่ 2] แปลงค่า Decimal ใน array recentOrders
  const recentOrders = recentOrdersFromDb.map(order => ({
    ...order,
    total: order.total.toNumber(),
    received: order.received ? order.received.toNumber() : null,
    change: order.change ? order.change.toNumber() : null,
  }));

  // 4. ส่งข้อมูลที่แปลงค่าเรียบร้อยแล้วทั้งหมดออกไป
  return {
    stats,
    recentOrders,
  };
}