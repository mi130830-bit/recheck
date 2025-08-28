// File: src/routes/api/orders/[id]/cancel/+server.ts
import { PrismaClient } from '@prisma/client';
import { json, error } from '@sveltejs/kit';
const prisma = new PrismaClient();

export async function POST({ request, params }) {
  const orderId = Number(params.id);
  const { shouldRestock } = await request.json();

  try {
    const orderToCancel = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!orderToCancel || orderToCancel.status === 'CANCELLED') {
      return json({ message: 'บิลนี้ถูกยกเลิกไปแล้ว' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. อัปเดตสถานะบิลเป็น CANCELLED
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });

      // 2. ถ้าผู้ใช้เลือก "คืนสต็อก"
      if (shouldRestock && orderToCancel.status !== 'HELD') {
        for (const item of orderToCancel.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          });
        }
      }
    });
    return json({ success: true, message: 'ยกเลิกบิลเรียบร้อย' });
  } catch (err) {
    throw error(500, 'ไม่สามารถยกเลิกบิลได้');
  }
}