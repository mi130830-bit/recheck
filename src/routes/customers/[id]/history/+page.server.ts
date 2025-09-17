import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const customerId = Number(params.id);
	if (isNaN(customerId)) {
		throw error(400, 'รหัสลูกค้าไม่ถูกต้อง');
	}

	// --- 1. ดึงข้อมูลลูกค้าและบิลขายพร้อมกันเพื่อประสิทธิภาพ ---
	const [customer, orders] = await db.$transaction([
		db.customer.findUnique({ where: { id: customerId } }),
		db.order.findMany({
			where: { customerId: customerId },
			orderBy: { createdAt: 'desc' }
		})
	]);

	if (!customer) {
		throw error(404, 'ไม่พบข้อมูลลูกค้า');
	}

	// --- 2. แปลงค่า Decimal เป็น Number ก่อนส่งข้อมูล ---
	const serializableCustomer = {
		...customer,
		creditLimit: customer.creditLimit ? customer.creditLimit.toNumber() : null
	};

	const serializableOrders = orders.map((order) => ({
		...order,
		total: order.total.toNumber(),
		received: order.received ? order.received.toNumber() : null,
		change: order.change ? order.change.toNumber() : null
	}));

	// --- 3. ส่งข้อมูลที่สมบูรณ์กลับไปให้หน้าเว็บ ---
	return {
		customer: serializableCustomer,
		orders: serializableOrders
	};
};
