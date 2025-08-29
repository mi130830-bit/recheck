// File: src/routes/products/+page.server.ts (Final Corrected Version)

import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const productsFromDb = await db.product.findMany({
		orderBy: {
			createdAt: 'desc'
		},
		// [แก้ไข] เพิ่มบรรทัดนี้เพื่อดึงข้อมูล supplier มาด้วย
		include: {
			supplier: true
		}
	});

	const products = productsFromDb.map((p) => ({
		...p,
		costPrice: p.costPrice.toNumber(),
		retailPrice: p.retailPrice.toNumber(),
		wholesalePrice: p.wholesalePrice ? p.wholesalePrice.toNumber() : null
	}));

	return { products };
};

export const actions = {
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id');
    if (!id || typeof id !== 'string') {
      return fail(400, { message: 'Invalid request' });
    }

    try {
      const orderItemCount = await db.orderItem.count({
        where: { productId: Number(id) },
      });
      if (orderItemCount > 0) {
        return fail(400, { message: `ไม่สามารถลบสินค้าได้ เนื่องจากมีประวัติการขายอยู่` });
      }

      const purchaseItemCount = await db.purchaseOrderItem.count({
          where: { productId: Number(id) }
      });
      if (purchaseItemCount > 0) {
          return fail(400, { message: `ไม่สามารถลบสินค้าได้ เนื่องจากมีประวัติการรับของเข้า` });
      }
      
      await db.product.delete({
        where: { id: Number(id) },
      });
    } catch (err) {
      console.error(err);
      return fail(500, { message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
    }

    return { success: true };
  },
};