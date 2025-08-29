// File: src/routes/orders/+page.server.ts (Final Corrected Version)

import { db } from '$lib/server/db'; // [แก้ไข] ใช้ db จากที่เดียว ไม่สร้าง PrismaClient ใหม่
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // 1. ดึงข้อมูล Order ทั้งหมดจากฐานข้อมูล
  const ordersFromDb = await db.order.findMany({
    include: {
      customer: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 2. [จุดแก้ไขสำคัญ] แปลงค่า Decimal เป็น Number ก่อนส่งข้อมูลไปที่หน้าเว็บ
  const orders = ordersFromDb.map(order => ({
    ...order, // คัดลอกข้อมูลเดิมทั้งหมด
    // เขียนทับเฉพาะ field ที่เป็น Decimal
    total: order.total.toNumber(),
    received: order.received ? order.received.toNumber() : null,
    change: order.change ? order.change.toNumber() : null,
  }));

  // 3. ส่งข้อมูลที่แปลงค่าแล้วออกไป
  return { orders };
}