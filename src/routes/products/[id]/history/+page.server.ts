// src/routes/products/[id]/history/+page.server.ts (ฉบับแก้ไขที่ถูกต้อง)

import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	// 1. รับ ID จาก URL และแปลงเป็นตัวเลขสำหรับ Product ID
	const productId = Number(params.id);
	if (isNaN(productId)) {
		throw error(400, 'รหัสสินค้าไม่ถูกต้อง');
	}

	// 2. ดึงข้อมูลสินค้าหลักจากฐานข้อมูล
	const product = await db.product.findUnique({
		where: { id: productId }
	});

	if (!product) {
		throw error(404, 'ไม่พบข้อมูลสินค้า');
	}

	// 3. ดึงประวัติการเคลื่อนไหวของสต็อก (StockLedger) ที่เกี่ยวข้องกับสินค้านี้
	const history = await db.stockLedger.findMany({
		where: { productId: productId },
		orderBy: { createdAt: 'desc' } // เรียงจากล่าสุดไปเก่าสุด
	});

	// 4. แปลงค่า Decimal ในข้อมูล Product ให้เป็น Number
	const serializableProduct = {
		...product,
		costPrice: product.costPrice.toNumber(),
		retailPrice: product.retailPrice.toNumber(),
		wholesalePrice: product.wholesalePrice ? product.wholesalePrice.toNumber() : null
	};

	// 5. แปลงค่า Decimal ในข้อมูล History ให้เป็น Number
	const serializableHistory = history.map((item) => ({
		...item,
		costAtTime: item.costAtTime ? item.costAtTime.toNumber() : null,
		priceAtTime: item.priceAtTime ? item.priceAtTime.toNumber() : null
	}));

	// 6. ส่งข้อมูลที่ถูกต้อง (product และ history) กลับไปให้หน้าเว็บ
	return {
		product: serializableProduct,
		history: serializableHistory
	};
};