// Path: src/routes/api/receipts/[orderId]/+server.ts (Final Corrected Version)

import { db } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const orderId = parseInt(params.orderId);

	if (isNaN(orderId)) {
		throw error(400, 'Invalid Order ID');
	}

	try {
		const orderFromDb = await db.order.findUnique({
			where: { id: orderId },
			include: {
				customer: true,
				items: { include: { product: true } }
			}
		});

		if (!orderFromDb) {
			throw error(404, 'Order not found');
		}

		// [จุดแก้ไขสำคัญ] แปลงค่า Decimal ทั้งหมดเป็น String เพื่อให้ส่งผ่าน API ได้
		const serializableOrder = {
			...orderFromDb,
			total: orderFromDb.total.toString(),
			received: orderFromDb.received ? orderFromDb.received.toString() : null,
			change: orderFromDb.change ? orderFromDb.change.toString() : null,
			items: orderFromDb.items.map(item => ({
				...item,
				price: item.price.toString(), // แปลง price
				discount: item.discount.toString(),
				// แปลงข้อมูลใน product ด้วย เผื่อต้องใช้ในอนาคต
				product: {
					...item.product,
					costPrice: item.product.costPrice.toString(),
					retailPrice: item.product.retailPrice.toString(),
					wholesalePrice: item.product.wholesalePrice ? item.product.wholesalePrice.toString() : null,
				}
			}))
		};
		
		const shopInfo = {
			name: 'ร้าน PJ POS',
			address: '123/45 ถ.สุขุมวิท ต.บางนา อ.บางนา กรุงเทพฯ 10260',
			phone: '081-234-5678',
			taxId: '1234567890123'
		};

		// ส่งข้อมูลที่แปลงค่าแล้ว (serializableOrder) ออกไป
		return json({ order: serializableOrder, shopInfo });

	} catch (err: any) {
		if (err.status) throw err;
		console.error("Error fetching receipt:", err); // เพิ่ม log เพื่อช่วย debug
		throw error(500, 'Could not fetch receipt data');
	}
};