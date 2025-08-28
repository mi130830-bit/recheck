// File: src/routes/api/orders/[id]/+server.ts

import { PrismaClient } from '@prisma/client';
import { json, error } from '@sveltejs/kit';

const prisma = new PrismaClient();

// ฟังก์ชันสำหรับรับ request แบบ DELETE
export async function DELETE({ params }) {
  const orderId = parseInt(params.id);

  if (isNaN(orderId)) {
    throw error(400, 'Invalid Order ID');
  }

  try {
    // Prisma ต้องการให้ลบ "ลูก" (OrderItem) ก่อน ถึงจะลบ "แม่" (Order) ได้
    // เราจึงต้องทำใน transaction
    await prisma.$transaction(async (tx) => {
      // 1. ลบ OrderItem ทั้งหมดที่เกี่ยวข้องกับ Order นี้
      await tx.orderItem.deleteMany({
        where: { orderId: orderId },
      });

      // 2. ลบ Order หลัก
      await tx.order.delete({
        where: { id: orderId },
      });
    });

    // ส่ง response ว่างเปล่ากลับไป พร้อม status 204 No Content (สำเร็จ)
    return new Response(null, { status: 204 });

  } catch (err) {
    console.error('Error deleting order:', err);
    // ถ้าหา Order ไม่เจอ หรือเกิดปัญหาอื่น
    if (err.code === 'P2025') {
        return new Response(null, { status: 204 }); // ถ้าไม่เจอก็ถือว่าลบสำเร็จไปแล้ว
    }
    throw error(500, 'ไม่สามารถลบบิลได้');
  }
}