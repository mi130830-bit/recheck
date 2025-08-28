// File: src/routes/login/+page.server.ts
import { lucia } from '$lib/server/auth';
import { PrismaClient } from '@prisma/client';
import { fail, redirect } from '@sveltejs/kit';
import { Argon2id } from 'oslo/password';
// เพิ่มการ Import Types สำหรับ SvelteKit
import type { Actions, PageServerLoad } from './$types';

const prisma = new PrismaClient();

// --- เพิ่มส่วน Load Function ---
// ทำงานเมื่อผู้ใช้เข้ามาที่หน้า /login (GET Request)
export const load: PageServerLoad = async (event) => {
    // ตรวจสอบว่ามีข้อมูล User ใน locals หรือไม่ (ถูกตั้งค่ามาจาก hooks.server.ts)
	if (event.locals.user) {
        // ถ้า Login อยู่แล้ว ให้ Redirect ไปหน้าแรกทันที (ใช้ 302 Found)
		throw redirect(302, "/");
	}
    // ถ้ายังไม่ Login ให้แสดงหน้าตามปกติ
	return {};
};
// --------------------------------

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const username = data.get('username') as string;
    const password = data.get('password') as string;

    if (!username || !password) {
      return fail(400, { message: 'กรุณากรอก Username และ Password' });
    }
    
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (!existingUser) {
      return fail(400, { message: 'Username หรือ Password ไม่ถูกต้อง' });
    }
    
    const validPassword = await new Argon2id().verify(existingUser.password, password);
    if (!validPassword) {
      return fail(400, { message: 'Username หรือ Password ไม่ถูกต้อง' });
    }
    
    // สร้าง Session และ Cookie
    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes,
    });

    // Redirect หลังจาก Login สำเร็จ (ใช้ 303 See Other สำหรับการ Redirect หลัง POST)
    throw redirect(303, '/');
  },
};