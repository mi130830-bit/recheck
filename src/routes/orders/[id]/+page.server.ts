// File: src/routes/orders/[id]/+page.server.ts

import { PrismaClient } from '@prisma/client';
import { error } from '@sveltejs/kit';

const prisma = new PrismaClient();

// SvelteKit จะส่ง `params` ที่มี `id` จาก URL มาให้
export async function load({ params }) {
  const orderId = parseInt(params.id);

  // ดึงข้อมูลบิลใบเดียว โดยอ้างอิงจาก id
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    // ดึงข้อมูลที่เกี่ยวข้องมาให้หมด!
    include: {
      customer: true, // ข้อมูลลูกค้า
      items: {        // รายการสินค้าทั้งหมดในบิลนี้
        include: {
          product: true, // และข้อมูลของสินค้าแต่ละตัวด้วย
        },
      },
    },
  });
  
  // ถ้าหาบิลไม่เจอ ให้แสดงหน้า 404 Not Found
  if (!order) {
    throw error(404, 'ไม่พบข้อมูลบิลนี้');
  }

  return { order };
}