// Path: src/routes/customers/import/+page.server.ts (Final Corrected Version)

import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import * as xlsx from 'xlsx';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const file = formData.get('excelFile') as File;

		if (!file || file.size === 0) {
			return fail(400, { success: false, message: 'กรุณาเลือกไฟล์ Excel' });
		}

		try {
			const buffer = Buffer.from(await file.arrayBuffer());
			const workbook = xlsx.read(buffer, { type: 'buffer' });
			
			// ===================== [จุดที่แก้ไข] =====================
			const sheetName = workbook.SheetNames[0]; // 1. เอา "ชื่อ" ของชีตแรกออกมา
			const sheet = workbook.Sheets[sheetName]; // 2. ใช้ "ชื่อ" นั้นเพื่อดึง "ตัวชีต" จริงๆ ออกมา
			const data = xlsx.utils.sheet_to_json(sheet, { raw: false }) as any[]; // 3. ตอนนี้ "sheet" มีค่าแล้ว
			// =========================================================

			if (data.length === 0) {
				return fail(400, { success: false, message: 'ไฟล์ Excel ว่างเปล่า' });
			}

			const customersToCreate = data.map(row => {
				if (!row['รหัสสมาชิก (บังคับ)'] || !row['ชื่อ (บังคับ)']) {
					return null;
				}
				const parseDate = (dateStr: string | null) => {
					if (!dateStr) return null;
					const date = new Date(dateStr);
					return isNaN(date.getTime()) ? null : date;
				};
				
				return {
					memberCode: String(row['รหัสสมาชิก (บังคับ)']),
					title: String(row['คำนำหน้า'] || '').trim() || null,
					firstName: String(row['ชื่อ (บังคับ)']),
					lastName: String(row['สกุล'] || '').trim() || null,
					phone: String(row['โทรศัพท์'] || '').replace(/'/g, '').trim() || null,
					nationalId: String(row['เลขที่บัตรปชช.'] || '').trim() || null,
					email: String(row['E-mail'] || '').trim() || null,
					taxId: String(row['เลขที่เสียภาษี'] || '').trim() || null,
					address: String(row['ที่อยู่'] || '').trim() || null,
					shippingAddress: String(row['ที่อยู่จัดส่ง'] || '').trim() || null,
					notes: String(row['หมายเหตุ'] || '').trim() || null,
					creditLimit: Number(row['วงเงินเชื่อ'] || null),
					dateOfBirth: parseDate(row['วันเกิด (ปี-เดือน-วัน)']),
					membershipExpiryDate: parseDate(row['วันหมดอายุ (ปี-เดือน-วัน)'])
				};
			}).filter(Boolean);

			if (customersToCreate.length === 0) {
				return fail(400, { success: false, message: 'ไม่พบข้อมูลลูกค้าที่ถูกต้องในไฟล์' });
			}

			const result = await db.customer.createMany({
				data: customersToCreate,
				skipDuplicates: true
			});

			return {
				success: true,
				message: `นำเข้าข้อมูลลูกค้าสำเร็จ ${result.count} รายการ!`
			};
		} catch (err) {
			console.error('Customer import error:', err);
			return fail(500, { success: false, message: 'เกิดข้อผิดพลาดในการประมวลผลไฟล์' });
		}
	}
};