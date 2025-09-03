// File: src/hooks.server.ts (ฉบับแก้ไขสมบูรณ์)

import { lucia } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';

// ✅ แก้ไข: เปลี่ยน 'in' เป็น '=> {'
export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
	} else {
		// ย้าย try...catch มาไว้ใน else เพื่อให้โค้ดสะอาดขึ้น
		try {
			const { session, user } = await lucia.validateSession(sessionId);

			if (session && session.fresh) {
				const sessionCookie = lucia.createSessionCookie(session.id);
				event.cookies.set(sessionCookie.name, sessionCookie.value, {
					path: '.',
					...sessionCookie.attributes
				});
			}
			if (!session) {
				const sessionCookie = lucia.createBlankSessionCookie();
				event.cookies.set(sessionCookie.name, sessionCookie.value, {
					path: '.',
					...sessionCookie.attributes
				});
			}

			event.locals.user = user;
			event.locals.session = session;
		} catch {
			event.locals.user = null;
			event.locals.session = null;
		}
	}

	// ถ้าผู้ใช้พยายามเข้าหน้าที่ขึ้นต้นด้วย /manage (หรือ path อื่นที่คุณต้องการป้องกัน)
	if (event.url.pathname.startsWith('/manage')) { // <--- คุณสามารถเปลี่ยน path ตรงนี้ได้
		// และถ้ายังไม่ได้ล็อกอิน (เช็คจาก locals ที่เราเพิ่งตั้งค่าไป)
		if (!event.locals.user) {
			// ให้ไล่กลับไปที่หน้า login ทันที
			throw redirect(303, '/login');
		}
	}
    // ถ้าผู้ใช้เข้าหน้าอื่น หรือล็อกอินแล้ว ก็ปล่อยให้ทำงานต่อไปตามปกติ
	return resolve(event);
}; // ✅ เพิ่ม: ปิดฟังก์ชันด้วย '}' (โค้ดเดิมของคุณมีอยู่แล้ว แค่ยืนยัน)