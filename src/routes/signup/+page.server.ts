// Path: src/routes/signup/+page.server.ts (ฉบับแก้ไขที่ถูกต้อง)

import { lucia } from '$lib/server/auth';
import { db } from '$lib/server/db'; // แนะนำให้ใช้ Prisma Client จากไฟล์กลาง
import { fail, redirect } from '@sveltejs/kit';
import { Argon2id } from 'oslo/password'; // Import ตัว hash
import { generateId } from 'lucia'; // Import ตัวสร้าง ID

import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (typeof username !== 'string' || username.length < 3) {
			return fail(400, { message: 'Username ต้องมีอย่างน้อย 3 ตัวอักษร' });
		}
		if (typeof password !== 'string' || password.length < 6) {
			return fail(400, { message: 'Password ต้องมีอย่างน้อย 6 ตัวอักษร' });
		}

		// ✅ --- ส่วนที่สำคัญที่สุด ---
		// 1. ทำการ Hash รหัสผ่านที่ผู้ใช้กรอกเข้ามา
		const hashedPassword = await new Argon2id().hash(password);
		const userId = generateId(15); // สร้าง User ID ที่ไม่ซ้ำกัน

		try {
			// 2. บันทึก hashedPassword (ไม่ใช่ password ธรรมดา) ลงในฐานข้อมูล
			await db.user.create({
				data: {
					id: userId,
					username: username,
					password: hashedPassword, // <--- ใช้ตัวแปรที่ hash แล้ว
					role: 'USER'
				}
			});
		} catch (e) {
			// จัดการกรณี username ซ้ำ
			return fail(400, { message: 'Username นี้ถูกใช้งานแล้ว' });
		}

		// 3. สร้าง Session และ Cookie ให้ผู้ใช้ใหม่ทันที (ล็อกอินอัตโนมัติ)
		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		// 4. Redirect ไปหน้าแรก
		throw redirect(303, '/');
	}
};