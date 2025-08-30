// Path: src/routes/products/new/+page.server.ts (Final Corrected Version)

import { db } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

// --- LOAD FUNCTION: ดึงข้อมูลที่จำเป็นสำหรับแสดงในฟอร์ม ---
export const load: PageServerLoad = async () => {
  // ดึงข้อมูลผู้ขายทั้งหมด เพื่อเอาไปสร้างเป็นตัวเลือกใน Dropdown
  const suppliers = await db.supplier.findMany({
    orderBy: { name: 'asc' },
  });
  return { suppliers };
};

// --- ACTIONS: จัดการการ submit ฟอร์มเพื่อสร้างสินค้าใหม่ ---
export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const name = data.get('name') as string;
    const barcode = data.get('barcode') as string | null;
    const supplierIdStr = data.get('supplierId') as string;

    // Validation
    if (!name || !supplierIdStr) {
      return fail(400, { error: 'กรุณากรอกข้อมูล * ให้ครบถ้วน' });
    }
    const supplierId = parseInt(supplierIdStr);

    try {
      await db.product.create({
        data: {
          name, 
          alias: data.get('alias') as string || null,
          barcode: barcode || null,
          category: data.get('category') as string || null,
          unit: data.get('unit') as string || null,
          vatType: data.get('vatType') as string || null,
          notes: data.get('notes') as string || null,
          shelfLocation: data.get('shelfLocation') as string || null,
          costPrice: parseFloat(data.get('costPrice') as string || '0'),
          retailPrice: parseFloat(data.get('retailPrice') as string),
          wholesalePrice: data.get('wholesalePrice') ? parseFloat(data.get('wholesalePrice') as string) : null,
          stockQuantity: parseInt(data.get('stockQuantity') as string || '0'),
          reorderPoint: data.get('reorderPoint') ? parseInt(data.get('reorderPoint') as string) : null,
          points: data.get('points') ? parseInt(data.get('points') as string) : null,
          trackStock: data.get('notTrackStock') !== 'on',
          allowPriceEdit: data.get('allowPriceEdit') === 'on',
          supplierId: supplierId,
        },
      });
    } catch (err: any) {
      console.error(err);
      if (err.code === 'P2002' && err.meta?.target?.includes('barcode')) {
        return fail(400, { error: `รหัสบาร์โค้ด '${barcode}' นี้มีในระบบแล้ว` });
      }
      return fail(500, { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    }

    throw redirect(303, '/products');
  },
};