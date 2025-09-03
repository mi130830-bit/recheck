// src/routes/categories/+page.server.ts (Final Version with Delete Action)

import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

// Load function (เหมือนเดิม)
export const load: PageServerLoad = async () => {
	const categories = await db.category.findMany({
		orderBy: { name: 'asc' }
	});
	return { categories };
};

// [เพิ่ม] Actions object สำหรับรับคำสั่งจากฟอร์ม
export const actions: Actions = {
	// Action สำหรับลบประเภทสินค้า
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');

		if (!id) {
			return fail(400, { error: 'Invalid request' });
		}

		try {
			await db.category.delete({
				where: { id: Number(id) }
			});
			// ส่งกลับสถานะสำเร็จ (แต่ไม่ต้องส่งข้อมูลอะไรกลับไป)
			return { success: true };
		} catch (error: any) {
			// ดักจับ Error กรณีที่ประเภทนี้ถูกใช้งานโดยสินค้าอยู่ จะลบไม่ได้
			if (error.code === 'P2003') { // Foreign key constraint failed
				return fail(400, { error: 'ไม่สามารถลบได้ เนื่องจากมีสินค้าใช้ประเภทนี้อยู่' });
			}
			// Error อื่นๆ
			return fail(500, { error: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
		}
	}
};