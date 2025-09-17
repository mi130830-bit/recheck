import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q')?.trim();

	if (!query || query.length < 2) {
		return json([]);
	}

	try {
		const productsFromDb = await db.product.findMany({
			where: {
				OR: [
            		{ name: { contains: query, mode: 'insensitive' } },
            		{ barcode: { contains: query, mode: 'insensitive' } },
            		{ alias: { contains: query, mode: 'insensitive' } }
				]
			},
			take: 20
		});
		
		const products = productsFromDb.map((p) => ({
			...p,
			costPrice: p.costPrice.toNumber(),
			retailPrice: p.retailPrice.toNumber(),
			wholesalePrice: p.wholesalePrice ? p.wholesalePrice.toNumber() : null
		}));
		
		return json(products);

	} catch (err) {
		console.error("Product Search API Error:", err);
		return json({ error: 'ไม่สามารถค้นหาข้อมูลสินค้าได้' }, { status: 500 });
	}
};