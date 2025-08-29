import { db } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q');
	const take = parseInt(url.searchParams.get('take') || '20');
	const skip = parseInt(url.searchParams.get('skip') || '0');

	if (!query) {
		throw error(400, 'กรุณาระบุคำค้นหา');
	}

	try {
		// ค้นหาในตาราง OrderItem โดยอ้างอิงข้อมูลจาก Product ที่ผูกกันอยู่
		const items = await db.orderItem.findMany({
			where: {
				product: {
					OR: [
						{ name: { contains: query } },
						{ alias: { contains: query } },
						{ barcode: { equals: query } }
					]
				}
			},
			include: {
				product: true, // ดึงข้อมูลสินค้าที่เจอ
				order: true    // ดึงข้อมูล "หัวบิล" ที่สินค้านี้อยู่
			},
			orderBy: {
				order: {
					createdAt: 'desc' // เรียงจากบิลล่าสุด
				}
			},
			take: take,
			skip: skip
		});

		return json(items);

	} catch (err) {
		console.error("Error searching order items:", err);
		throw error(500, "เกิดข้อผิดพลาดในการค้นหา");
	}
};