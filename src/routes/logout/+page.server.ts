// src/routes/logout/+page.server.ts

import { lucia } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		// 1. ตรวจสอบว่ามี session อยู่หรือไม่
		if (!event.locals.session) {
			return fail(401); // ไม่ได้รับอนุญาต (Unauthorized)
		}

		// 2. ยกเลิก session ปัจจุบันในฐานข้อมูล
		await lucia.invalidateSession(event.locals.session.id);

		// 3. สร้าง session cookie ที่ว่างเปล่า (blank) เพื่อสั่งให้เบราว์เซอร์ลบ cookie เดิม
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		// 4. Redirect ผู้ใช้กลับไปที่หน้า login
		throw redirect(302, '/login');
	}
};