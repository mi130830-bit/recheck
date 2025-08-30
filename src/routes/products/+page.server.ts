// Path: src/routes/products/+page.server.ts (Final Corrected Version based on your code)

import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'; // [เพิ่ม] Import Actions type

// ===================== [ส่วน Load - ยกเครื่องใหม่ทั้งหมด] =====================
export const load: PageServerLoad = async ({ url }) => {
	// 1. กำหนดค่าพื้นฐานและอ่านค่าจาก URL
	const page = Number(url.searchParams.get('page') ?? '1');
	const limit = 25; // กำหนดค่าตายตัวไปเลยว่าหน้าละ 25 รายการ
	const query = url.searchParams.get('query') ?? '';

	// 2. สร้างเงื่อนไขการค้นหาสำหรับ Prisma
	const whereCondition = query
		? {
				OR: [
					{ name: { contains: query } },
					{ alias: { contains: query } },
					{ barcode: { contains: query } }
				]
		  }
		: {};

	// 3. ดึงข้อมูลสินค้าตามเงื่อนไข (ทั้งแบบมี query และไม่มี)
	const productsFromDb = await db.product.findMany({
		where: whereCondition,
		skip: (page - 1) * limit,
		take: limit,
		orderBy: { createdAt: 'desc' },
		include: { supplier: true } // ดึงข้อมูล supplier มาด้วย (เหมือนเดิม)
	});

	// 4. นับจำนวนสินค้าทั้งหมดที่ตรงกับเงื่อนไข (สำหรับสร้าง Pagination)
	const totalItems = await db.product.count({ where: whereCondition });

	// 5. แปลงค่า Decimal เป็น Number (เหมือนเดิม)
	const products = productsFromDb.map((p) => ({
		...p,
		costPrice: p.costPrice.toNumber(),
		retailPrice: p.retailPrice.toNumber(),
		wholesalePrice: p.wholesalePrice ? p.wholesalePrice.toNumber() : null
	}));
	
	// 6. ส่งข้อมูลทั้งหมดกลับไปที่ Frontend
	return {
		products,
		totalItems,
		currentPage: page,
		limit,
		query,
		totalPages: Math.ceil(totalItems / limit)
	};
};

// ===================== [ส่วน Actions - เหมือนเดิมทุกประการ] =====================
export const actions: Actions = {
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get('id');
    if (!id || typeof id !== 'string') {
      return fail(400, { message: 'Invalid request' });
    }

    try {
      const orderItemCount = await db.orderItem.count({ where: { productId: Number(id) } });
      if (orderItemCount > 0) {
        return fail(400, { message: `ไม่สามารถลบสินค้าได้ เนื่องจากมีประวัติการขายอยู่` });
      }

      const purchaseItemCount = await db.purchaseOrderItem.count({ where: { productId: Number(id) } });
      if (purchaseItemCount > 0) {
        return fail(400, { message: `ไม่สามารถลบสินค้าได้ เนื่องจากมีประวัติการรับของเข้า` });
      }
      
      await db.product.delete({ where: { id: Number(id) } });
    } catch (err) {
      console.error(err);
      return fail(500, { message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
    }

    return { success: true };
  },
};