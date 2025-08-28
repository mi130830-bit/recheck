// Path: src/routes/api/customers/search/+server.ts (ฉบับปรับปรุง)

import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q');

	if (!query || query.trim() === '') {
		return json([]);
	}

	try {
		const customers = await db.customer.findMany({
			where: {
				OR: [
					// [แก้ไข] ใช้ฟิลด์ 'name' ที่มีอยู่จริงเป็นหลักในการค้นหาชื่อ
					{ name: { contains: query } },
					{ phone: { contains: query } },
					{ memberCode: { contains: query } }
				]
			},
			take: 20
		});
		return json(customers);
	} catch (err) {
		console.error("Customer Search API Error:", err);
		return json({ error: 'ไม่สามารถค้นหาข้อมูลลูกค้าได้' }, { status: 500 });
	}
};