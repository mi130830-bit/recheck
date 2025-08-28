// Path: src/routes/api/products/search/+server.ts (ฉบับแก้ไขตาม Schema จริง)

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
				AND: [
					{
						// [แก้ไข] ใช้ชื่อคอลัมน์ 'stockQuantity' ที่ถูกต้อง
						stockQuantity: {
							gt: 0
						}
					},
					{
						OR: [
							{ name: { contains: query } },
							{ barcode: { contains: query } },
							// [แก้ไข] ลบ 'code' ที่ไม่มีอยู่จริงออก และเพิ่ม 'alias' ที่มีใน Schema เข้าไป
							{ alias: { contains: query } }
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