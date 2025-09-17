import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q')?.trim();

	if (!query || query.length < 2) {
		return json([]);
	}

	try {
		const customersFromDb = await db.customer.findMany({
			where: {
				OR: [
            		{ firstName: { contains: query, mode: 'insensitive' } },
            		{ lastName: { contains: query, mode: 'insensitive' } },
            		{ phone: { contains: query, mode: 'insensitive' } },
           			{ memberCode: { contains: query, mode: 'insensitive' } }
				]
			},
			take: 20
		});

		const customers = customersFromDb.map((c) => ({
			...c,
			creditLimit: c.creditLimit ? c.creditLimit.toNumber() : null
		}));

		return json(customers);

	} catch (err) {
		console.error('Customer search API error:', err);
		return json({ error: 'ไม่สามารถค้นหาข้อมูลลูกค้าได้' }, { status: 500 });
	}
};