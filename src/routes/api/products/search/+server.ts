// Path: src/routes/api/products/search/+server.ts (ฉบับแก้ไขที่ถูกต้อง)

import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q');

	if (!query || query.trim() === '') {
		return json([]);
	}

	try {
		const products = await db.product.findMany({
			where: {
				// ใช้ AND เพื่อให้เงื่อนไขทั้งสองอย่างเป็นจริง
				AND: [
					// เงื่อนไขที่ 1: สต็อกต้องมากกว่า 0
					{
						// [แก้ไข] เปลี่ยนจาก stock เป็น stockQuantity
						stockQuantity: {
							gt: 0
						}
					},
					// เงื่อนไขที่ 2: ต้องตรงกับคำค้นหาในฟิลด์ใดฟิลด์หนึ่ง
					{
						OR: [
							{ name: { contains: query } },
							{ barcode: { contains: query } },
							{ code: { contains: query } }
						]
					}
				]
			},
			take: 20
		});
		return json(products);
	} catch (err) {
		console.error("Product Search API Error:", err);
		return json({ error: 'ไม่สามารถค้นหาข้อมูลสินค้าได้' }, { status: 500 });
	}
};