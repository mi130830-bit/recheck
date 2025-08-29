// Path: src/routes/api/orders/search-by-number/+server.ts (Final Corrected Version)

import { db } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const orderNumber = url.searchParams.get('number');

	if (!orderNumber) {
		throw error(400, { message: 'กรุณาระบุเลขที่บิล' });
	}

	try {
		// 1. ดึงข้อมูลดิบจากฐานข้อมูล
		const orderFromDb = await db.order.findUnique({
			where: { orderNumber: orderNumber },
			include: {
				customer: true,
				items: {
					include: {
						product: true
					}
				}
			}
		});

		if (!orderFromDb) {
			throw error(404, { message: `ไม่พบเลขที่บิล: ${orderNumber}` });
		}

		// 2. [จุดแก้ไขสำคัญ] สร้าง Object ใหม่ที่แปลงค่า Decimal ทั้งหมดเป็น String
		const serializableOrder = {
			...orderFromDb, // คัดลอกข้อมูลเดิมทั้งหมด
			// เขียนทับ field ที่เป็น Decimal
			total: orderFromDb.total.toString(),
			received: orderFromDb.received ? orderFromDb.received.toString() : null,
			change: orderFromDb.change ? orderFromDb.change.toString() : null,
			// วนลูป items เพื่อแปลงค่า price และ discount ด้วย
			items: orderFromDb.items.map(item => ({
				...item,
				price: item.price.toString(),
				discount: item.discount.toString()
			}))
		};

		// 3. ส่งข้อมูลที่แปลงค่าแล้ว (ปลอดภัย) ออกไป
		return json(serializableOrder);

	} catch (err: any) {
		console.error('Error searching order by number:', err);
		if (err.status) throw err;
		throw error(500, 'เกิดข้อผิดพลาดในการค้นหาบิล');
	}
};