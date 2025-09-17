import { db } from '$lib/server/db';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { Prisma } from '@prisma/client';

// --- LOAD FUNCTION: ดึงข้อมูลลูกค้ามาแสดงในฟอร์ม ---
export const load: PageServerLoad = async ({ params }) => {
	const customer = await db.customer.findUnique({ where: { id: Number(params.id) } });
	if (!customer) throw error(404, 'ไม่พบข้อมูลลูกค้า');
	
	// แปลง Decimal เป็น Number ก่อนส่ง
	const serializableCustomer = {
		...customer,
		creditLimit: customer.creditLimit ? customer.creditLimit.toNumber() : null
	};
	return { customer: serializableCustomer };
};

// --- ACTIONS: จัดการการส่งข้อมูลจากฟอร์ม ---
export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const formValues: { [key: string]: any } = Object.fromEntries(formData);
		
		// 1. Validation ข้อมูล
		if (!formValues.memberCode || !formValues.firstName) {
			return fail(400, {
				error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
				values: formValues // [ปรับปรุง] ส่งค่าที่กรอกกลับไป
			});
		}

		// 2. บันทึกข้อมูล
		try {
			await db.customer.update({
				where: { id: Number(params.id) },
				data: {
					memberCode: formValues.memberCode,
					firstName: formValues.firstName,
					title: formValues.title || null,
					lastName: formValues.lastName || null,
					phone: formValues.phone || null,
					email: formValues.email || null,
					address: formValues.address || null,
					shippingAddress: formValues.shippingAddress || null
				}
			});
		} catch (err) {
			// [ปรับปรุง] 3. จัดการ Error จาก Prisma
			if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
				const field = (err.meta?.target as string[])?.join(', ') || 'ข้อมูล';
				return fail(400, {
					error: `รหัสสมาชิก "${formValues.memberCode}" นี้มีอยู่แล้ว`,
					values: formValues
				});
			}
			console.error(err);
			return fail(500, {
				error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
				values: formValues
			});
		}

		throw redirect(303, '/customers');
	}
};
