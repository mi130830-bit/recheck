// Path: src/routes/suppliers/import/+page.server.ts (Final Working Version)

import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import * as xlsx from 'xlsx';

// load function ไม่ได้ใช้ในหน้านี้ แต่ต้อง export ไว้ตามโครงสร้าง SvelteKit
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
			const sheetName = workbook.SheetNames[0];
			const sheet = workbook.Sheets[sheetName];
			const data = xlsx.utils.sheet_to_json(sheet) as any[];

			if (data.length === 0) {
				return fail(400, { success: false, message: 'ไฟล์ Excel ว่างเปล่า' });
			}

			const errors: string[] = [];
			const codesInFile = new Set<string>(); // ใช้เช็ค code ซ้ำในไฟล์เดียวกัน

			const suppliersToCreate = data.map((row, index) => {
				const code = String(row['รหัสผู้ขาย (บังคับ)'] || '').trim();
				const name = String(row['ชื่อผู้ขาย (บังคับ)'] || '').trim();

				// Validation ภายในไฟล์
				if (!code || !name) {
					errors.push(`แถวที่ ${index + 2}: ข้อมูล "รหัสผู้ขาย" และ "ชื่อผู้ขาย" ห้ามเว้นว่าง`);
					return null;
				}
				if (codesInFile.has(code.toLowerCase())) {
					errors.push(`แถวที่ ${index + 2}: "รหัสผู้ขาย" (${code}) ซ้ำกันในไฟล์ Excel`);
					return null;
				}
				codesInFile.add(code.toLowerCase());
				
				return {
					code: code,
					name: name,
					taxId: String(row['Tax ID'] || '').trim() || null,
					phone: String(row['โทรศัพท์'] || '').trim() || null,
					email: String(row['E-mail'] || '').trim() || null,
					address: String(row['ที่อยู่'] || '').trim() || null,
					fax: String(row['แฟกซ์'] || '').trim() || null,
					notes: String(row['หมายเหตุ'] || '').trim() || null,
					creditDays: row['เครดิต (วัน)'] ? parseInt(String(row['เครดิต (วัน)']), 10) : null,
					paymentTerms: String(row['เงื่อนไขชำระเงิน'] || '').trim() || null,
				};
			}).filter(Boolean); // กรองแถวที่มีปัญหา (null) ออก

			if (errors.length > 0) {
				return fail(400, { success: false, message: 'พบข้อผิดพลาดในไฟล์:\n' + errors.join('\n') });
			}

			if (suppliersToCreate.length === 0) {
				return fail(400, { success: false, message: 'ไม่พบข้อมูลผู้ขายที่ถูกต้องในไฟล์' });
			}

			// ใช้ createMany เพื่อบันทึกข้อมูลทั้งหมด
			const result = await db.supplier.createMany({
				data: suppliersToCreate,
				skipDuplicates: true // ถ้าเจอ "รหัสผู้ขาย" (code) ซ้ำกับใน DB ให้ข้ามไป
			});

			return {
				success: true,
				message: `นำเข้าข้อมูลผู้ขายสำเร็จ ${result.count} รายการ!`
			};
		} catch (err) {
			console.error('Supplier import error:', err);
			return fail(500, { success: false, message: 'เกิดข้อผิดพลาดในการประมวลผลไฟล์' });
		}
	}
};