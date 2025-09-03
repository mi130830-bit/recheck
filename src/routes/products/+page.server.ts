// Path: src/routes/products/+page.server.ts (Final Corrected Version)

import { db } from '$lib/server/db';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// ส่วนของ `load` function เหมือนเดิม ไม่มีการเปลี่ยนแปลง
export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page') ?? '1');
	const limit = 25;
	const query = url.searchParams.get('query') ?? '';
	const whereCondition = query
		? {
				OR: [
					{ name: { contains: query } },
					{ alias: { contains: query } },
					{ barcode: { contains: query } }
				]
			}
		: {};

	const [productsFromDb, totalItems, suppliers, categories, units] = await db.$transaction([
		db.product.findMany({
			where: whereCondition,
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { createdAt: 'desc' },
			include: { supplier: true, category: true, unit: true }
		}),
		db.product.count({ where: whereCondition }),
		db.supplier.findMany({ orderBy: { name: 'asc' } }),
		db.category.findMany({ orderBy: { name: 'asc' } }),
		db.unit.findMany({ orderBy: { name: 'asc' } })
	]);

	const products = productsFromDb.map((p) => ({
		...p,
		costPrice: p.costPrice.toNumber(),
		retailPrice: p.retailPrice.toNumber(),
		wholesalePrice: p.wholesalePrice ? p.wholesalePrice.toNumber() : null
	}));

	return {
		products,
		totalItems,
		currentPage: page,
		totalPages: Math.ceil(totalItems / limit),
		query,
		limit,
		suppliers,
		categories,
		units
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');

		if (!id || typeof id !== 'string') {
			return fail(400, { message: 'Invalid request: ID is missing.' });
		}

		try {
			// [แก้ไข] แปลง id จาก string เป็น number ก่อนส่งให้ Prisma
			await db.product.delete({
				where: { id: parseInt(id) }
			});
			return { success: true };
		} catch (error) {
			console.error('Failed to delete product:', error);
			// หากสินค้าถูกใช้ใน transaction อื่น อาจลบไม่ได้ Prisma จะโยน error
			return fail(500, { message: 'ไม่สามารถลบสินค้าได้ อาจมีข้อมูลอื่นผูกอยู่' });
		}
	}
};