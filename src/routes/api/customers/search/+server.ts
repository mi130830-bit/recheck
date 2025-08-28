// Path: src/routes/api/customers/search/+server.ts (ฉบับแก้ไขตาม Schema จริง)

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
					// [แก้ไข] ค้นหาจาก firstName และ lastName ที่มีอยู่จริงใน Schema
					{ firstName: { contains: query } },
					{ lastName: { contains: query } },
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