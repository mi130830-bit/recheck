// Path: src/routes/customers/+page.server.ts (Final Version with Search & Pagination)

import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	// 1. กำหนดค่าพื้นฐานและอ่านค่าจาก URL
	const page = Number(url.searchParams.get('page') ?? '1');
	const limit = 25; // แสดงผลหน้าละ 25 รายการ
	const query = url.searchParams.get('query') ?? '';

	// 2. สร้างเงื่อนไขการค้นหา (ค้นจาก รหัส, ชื่อ, สกุล, เบอร์โทร)
	const whereCondition = query
		? {
				OR: [
					{ memberCode: { contains: query } },
					{ firstName: { contains: query } },
					{ lastName: { contains: query } },
					{ phone: { contains: query } }
				]
		  }
		: {};

	// 3. ดึงข้อมูลลูกค้า "เฉพาะหน้าปัจจุบัน"
	const customersFromDb = await db.customer.findMany({
		where: whereCondition,
		skip: (page - 1) * limit,
		take: limit,
		orderBy: { createdAt: 'desc' }
	});

	// 4. นับจำนวนลูกค้า "ทั้งหมด" ที่ตรงกับเงื่อนไข
	const totalItems = await db.customer.count({ where: whereCondition });

	// 5. [สำคัญ] แปลงค่า Decimal เป็น Number
	const customers = customersFromDb.map((c) => ({
		...c,
		creditLimit: c.creditLimit ? c.creditLimit.toNumber() : null
	}));
	
	// 6. ส่งข้อมูลทั้งหมดกลับไป
	return {
		customers,
		totalItems,
		currentPage: page,
		limit,
		query,
		totalPages: Math.ceil(totalItems / limit)
	};
};

// Actions (delete) ยังคงทำงานเหมือนเดิม
export const actions: Actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') {
			return fail(400, { message: 'Invalid ID' });
		}
		try {
			// [สำคัญ] ตรวจสอบว่ามี Order ผูกกับลูกค้านี้หรือไม่ก่อนลบ
            const orderCount = await db.order.count({
                where: { customerId: Number(id) }
            });
            if (orderCount > 0) {
                return fail(400, { message: `ไม่สามารถลบได้ เนื่องจากลูกค้ามีประวัติการสั่งซื้อ ${orderCount} รายการ` });
            }
			await db.customer.delete({ where: { id: Number(id) } });
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
		}
		return { success: true };
	}
};