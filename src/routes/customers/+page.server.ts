// File: src/routes/customers/+page.server.ts

import { PrismaClient } from '@prisma/client';
import { fail } from '@sveltejs/kit';

const prisma = new PrismaClient();


export async function load() {
  const customers = await prisma.customer.findMany({
    orderBy: {
      createdAt: 'desc',
          },
  });
  return { customers }; // <<<< และต้อง return ค่า customers
} // <<<< และปีกกาปิดของ `load` function

// --- จัดการ Form Actions (ตอนนี้มีแค่ 'delete') ---
export const actions = {
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id');

    if (!id || typeof id !== 'string') {
      return fail(400, { message: 'Invalid request' });
    }

    try {
      // ก่อนลบ customer ต้องเช็คก่อนว่ามี Product ผูกอยู่หรือไม่
      const productCount = await prisma.product.count({
        where: { customerId: Number(id) },
      });

      if (orderCount > 0) {
        return fail(400, {
          message: `ไม่สามารถลบผู้ขายได้ เนื่องจากยังมีสินค้าผูกอยู่ ${orderCount} รายการ`,
        });
      }      

      await prisma.customer.delete({
        where: { id: Number(id) },
      });
    } catch (err) {
      console.error(err);
      return fail(500, { message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
    }

     return { success: true };
  },
};
