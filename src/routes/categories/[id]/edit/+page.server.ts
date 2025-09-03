// src/routes/categories/[id]/edit/+page.server.ts

import { db } from '$lib/server/db';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

// 1. Load: ดึงข้อมูลมาแสดง
export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (isNaN(id)) {
		throw error(404, 'ไม่พบรายการ');
	}

	const category = await db.category.findUnique({
		where: { id }
	});

	if (!category) {
		throw error(404, 'ไม่พบข้อมูลประเภทสินค้านี้');
	}

	return { category };
};

// 2. Actions: รับข้อมูลจากฟอร์ม
export const actions: Actions = {
	// Action สำหรับอัปเดต
	update: async ({ request, params }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const id = Number(params.id);

		if (!name || name.trim() === '') {
			return fail(400, { name, error: 'กรุณากรอกชื่อประเภทสินค้า' });
		}

		try {
			await db.category.update({
				where: { id },
				data: { name: name.trim() }
			});
		} catch (err: any) {
			if (err.code === 'P2002') {
				return fail(400, { name, error: `ชื่อประเภท "${name}" นี้มีอยู่แล้วในระบบ` });
			}
			console.error(err);
			return fail(500, { name, error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
		}

		throw redirect(303, '/categories');
	},

	// Action สำหรับลบ
	delete: async ({ params }) => {
		const id = Number(params.id);

		try {
			const productsUsingCategory = await db.product.count({
				where: { categoryId: id }
			});

			if (productsUsingCategory > 0) {
				return fail(400, {
					deleteError: `ไม่สามารถลบได้ เนื่องจากมีสินค้า ${productsUsingCategory} รายการใช้ประเภทนี้อยู่`
				});
			}

			await db.category.delete({ where: { id } });
		} catch (err) {
			console.error(err);
			return fail(500, { deleteError: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
		}

		throw redirect(303, '/categories');
	}
};