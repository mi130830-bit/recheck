// File: src/routes/orders/+page.server.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function load() {
  // ดึงข้อมูล Order ทั้งหมด พร้อมกับข้อมูล "ลูกค้า" ที่เกี่ยวข้อง
  const orders = await prisma.order.findMany({
    include: {
      customer: true, // ดึงข้อมูลจากตาราง Customer ที่ผูกกันอยู่มาด้วย
    },
    orderBy: {
      createdAt: 'desc', // เรียงจากบิลล่าสุดไปเก่าสุด
    },
  });

  return { orders };
}