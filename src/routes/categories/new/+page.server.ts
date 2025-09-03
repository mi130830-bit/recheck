// src/routes/categories/new/+page.server.ts

import { db } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name') as string;

		// 1. ตรวจสอบว่าชื่อถูกส่งมาหรือไม่
		if (!name || name.trim() === '') {
			return fail(400, { name, error: 'กรุณากรอกชื่อประเภทสินค้า' });
		}

		try {
			// 2. พยายามบันทึกข้อมูลลงฐานข้อมูล
			await db.category.create({
				data: {
					name: name.trim()
				}
			});
		} catch (err: any) {
			// 3. จัดการ Error กรณีชื่อซ้ำ (Prisma error code P2002)
			if (err.code === 'P2002') {
				return fail(400, { name, error: `ชื่อประเภท "${name}" นี้มีอยู่แล้วในระบบ` });
			}
			// จัดการ Error อื่นๆ ที่อาจเกิดขึ้น
			console.error(err);
			return fail(500, { name, error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
		}

		// 4. ถ้าบันทึกสำเร็จ ให้ Redirect กลับไปที่หน้ารายการ
		throw redirect(303, '/categories');
	}
};