// Path: src/routes/reports/+page.server.ts (Final Corrected Version)

import { db } from '$lib/server/db';
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

  // --- 4. [สำคัญ] แปลงค่า Decimal ทั้งหมด ---
  
  // แปลงค่าใน stats
  const stats = {
    todayRevenue: todaySales._sum.total ? todaySales._sum.total.toNumber() : 0,
    todayOrders: todaySales._count._all,
    allTimeRevenue: allTimeSales._sum.total ? allTimeSales._sum.total.toNumber() : 0,
    allTimeOrders: allTimeSales._count._all,
  };

  // แปลงค่าใน recentOrders และข้อมูล customer ที่ซ้อนอยู่ข้างใน
  const recentOrders = recentOrdersFromDb.map(order => {
    const serializableCustomer = order.customer
      ? {
          ...order.customer,
          creditLimit: order.customer.creditLimit ? order.customer.creditLimit.toNumber() : null
        }
      : null;

    return {
      ...order,
      total: order.total.toNumber(),
      received: order.received ? order.received.toNumber() : null,
      change: order.change ? order.change.toNumber() : null,
      customer: serializableCustomer
    };
  });

  // --- 5. ส่งข้อมูลที่แปลงค่าเรียบร้อยแล้วทั้งหมดออกไป ---
  return {
    stats,
    recentOrders,
  };
}