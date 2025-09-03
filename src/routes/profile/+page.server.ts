// File: src/routes/profile/+page.server.ts

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    // ตรวจสอบข้อมูล user ใน locals (ซึ่งมาจาก hooks)
	if (!locals.user) {
        // ถ้าไม่มี (ยังไม่ล็อกอิน) ให้โยน redirect ไปหน้า login ทันที
		throw redirect(303, '/login');
	}

    // ถ้าล็อกอินแล้ว ให้ส่งข้อมูล user ไปแสดงผลที่หน้า profile
	return {
		user: locals.user
	};
};