// src/routes/units/+page.server.ts

import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const units = await db.unit.findMany({
		orderBy: { name: 'asc' }
	});
	return { units };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');

		if (!id) {
			return fail(400, { message: 'Invalid request' });
		}

		try {
			// ตรวจสอบว่ามีสินค้าใช้หน่วยนี้อยู่หรือไม่
			const productsUsingUnit = await db.product.count({
				where: { unitId: Number(id) }
			});

			if (productsUsingUnit > 0) {
				return fail(400, {
					message: `ไม่สามารถลบได้ เนื่องจากมีสินค้า ${productsUsingUnit} รายการใช้หน่วยนี้อยู่`
				});
			}

			await db.unit.delete({
				where: { id: Number(id) }
			});
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
		}

		return { success: true };
	}
};