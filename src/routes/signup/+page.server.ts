// File: src/routes/signup/+page.server.ts
import { lucia } from '$lib/server/auth';
import { PrismaClient } from '@prisma/client';
import { fail, redirect } from '@sveltejs/kit';
import { Argon2id } from 'oslo/password'; // Library สำหรับ Hash รหัสผ่าน
import { generateId } from 'lucia';

const prisma = new PrismaClient();

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const username = data.get('username') as string;
    const password = data.get('password') as string;

    if (!username || !password || password.length < 4) {
      return fail(400, { message: 'กรุณากรอก Username และ Password (อย่างน้อย 4 ตัวอักษร)' });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return fail(400, { message: 'Username นี้มีผู้ใช้งานแล้ว' });
    }

    const userId = generateId(15);
    const hashedPassword = await new Argon2id().hash(password);

    await prisma.user.create({
      data: {
        id: userId,
        username: username,
        password: hashedPassword,
        role: 'ADMIN', // << ให้ user คนแรกเป็น ADMIN
      },
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes,
    });

    throw redirect(303, '/'); // สมัครเสร็จแล้วให้ไปที่หน้าแรก
  },
};