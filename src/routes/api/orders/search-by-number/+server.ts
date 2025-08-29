import { db } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const orderNumber = url.searchParams.get('number');

	if (!orderNumber) {
		throw error(400, 'กรุณาระบุเลขที่บิล');
	}

	try {
		const order = await db.order.findUnique({
			where: { orderNumber: orderNumber },
			include: {
				customer: true,
				items: {
					include: {
						product: true // ดึงข้อมูลสินค้าของแต่ละรายการมาด้วย
					}
				}
			}
		});

		if (!order) {
			throw error(404, `ไม่พบเลขที่บิล: ${orderNumber}`);
		}

		return json(order);
	} catch (err: any) {
		console.error('Error searching order by number:', err);
		// ส่งต่อ error ที่อาจจะมาจาก findUnique
		if (err.status) throw err;
		throw error(500, 'เกิดข้อผิดพลาดในการค้นหาบิล');
	}
};