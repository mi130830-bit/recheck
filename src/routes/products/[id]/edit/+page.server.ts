// Path: src/routes/products/[id]/edit/+page.server.ts (Final Corrected Version)

import { db } from '$lib/server/db';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const productId = Number(params.id);
  if (isNaN(productId)) {
    throw error(404, 'ไม่พบข้อมูลสินค้า');
  }

  const productFromDb = await db.product.findUnique({
    where: { id: productId },
  });

  if (!productFromDb) {
    throw error(404, 'ไม่พบข้อมูลสินค้า');
  }

  const suppliers = await db.supplier.findMany({ orderBy: { name: 'asc' } });

  const product = {
    ...productFromDb,
    costPrice: productFromDb.costPrice.toNumber(),
    retailPrice: productFromDb.retailPrice.toNumber(),
    wholesalePrice: productFromDb.wholesalePrice ? productFromDb.wholesalePrice.toNumber() : null,
  };

  return { product, suppliers };
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const data = await request.formData();
    const name = data.get('name') as string;
    const supplierIdStr = data.get('supplierId') as string;
    
    if (!name || !supplierIdStr) {
      return fail(400, { error: 'กรุณากรอกข้อมูล * ให้ครบถ้วน' });
    }

    try {
      await db.product.update({
        where: { id: Number(params.id) },
        data: {
          name,
          alias: data.get('alias') as string || null,
          barcode: data.get('barcode') as string || null,
          category: data.get('category') as string || null,
          unit: data.get('unit') as string || null,
          costPrice: parseFloat(data.get('costPrice') as string),
          retailPrice: parseFloat(data.get('retailPrice') as string),
          wholesalePrice: data.get('wholesalePrice') ? parseFloat(data.get('wholesalePrice') as string) : null,
          vatType: data.get('vatType') as string || null,
          stockQuantity: parseInt(data.get('stockQuantity') as string),
          trackStock: data.get('notTrackStock') !== 'on',
          reorderPoint: data.get('reorderPoint') ? parseInt(data.get('reorderPoint') as string) : null,
          shelfLocation: data.get('shelfLocation') as string || null,
          notes: data.get('notes') as string || null,
          allowPriceEdit: data.get('allowPriceEdit') === 'on',
          supplierId: parseInt(supplierIdStr),
        },
      });
    } catch (err: any) {
      console.error(err);
      if (err.code === 'P2002' && err.meta?.target?.includes('barcode')) {
        return fail(400, { error: `รหัสบาร์โค้ดนี้มีอยู่แล้วในระบบ` });
      }
      return fail(500, { error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
    }

    throw redirect(303, `/products`);
  },
};