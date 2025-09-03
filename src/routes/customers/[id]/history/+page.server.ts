import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const customerId = Number(params.id);
	if (isNaN(customerId)) {
		throw error(400, 'รหัสลูกค้าไม่ถูกต้อง');
	}

	// 1. ดึงข้อมูลลูกค้าหลัก (เหมือนเดิม)
	const customer = await db.customer.findUnique({
		where: { id: customerId }
	});

	if (!customer) {
		throw error(404, 'ไม่พบข้อมูลลูกค้า');
	}

	// 2. [ปรับปรุง] ดึงข้อมูลบิลขาย โดยไม่จำเป็นต้อง include ข้อมูล items
	const orders = await db.order.findMany({
		where: { customerId: customerId },
		// ไม่ต้องมี include ที่นี่แล้ว
		orderBy: {
			createdAt: 'desc'
		}
	});

	// 3. แปลงค่า Decimal เป็น Number (เหมือนเดิม)
	const serializableCustomer = {
		...customer,
		creditLimit: customer.creditLimit ? customer.creditLimit.toNumber() : null
	};

	// 4. [ปรับปรุง] การแปลงค่าจะง่ายขึ้นมาก เพราะไม่มีข้อมูลซ้อนแล้ว
	const serializableOrders = orders.map((order) => ({
		...order,
		total: order.total.toNumber(),
		received: order.received ? order.received.toNumber() : null,
		change: order.change ? order.change.toNumber() : null
		// ไม่ต้อง map items ที่ซ้อนอยู่ข้างในอีกต่อไป
	}));

	// 5. ส่งข้อมูลทั้งหมดกลับไปให้หน้าเว็บ
	return {
		customer: serializableCustomer,
		orders: serializableOrders
	};
};