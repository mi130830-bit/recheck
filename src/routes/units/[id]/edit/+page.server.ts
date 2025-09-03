// src/routes/units/[id]/edit/+page.server.ts

import { db } from '$lib/server/db';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (isNaN(id)) {
		throw error(404, 'ไม่พบรายการ');
	}
	const unit = await db.unit.findUnique({ where: { id } });
	if (!unit) {
		throw error(404, 'ไม่พบข้อมูลหน่วยสินค้านี้');
	}
	return { unit };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const id = Number(params.id);
		if (!name || name.trim() === '') {
			return fail(400, { name, error: 'กรุณากรอกชื่อหน่วย' });
		}
		try {
			await db.unit.update({ where: { id }, data: { name: name.trim() } });
		} catch (err: any) {
			if (err.code === 'P2002') {
				return fail(400, { name, error: `ชื่อหน่วย "${name}" นี้มีอยู่แล้วในระบบ` });
			}
			return fail(500, { name, error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
		}
		throw redirect(303, '/units');
	},
	delete: async ({ params }) => {
		const id = Number(params.id);
		try {
			const productsUsingUnit = await db.product.count({ where: { unitId: id } });
			if (productsUsingUnit > 0) {
				return fail(400, { deleteError: `ไม่สามารถลบได้ เนื่องจากมีสินค้า ${productsUsingUnit} รายการใช้หน่วยนี้อยู่` });
			}
			await db.unit.delete({ where: { id } });
		} catch (err) {
			return fail(500, { deleteError: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
		}
		throw redirect(303, '/units');
	}
};