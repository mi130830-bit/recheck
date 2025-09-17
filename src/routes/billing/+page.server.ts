// Path: src/routes/billing/+page.server.ts

import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		// 1. ดึงข้อมูลใบวางบิลทั้งหมด พร้อมข้อมูลลูกค้าที่เกี่ยวข้อง
		const billingNotesFromDb = await db.billingNote.findMany({
			include: {
				customer: true
			},
			orderBy: {
				createdAt: 'desc' // เรียงจากล่าสุดไปเก่าสุด
			}
		});

		// 2. แปลงค่า Decimal ทั้งหมดให้เป็น number ก่อนส่งไปให้ client
		const billingNotes = billingNotesFromDb.map((bn) => {
			if (!bn.customer) {
				// กรณีป้องกันข้อมูล customer เป็น null (แม้ว่า schema จะบังคับ)
				throw new Error(`Billing note ID ${bn.id} is missing a customer.`);
			}
			return {
				...bn,
				totalAmount: bn.totalAmount.toNumber(),
				customer: {
					...bn.customer,
					creditLimit: bn.customer.creditLimit ? bn.customer.creditLimit.toNumber() : null
				}
			};
		});

		return { billingNotes };
	} catch (err) {
		console.error('Failed to load billing notes:', err);
		throw error(500, 'ไม่สามารถโหลดข้อมูลใบวางบิลได้');
	}
};