// Path: src/routes/+page.server.ts (Final Corrected Version)

import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// นี่คือ load function ของหน้าแรก (POS)
export const load: PageServerLoad = async () => {
	try {
		// โดยปกติหน้า POS อาจจะต้องโหลดข้อมูลบางอย่างมาเตรียมไว้
		// เช่น รายการสินค้าที่ขายบ่อย หรือ รายชื่อลูกค้าทั้งหมด
		
		// 1. ดึงข้อมูลสินค้า (ถ้ามี)
		const productsFromDb = await db.product.findMany({
			orderBy: { name: 'asc' }
		});
		
		// 2. ดึงข้อมูลลูกค้า (นี่คือส่วนที่ทำให้เกิด Error)
		const customersFromDb = await db.customer.findMany({
			orderBy: { firstName: 'asc' }
		});
		
		// 3. [จุดแก้ไขสำคัญ] แปลงค่า Decimal ในข้อมูลลูกค้า
		const customers = customersFromDb.map(c => ({
			...c,
			creditLimit: c.creditLimit ? c.creditLimit.toNumber() : null
		}));
		
		// 4. [สำคัญ] แปลงค่า Decimal ในข้อมูลสินค้าด้วย
		const products = productsFromDb.map(p => ({
			...p,
			costPrice: p.costPrice.toNumber(),
			retailPrice: p.retailPrice.toNumber(),
			wholesalePrice: p.wholesalePrice ? p.wholesalePrice.toNumber() : null
		}));
		
		// 5. ส่งข้อมูลที่แปลงค่าแล้วทั้งหมดกลับไป
		return { products, customers };

	} catch (err) {
		console.error("Error loading initial data for POS page:", err);
		throw error(500, "ไม่สามารถโหลดข้อมูลเริ่มต้นสำหรับหน้าขายได้");
	}
};