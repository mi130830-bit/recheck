// File: src/routes/products/+page.server.ts (ฉบับอัปเดต)

import { PrismaClient } from '@prisma/client';
import { fail } from '@sveltejs/kit';

const prisma = new PrismaClient();

export async function load() {
  const products = await prisma.product.findMany({
    include: {
      supplier: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return { products };
}

export const actions = {
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id');
    if (!id || typeof id !== 'string') {
      return fail(400, { message: 'Invalid request' });
    }

    try {
      // ก่อนลบ Product ต้องเช็คว่ามีประวัติการขาย (OrderItem) หรือไม่
      const orderItemCount = await prisma.orderItem.count({
        where: { productId: Number(id) },
      });

      if (orderItemCount > 0) {
        return fail(400, { message: `ไม่สามารถลบสินค้าได้ เนื่องจากมีประวัติการขายอยู่` });
      }

      // เช็คประวัติการรับของเข้า
      const purchaseItemCount = await prisma.purchaseOrderItem.count({
          where: { productId: Number(id) }
      });

      if (purchaseItemCount > 0) {
          return fail(400, { message: `ไม่สามารถลบสินค้าได้ เนื่องจากมีประวัติการรับของเข้า` });
      }

      await prisma.product.delete({
        where: { id: Number(id) },
      });
    } catch (err) {
      console.error(err);
      return fail(500, { message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
    }

    return { success: true };
  },
};