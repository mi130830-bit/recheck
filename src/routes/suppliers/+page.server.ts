// File: src/routes/suppliers/+page.server.ts (ฉบับแก้ไขสมบูรณ์)

import { PrismaClient } from '@prisma/client';
import { fail } from '@sveltejs/kit';

const prisma = new PrismaClient();

// --- ดึงข้อมูลทั้งหมดมาแสดง ---
export async function load() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return { suppliers };
}


// --- จัดการ Form Actions (ตอนนี้มีแค่ 'delete') ---
export const actions = {
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id');

    if (!id || typeof id !== 'string') {
      return fail(400, { message: 'Invalid request' });
    }

    try {
      // 1. ก่อนลบ Supplier, เช็คว่ามี Product ผูกอยู่หรือไม่
      const productCount = await prisma.product.count({
        where: { supplierId: Number(id) },
      });

      if (productCount > 0) {
        return fail(400, {
          message: `ไม่สามารถลบผู้ขายได้ เนื่องจากยังมีสินค้าผูกอยู่ ${productCount} รายการ`,
        });
      }
      
      // 2. ก่อนลบ Supplier, เช็คว่ามี PurchaseOrder (ใบรับของ) ผูกอยู่หรือไม่
      const poCount = await prisma.purchaseOrder.count({
          where: { supplierId: Number(id) }
      });
      
      if (poCount > 0) {
          return fail(400, { message: `ไม่สามารถลบผู้ขายได้ เนื่องจากมีประวัติการรับของ ${poCount} ครั้ง` });
      }

      // ถ้าไม่มีอะไรผูกอยู่ ก็สามารถลบได้
      await prisma.supplier.delete({
        where: { id: Number(id) },
      });

    } catch (err) {
      console.error(err);
      return fail(500, { message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
    }

    // ไม่ต้อง return อะไรเป็นพิเศษ เพราะหน้าเว็บจะโหลดข้อมูลใหม่เอง
    return { success: true };
  },
};