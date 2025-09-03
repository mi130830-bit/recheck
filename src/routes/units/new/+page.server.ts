// src/routes/units/new/+page.server.ts

import { db } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name') as string;

		if (!name || name.trim() === '') {
			return fail(400, { name, error: 'กรุณากรอกชื่อหน่วย' });
		}

		try {
			await db.unit.create({
				data: { name: name.trim() }
			});
		} catch (err: any) {
			if (err.code === 'P2002') {
				return fail(400, { name, error: `ชื่อหน่วย "${name}" นี้มีอยู่แล้วในระบบ` });
			}
			console.error(err);
			return fail(500, { name, error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
		}

		throw redirect(303, '/units');
	}
};