// Path: src/routes/customers/[id]/edit/+page.server.ts (Final Updated Version)
import { db } from '$lib/server/db';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const customer = await db.customer.findUnique({ where: { id: Number(params.id) } });
	if (!customer) throw error(404, 'ไม่พบข้อมูลลูกค้า');
	// [แก้ไข] แปลง Decimal เป็น Number ก่อนส่ง
	const serializableCustomer = {
		...customer,
		creditLimit: customer.creditLimit ? customer.creditLimit.toNumber() : null
	}
	return { customer: serializableCustomer };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const data = await request.formData();
		const memberCode = data.get('memberCode') as string;
		const firstName = data.get('firstName') as string;
		if (!memberCode || !firstName) return fail(400, { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });

		try {
			await db.customer.update({
				where: { id: Number(params.id) },
				data: {
					memberCode, firstName,
					title: data.get('title') as string || null,
					lastName: data.get('lastName') as string || null,
					phone: data.get('phone') as string || null,
					email: data.get('email') as string || null,
					address: data.get('address') as string || null,
					// [เพิ่ม] อัปเดตที่อยู่จัดส่ง
					shippingAddress: data.get('shippingAddress') as string || null,
				}
			});
		} catch (err: any) {
			if (err.code === 'P2002') return fail(400, { error: `รหัสสมาชิก "${memberCode}" นี้มีอยู่แล้ว` });
			return fail(500, { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
		}
		throw redirect(303, '/customers');
	}
};