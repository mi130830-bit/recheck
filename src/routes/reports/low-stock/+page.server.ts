// Path: src/routes/reports/low-stock/+page.server.ts (Final Corrected Version)

import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// 1. ดึงข้อมูลสินค้าทั้งหมดที่เปิดใช้งานการเช็คสต็อกและมีจุดสั่งซื้อกำหนดไว้
	const candidateProducts = await db.product.findMany({
		where: {
			trackStock: true,
			reorderPoint: {
				not: null // เอาเฉพาะสินค้าที่มีการตั้งค่าจุดสั่งซื้อ
			}
		},
		include: {
			supplier: true // ดึงข้อมูลผู้ขายมาด้วย
		}
	});

	// 2. กรองข้อมูลใน Server เพื่อหาเฉพาะสินค้าที่สต็อกต่ำกว่าหรือเท่ากับจุดสั่งซื้อ
	const lowStockProductsFromDb = candidateProducts.filter(p => {
        // ใช้ Non-null assertion (!) เพราะเรา query มาเฉพาะ reorderPoint ที่ไม่เป็น null แล้ว
		return p.stockQuantity <= p.reorderPoint!; 
	});

	// 3. [สำคัญ] แปลงค่า Decimal เป็น Number ก่อนส่งข้อมูล
	const lowStockProducts = lowStockProductsFromDb.map(p => ({
		...p,
		costPrice: p.costPrice.toNumber(),
		retailPrice: p.retailPrice.toNumber(),
		wholesalePrice: p.wholesalePrice ? p.wholesalePrice.toNumber() : null
	}));

	return { lowStockProducts };
};