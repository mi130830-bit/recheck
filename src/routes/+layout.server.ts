// Path: src/routes/+layout.server.ts

import type { LayoutServerLoad } from './$types';

/**
 * ฟังก์ชัน load นี้จะทำงานบนฝั่งเซิร์ฟเวอร์เสมอ
 * สำหรับทุกๆ หน้าที่อยู่ภายใต้ layout นี้
 */
export const load: LayoutServerLoad = async ({ locals }) => {
	// ดึงข้อมูล user และ session ที่ถูกแนบมาโดย hooks.server.ts
	// แล้วส่งต่อไปยังตัวแปร `data` ในหน้า Svelte (+layout.svelte)
	// ทำให้เราสามารถเข้าถึงข้อมูลผู้ใช้ได้จาก data.user ในทุกหน้า
	return {
		user: locals.user
	};
};