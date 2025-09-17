import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import * as xlsx from 'xlsx';
import { Prisma } from '@prisma/client';

// [ปรับปรุง] สร้าง Interface สำหรับแถวข้อมูลจาก Excel เพื่อ Type Safety
interface ProductRow {
	'รหัสบาร์โค้ด'?: string;
	'ชื่อสินค้า (บังคับ)': string;
	'ชื่อผู้ขาย (บังคับ)': string;
	'ชื่อย่อ/รหัสค้นหา'?: string;
	'ประเภทสินค้า'?: string;
	'ต้นทุน'?: number;
	'ราคาปลีก (บังคับ)': number;
	'ราคาส่ง'?: number;
	'จำนวนสินค้า'?: number;
	'หน่วย'?: string;
	'จุดสั่งซื้อ'?: number;
	'หมายเหตุ'?: string;
}

// --- LOAD FUNCTION: ไม่ได้ใช้ แต่ต้องมีตามโครงสร้าง ---
export const load: PageServerLoad = async () => {
	return {};
};

// --- ACTIONS: จัดการการอัปโหลดและประมวลผลไฟล์ Excel ---
export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const file = formData.get('excelFile') as File;

		if (!file || file.size === 0) {
			return fail(400, { success: false, message: 'กรุณาเลือกไฟล์ Excel' });
		}

		try {
			// --- 1. เตรียมข้อมูล Suppliers ---
			// ดึงข้อมูลผู้ขายทั้งหมดมาสร้าง Map เพื่อการค้นหาที่รวดเร็ว (case-insensitive)
			const allSuppliers = await db.supplier.findMany({ select: { id: true, name: true } });
			const supplierMap = new Map(allSuppliers.map((s) => [s.name.trim().toLowerCase(), s.id]));

			// --- 2. อ่านข้อมูลจากไฟล์ Excel ---
			const buffer = Buffer.from(await file.arrayBuffer());
			const workbook = xlsx.read(buffer, { type: 'buffer' });
			const sheetName = workbook.SheetNames[0];
			const sheet = workbook.Sheets[sheetName];
			const data = xlsx.utils.sheet_to_json<ProductRow>(sheet);

			if (data.length === 0) {
				return fail(400, { success: false, message: 'ไฟล์ Excel ว่างเปล่า' });
			}

			// --- 3. ตรวจสอบและเตรียมข้อมูล (Validation & Transformation) ---
			const productsToCreate: Prisma.ProductCreateManyInput[] = [];
			const errors: string[] = [];

			for (const [index, row] of data.entries()) {
				const rowNum = index + 2;
				const productName = row['ชื่อสินค้า (บังคับ)'];
				const supplierName = row['ชื่อผู้ขาย (บังคับ)'];
				const retailPrice = row['ราคาปลีก (บังคับ)'];

				// Validation พื้นฐาน
				if (!productName || !supplierName || retailPrice === undefined) {
					errors.push(`แถวที่ ${rowNum}: ข้อมูล "ชื่อสินค้า", "ชื่อผู้ขาย", และ "ราคาปลีก" ห้ามเว้นว่าง`);
					continue;
				}

				const supplierId = supplierMap.get(supplierName.trim().toLowerCase());
				if (!supplierId) {
					errors.push(`แถวที่ ${rowNum}: ไม่พบผู้ขายชื่อ "${supplierName}" ในระบบ`);
					continue;
				}

				// เพิ่มข้อมูลที่ผ่านการตรวจสอบแล้วลงใน Array
				productsToCreate.push({
					name: productName,
					supplierId: supplierId,
					retailPrice: retailPrice,
					barcode: row['รหัสบาร์โค้ด'] || null,
					alias: row['ชื่อย่อ/รหัสค้นหา'] || null,
					costPrice: row['ต้นทุน'] || 0,
					wholesalePrice: row['ราคาส่ง'] || null,
					stockQuantity: row['จำนวนสินค้า'] || 0,
					reorderPoint: row['จุดสั่งซื้อ'] || null,
					notes: row['หมายเหตุ'] || null
					// หมายเหตุ: category และ unit ต้องจัดการเพิ่มเติมถ้าต้องการสร้างใหม่/เชื่อมโยง
				});
			}

			// --- 4. จัดการผลลัพธ์และบันทึกข้อมูล ---
			if (productsToCreate.length === 0) {
				const errorMessage = 'ไม่พบข้อมูลที่ถูกต้องสำหรับนำเข้า\n' + errors.join('\n');
				return fail(400, { success: false, message: errorMessage });
			}

			// ใช้ createMany และ skipDuplicates เพื่อประสิทธิภาพและความปลอดภัย
			const result = await db.product.createMany({
				data: productsToCreate,
				skipDuplicates: true // ข้ามรายการที่มี barcode ซ้ำ
			});

			// สร้างข้อความสรุปผล
			let finalMessage = `นำเข้าข้อมูลสำเร็จ ${result.count} รายการ`;
			if (errors.length > 0) {
				const errorDetails = `\n\nข้อผิดพลาดจากรายการอื่นๆ (ไม่ถูกนำเข้า):\n` + errors.join('\n');
				finalMessage += errorDetails;
				return { success: false, message: finalMessage }; // ส่งเป็น success: false เพราะมี error
			}

			return { success: true, message: finalMessage };
		} catch (err) {
			console.error('Excel import error:', err);
			return fail(500, { success: false, message: 'เกิดข้อผิดพลาดในการประมวลผลไฟล์' });
		}
	}
};
