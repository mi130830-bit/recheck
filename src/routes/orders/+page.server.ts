// src/routes/orders/+page.server.ts (จัดระเบียบใหม่)

import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// 1. ดึงข้อมูล Order ทั้งหมดจากฐานข้อมูล พร้อมกับข้อมูล "ลูกค้า" ที่เกี่ยวข้อง
	const ordersFromDb = await db.order.findMany({
		include: {
			customer: true
		},
		orderBy: {
			createdAt: 'desc'
		}
	});

	// 2. [สำคัญ] แปลงค่า Decimal ทั้งใน Order และใน Customer ที่ซ้อนอยู่
	//    เพื่อให้ส่งข้อมูลผ่าน JSON ไปยัง Client ได้อย่างปลอดภัย
	const orders = ordersFromDb.map((order) => {
		// แปลงข้อมูล customer ก่อน (ถ้ามี)
		const serializableCustomer = order.customer
			? {
					...order.customer,
					creditLimit: order.customer.creditLimit?.toNumber() ?? null
				}
			: null;

		// สร้าง object order ใหม่ที่สมบูรณ์
		return {
			...order,
			// เขียนทับ field ที่เป็น Decimal ของ Order
			total: order.total.toNumber(),
			received: order.received?.toNumber() ?? null,
			change: order.change?.toNumber() ?? null,
			// เขียนทับ customer object ทั้งหมดด้วย object ที่เราเพิ่งแปลงค่า
			customer: serializableCustomer
		};
	});

	// 3. ส่งข้อมูลที่แปลงค่าแล้วทั้งหมดออกไป
	return { orders };
};
