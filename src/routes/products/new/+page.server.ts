// Path: src/routes/products/new/+page.server.ts (Final Corrected Version)

import { db } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

// --- LOAD FUNCTION: Fetches data needed for the form ---
export const load: PageServerLoad = async () => {
	// Fetch all three necessary datasets for dropdowns
	const suppliers = await db.supplier.findMany({ orderBy: { name: 'asc' } });
	const categories = await db.category.findMany({ orderBy: { name: 'asc' } });
	const units = await db.unit.findMany({ orderBy: { name: 'asc' } });

	// Return all three to the +page.svelte component
	return { suppliers, categories, units };
};

// --- ACTIONS: Handles form submission ---
export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const name = data.get('name') as string;
		const supplierIdStr = data.get('supplierId') as string;
		const retailPriceStr = data.get('retailPrice') as string;
		const saveAndContinue = data.get('saveAndContinue') === 'on'; // Check if the checkbox was ticked

		if (!name || !supplierIdStr || !retailPriceStr) {
			return fail(400, { error: 'กรุณากรอกข้อมูล * ให้ครบถ้วน' });
		}

		try {
			await db.product.create({
				data: {
					name,
					barcode: (data.get('barcode') as string) || null,
					alias: (data.get('alias') as string) || null,
					costPrice: parseFloat((data.get('costPrice') as string) || '0'),
					retailPrice: parseFloat(retailPriceStr),
					wholesalePrice: data.get('wholesalePrice')
						? parseFloat(data.get('wholesalePrice') as string)
						: null,
					stockQuantity: parseInt((data.get('stockQuantity') as string) || '0'),
					reorderPoint: data.get('reorderPoint')
						? parseInt(data.get('reorderPoint') as string)
						: null,
					notes: (data.get('notes') as string) || null,
					shelfLocation: (data.get('shelfLocation') as string) || null,
					vatType: (data.get('vatType') as string) || 'none',
					// ✅ MODIFIED: Correctly handle boolean values from checkboxes
					trackStock: data.get('notTrackStock') !== 'on',
					allowPriceEdit: data.get('allowPriceEdit') === 'on',

					supplierId: parseInt(supplierIdStr),
					categoryId: data.get('categoryId')
						? parseInt(data.get('categoryId') as string)
						: null,
					unitId: data.get('unitId') ? parseInt(data.get('unitId') as string) : null
				}
			});
		} catch (err: any) {
			if (err.code === 'P2002' && err.meta?.target?.includes('barcode')) {
				return fail(400, { error: `รหัสบาร์โค้ดนี้มีอยู่แล้วในระบบ` });
			}
			console.error(err);
			return fail(500, { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
		}

		// [MODIFIED] Conditional logic based on the checkbox
		if (saveAndContinue) {
			// If checked, return a success message to stay on the page
			return { success: true, message: 'บันทึกสินค้าเรียบร้อยแล้ว เพิ่มรายการต่อไปได้เลย' };
		}

		// If not checked, redirect to the product list as before
		throw redirect(303, '/products');
	}
};