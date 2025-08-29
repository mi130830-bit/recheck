import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// ฟังก์ชันนี้จะทำงานที่ฝั่ง Server ก่อนที่หน้าเว็บจะถูกสร้าง
export const load: PageServerLoad = async ({ params, fetch }) => {
	const orderId = params.orderId;
	
	try {
		// เรียก API ที่เราสร้างไว้เพื่อดึงข้อมูล
		const response = await fetch(`/api/receipts/${orderId}`);
		
		if (!response.ok) {
			const errorData = await response.json();
			throw error(response.status, errorData.message || 'Failed to load receipt data');
		}

		const data = await response.json();
		return {
			receiptData: data
		};
	} catch (err: any) {
		// ดักจับ error ที่อาจเกิดขึ้น
		throw error(err.status || 500, err.body?.message || 'An unexpected error occurred');
	}
};