// Path: src/routes/products/import/+page.server.ts (Final Corrected Version)

import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
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
			const allSuppliers = await db.supplier.findMany({ select: { id: true, name: true } });
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

			for (const [index, row] of data.entries()) {
				if (!row['ชื่อสินค้า']) {
					continue;
				}

				const supplierNameRaw = String(row['ผู้ขายสินค้า'] || '').trim();
				let supplierId: number | null = null; 

				if (supplierNameRaw) {
					const foundSupplierId = supplierMap.get(supplierNameRaw.toLowerCase());
					if (foundSupplierId) {
						supplierId = foundSupplierId;
					} else {
						errors.push(`แถวที่ ${index + 2}: ไม่พบผู้ขายชื่อ "${supplierNameRaw}" ในระบบ`);
						continue;
					}
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
					supplierId: supplierId
				});
			}

			if (productsToCreate.length === 0 && errors.length > 0) {
				return fail(400, { success: false, message: 'ไม่สามารถนำเข้าข้อมูลได้:\n' + errors.join('\n') });
			}
			
			let resultCount = 0;
			if (productsToCreate.length > 0) {
				const result = await db.product.createMany({
					data: productsToCreate as any,
					skipDuplicates: true
				});
				resultCount = result.count;
			}
			
			let finalMessage = `นำเข้าข้อมูลสำเร็จ ${resultCount} รายการ`;
			if (errors.length > 0) {
				const errorMessage = `เกิดข้อผิดพลาดกับบางรายการ (ไม่ถูกนำเข้า):\n` + errors.join('\n');
				finalMessage = resultCount > 0 ? `${finalMessage}\n\n${errorMessage}` : errorMessage;
				return fail(400, { success: false, message: finalMessage });
			}

			return { success: true, message: finalMessage };

		} catch (err: any) {
			console.error('Excel import error:', err);
			if (err.code === 'P2003') {
				return fail(400, { success: false, message: 'เกิดข้อผิดพลาด: Foreign key constraint failed. ตรวจสอบว่า supplierId ถูกต้อง' });
			}
			return fail(500, { success: false, message: 'เกิดข้อผิดพลาดร้ายแรงในการประมวลผลไฟล์' });
		}
	}
};