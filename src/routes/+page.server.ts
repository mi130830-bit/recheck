// src/routes/+page.server.ts (แก้ไขให้โหลดข้อมูลสำหรับหน้า POS)

import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		// --- 1. ใช้ $transaction เพื่อดึงข้อมูลทั้งหมดในครั้งเดียวเพื่อประสิทธิภาพ ---
		const [productsFromDb, customersFromDb] = await db.$transaction([
			db.product.findMany({ orderBy: { name: 'asc' } }),
			db.customer.findMany({ orderBy: { firstName: 'asc' } })
		]);

		// --- 2. [สำคัญ] แปลงค่า Decimal ในข้อมูลสินค้าทั้งหมดให้เป็น Number ---
		const products = productsFromDb.map((p) => ({
			...p,
			costPrice: p.costPrice.toNumber(),
			retailPrice: p.retailPrice.toNumber(),
			wholesalePrice: p.wholesalePrice ? p.wholesalePrice.toNumber() : null
		}));

		// --- 3. [สำคัญ] แปลงค่า Decimal ในข้อมูลลูกค้าทั้งหมดให้เป็น Number ---
		const customers = customersFromDb.map((c) => ({
			...c,
			creditLimit: c.creditLimit ? c.creditLimit.toNumber() : null
		}));

		// --- 4. ส่งข้อมูลที่พร้อมใช้งานกลับไปให้หน้า Svelte ---
		return { products, customers };
		
	} catch (err) {
		console.error('Failed to load data for POS page:', err);
		throw error(500, 'ไม่สามารถโหลดข้อมูลสำหรับหน้าขายได้');
	}
};

