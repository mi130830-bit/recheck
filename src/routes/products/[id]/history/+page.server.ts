import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const productId = Number(params.id);
	if (isNaN(productId)) {
		throw error(400, 'รหัสสินค้าไม่ถูกต้อง');
	}

	// 1. ดึงข้อมูลสินค้าและประวัติพร้อมกันใน Transaction เดียวเพื่อประสิทธิภาพ
	const [product, history] = await db.$transaction([
		db.product.findUnique({
			where: { id: productId }
		}),
		db.stockLedger.findMany({
			where: { productId: productId },
			orderBy: { createdAt: 'desc' } // เรียงจากล่าสุดไปเก่าสุด
		})
	]);

	if (!product) {
		throw error(404, 'ไม่พบข้อมูลสินค้า');
	}

	// 2. [สำคัญ] แปลงค่า Decimal ทั้งหมดให้เป็น Number ก่อนส่งไป Client
	// เพื่อป้องกัน Serialization Error
	const serializableProduct = {
		...product,
		costPrice: product.costPrice.toNumber(),
		retailPrice: product.retailPrice.toNumber(),
		wholesalePrice: product.wholesalePrice ? product.wholesalePrice.toNumber() : null
	};

	const serializableHistory = history.map((item) => ({
		...item,
		costAtTime: item.costAtTime ? item.costAtTime.toNumber() : null,
		priceAtTime: item.priceAtTime ? item.priceAtTime.toNumber() : null
	}));

	// 3. ส่งข้อมูลที่แปลงค่าเรียบร้อยแล้วกลับไป
	return {
		product: serializableProduct,
		history: serializableHistory
	};
};
