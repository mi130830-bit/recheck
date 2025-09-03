// Path: src/routes/api/products/search/+server.ts (ฉบับสมบูรณ์)

import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	// 1. รับคำค้นหา (q) จาก URL
	const query = url.searchParams.get('q');

	// ถ้าไม่มีคำค้นหา ส่งค่าว่างกลับไป
	if (!query || query.trim() === '') {
		return json([]);
	}

	try {
		const products = await db.product.findMany({
			where: {
				// เงื่อนไขคือ ต้องเป็นจริงทั้งหมด (AND)
				AND: [
					{
						// 2. ค้นหาเฉพาะสินค้าที่ยังมีในสต็อก (มากกว่า 0)
						stockQuantity: {
							gt: 0
						}
					},
					{
						// 3. และคำค้นหาต้องตรงกับเงื่อนไขใดเงื่อนไขหนึ่ง (OR) ต่อไปนี้
						OR: [
							{ name: { contains: query } },      // ค้นจากชื่อสินค้า
							{ barcode: { contains: query } },   // ค้นจากบาร์โค้ด
							{ alias: { contains: query } }      // ค้นจากชื่อย่อ/รหัส
						]
					}
				]
			},
			// 4. แสดงผลลัพธ์สูงสุด 20 รายการ
			take: 20
		});
		
		return json(products);

	} catch (err) {
		console.error("Product Search API Error:", err);
		return json({ error: 'ไม่สามารถค้นหาข้อมูลสินค้าได้' }, { status: 500 });
	}
};