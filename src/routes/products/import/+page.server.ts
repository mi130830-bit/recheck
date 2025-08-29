// Path: src/routes/products/import/+page.server.ts (Final Row-by-Row Supplier Version)

import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import * as xlsx from 'xlsx';

// Load function ไม่จำเป็นต้องส่งข้อมูล suppliers แล้ว เพราะเราจะหาจากในไฟล์แทน
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
			// --- ขั้นตอนที่ 1: เตรียมข้อมูลผู้ขายสำหรับค้นหา ---
			const allSuppliers = await db.supplier.findMany();
			// สร้าง Map เพื่อให้ค้นหา id จาก name ได้เร็วขึ้น (ไม่สนตัวพิมพ์เล็ก/ใหญ่)
			const supplierMap = new Map(allSuppliers.map(s => [s.name.trim().toLowerCase(), s.id]));

			const buffer = Buffer.from(await file.arrayBuffer());
			const workbook = xlsx.read(buffer, { type: 'buffer' });
			const sheetName = workbook.SheetNames[0];
			const sheet = workbook.Sheets[sheetName];
			const data = xlsx.utils.sheet_to_json(sheet) as any[];

			if (data.length === 0) {
				return fail(400, { success: false, message: 'ไฟล์ Excel ว่างเปล่า' });
			}

			const productsToCreate = [];
			const errors: string[] = [];

			// --- ขั้นตอนที่ 2: วนลูปประมวลผลแต่ละแถว ---
			for (const [index, row] of data.entries()) {
				if (!row['ชื่อสินค้า']) {
					continue; // ข้ามแถวที่ไม่มีชื่อสินค้า
				}

				const supplierName = String(row['ผู้ขายสินค้า'] || '').trim().toLowerCase();
				if (!supplierName) {
					errors.push(`แถวที่ ${index + 2}: ไม่ได้ระบุชื่อผู้ขายสินค้า`);
					continue;
				}

				const supplierId = supplierMap.get(supplierName);
				if (!supplierId) {
					errors.push(`แถวที่ ${index + 2}: ไม่พบผู้ขายชื่อ "${row['ผู้ขายสินค้า']}" ในระบบ`);
					continue;
				}

				productsToCreate.push({
					barcode: String(row['รหัสบาร์โค้ด'] || ''),
					name: String(row['ชื่อสินค้า']),
					alias: String(row['ชื่อย่อ/รหัสค้นหา'] || ''),
					category: String(row['ประเภทสินค้า'] || ''),
					costPrice: Number(row['ต้นทุน'] || 0),
					retailPrice: Number(row['ราคาปลีก'] || 0),
					wholesalePrice: Number(row['ราคาส่ง'] || null),
					stockQuantity: Number(row['จำนวนสินค้า'] || 0),
					unit: String(row['หน่วย'] || 'ชิ้น'),
					reorderPoint: Number(row['จุดสั่งซื้อ'] || null),
					notes: String(row['หมายเหตุ'] || ''),
					supplierId: supplierId // << ใช้ ID ที่หาเจอ
				});
			}

			if (productsToCreate.length === 0 && errors.length > 0) {
				return fail(400, { success: false, message: 'ไม่สามารถนำเข้าข้อมูลได้:\n' + errors.join('\n') });
			}

			// --- ขั้นตอนที่ 3: บันทึกข้อมูล ---
			const result = await db.product.createMany({
				data: productsToCreate,
				skipDuplicates: true
			});

			let finalMessage = `นำเข้าข้อมูลสำเร็จ ${result.count} รายการ!`;
			if (errors.length > 0) {
				finalMessage += `\n\nเกิดข้อผิดพลาดกับบางรายการ:\n` + errors.join('\n');
			}

			return { success: true, message: finalMessage };

		} catch (err) {
			console.error('Excel import error:', err);
			return fail(500, { success: false, message: 'เกิดข้อผิดพลาดในการประมวลผลไฟล์' });
		}
	}
};