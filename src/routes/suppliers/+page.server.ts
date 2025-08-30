// File: src/routes/suppliers/+page.server.ts (Final Refactored Version)

import { db } from '$lib/server/db'; // [ปรับปรุง] ใช้ db instance กลาง ไม่สร้าง PrismaClient ใหม่
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'; // [ปรับปรุง] Import Type ที่ถูกต้อง

// --- ดึงข้อมูลทั้งหมดมาแสดง ---
export const load: PageServerLoad = async () => {
  const suppliers = await db.supplier.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return { suppliers };
};


// --- จัดการ Form Actions ---
export const actions: Actions = {
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id');

    if (!id || typeof id !== 'string') {
      return fail(400, { message: 'Invalid request' });
    }

    const supplierId = Number(id);

    try {
      // 1. ตรวจสอบความสัมพันธ์กับ Product
      const productCount = await db.product.count({
        where: { supplierId: supplierId },
      });

      if (productCount > 0) {
        return fail(400, {
          message: `ไม่สามารถลบผู้ขายได้ เนื่องจากยังมีสินค้าผูกอยู่ ${productCount} รายการ`,
        });
      }
      
      // 2. ตรวจสอบความสัมพันธ์กับ PurchaseOrder (ใบรับของ)
      const poCount = await db.purchaseOrder.count({
          where: { supplierId: supplierId }
      });
      
      if (poCount > 0) {
          return fail(400, { message: `ไม่สามารถลบผู้ขายได้ เนื่องจากมีประวัติการรับของ ${poCount} ครั้ง` });
      }

      // ถ้าไม่มีอะไรผูกอยู่ ก็สามารถลบได้
      await db.supplier.delete({
        where: { id: supplierId },
      });

    } catch (err) {
      console.error(err);
      return fail(500, { message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
    }

    return { success: true };
  },
};