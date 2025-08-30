// Path: src/routes/customers/new/+page.server.ts (Final Updated Version)

import { db } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const memberCode = data.get('memberCode') as string;
		const firstName = data.get('firstName') as string;
		
		if (!memberCode || !firstName) {
			return fail(400, { error: 'กรุณากรอกรหัสและชื่อสมาชิก' });
		}

		try {
			await db.customer.create({
				data: {
					memberCode,
					firstName,
					title: data.get('title') as string || null,
					lastName: data.get('lastName') as string || null,
					phone: data.get('phone') as string || null,
					email: data.get('email') as string || null,
					address: data.get('address') as string || null,
					// [เพิ่ม] บันทึกที่อยู่จัดส่ง
					shippingAddress: data.get('shippingAddress') as string || null,
				}
			});
		} catch (err: any) {
			if (err.code === 'P2002') {
				return fail(400, { error: `รหัสสมาชิก "${memberCode}" นี้มีอยู่แล้วในระบบ` });
			}
			return fail(500, { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
		}
		
		throw redirect(303, '/customers');
	}
};