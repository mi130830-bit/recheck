// src/routes/products/+page.server.ts (ฉบับปรับปรุงประสิทธิภาพ)

import { db } from '$lib/server/db';
import { fail, error, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	try {
		const page = Number(url.searchParams.get('page') ?? '1');
		const limit = 25;
		const query = url.searchParams.get('query') ?? '';

		const whereCondition = query
			? {
					OR: [
						{ name: { contains: query, mode: 'insensitive' } },
						{ alias: { contains: query, mode: 'insensitive' } },
						{ barcode: { contains: query, mode: 'insensitive' } }
					]
				}
			: {};

		// [ปรับปรุง] ดึงเฉพาะข้อมูลที่ต้องใช้ในหน้านี้จริงๆ
		const [productsFromDb, totalItems] = await db.$transaction([
			db.product.findMany({
				where: whereCondition,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: 'desc' }
				// ไม่จำเป็นต้อง include ความสัมพันธ์ ถ้าไม่ได้ใช้ในตาราง List
				// แต่ถ้าใช้ เช่น แสดงชื่อ supplier ก็คง include ไว้
				// include: { supplier: true, category: true, unit: true }
			}),
			db.product.count({ where: whereCondition })
		]);

		const products = productsFromDb.map((p) => ({
			...p,
			costPrice: p.costPrice ? p.costPrice.toNumber() : 0,
			retailPrice: p.retailPrice ? p.retailPrice.toNumber() : 0,
			wholesalePrice: p.wholesalePrice ? p.wholesalePrice.toNumber() : null
		}));

		return {
			products,
			totalItems,
			currentPage: page,
			totalPages: Math.ceil(totalItems / limit),
			query,
			limit
			// [ปรับปรุง] นำข้อมูลที่ไม่ใช้ออกไป
			// suppliers,
			// categories,
			// units
		};
	} catch (err) {
		console.error('Failed to load products page data:', err);
		throw error(500, 'ไม่สามารถโหลดข้อมูลหน้าสินค้าได้');
	}
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');

		if (!id || typeof id !== 'string') {
			return fail(400, { message: 'Invalid request: ID is missing.' });
		}

		try {
			await db.product.delete({
				where: { id: parseInt(id) }
			});
			// ไม่ต้อง return success ก็ได้ SvelteKit จะ invalidate data และโหลดใหม่เอง
			return; 
		} catch (err) {
			console.error('Failed to delete product:', err);
			// ส่งข้อความ Error ที่ชัดเจนกลับไป
			return fail(500, { message: 'ไม่สามารถลบสินค้าได้ อาจถูกใช้งานในบิลขายหรือข้อมูลอื่นอยู่' });
		}
	}
};