// File: src/routes/suppliers/new/+page.server.ts

import { PrismaClient } from '@prisma/client';
import { fail, redirect } from '@sveltejs/kit';

const prisma = new PrismaClient();

// `actions` คือ object ที่ SvelteKit ใช้จัดการการส่งข้อมูลจากฟอร์ม
export const actions = {
  // `default` คือ action ที่จะทำงานเมื่อฟอร์มไม่มีการระบุชื่อ action
  default: async ({ request }) => {
    // 1. ดึงข้อมูลจากฟอร์มที่ส่งมา
    const data = await request.formData();

    const code = data.get('code') as string;
    const name = data.get('name') as string;
    const taxId = data.get('taxId') as string | null;
    const phone = data.get('phone') as string | null;
    const email = data.get('email') as string | null;
    const address = data.get('address') as string | null;

    // 2. ตรวจสอบข้อมูลเบื้องต้น
    if (!code || !name) {
      // ถ้าข้อมูลที่จำเป็น (รหัส, ชื่อ) ว่างเปล่า ให้ส่ง Error กลับไป
      return fail(400, { message: 'กรุณากรอกรหัสและชื่อผู้ขาย' });
    }

    try {
      // 3. พยายามบันทึกข้อมูลลงในฐานข้อมูล
      await prisma.supplier.create({
        data: {
          code, // shorthand for code: code
          name,
          taxId,
          phone,
          email,
          address,
        },
      });
    } catch (err) {
      console.error(err);
      // 4. ถ้าเกิด Error (เช่น รหัสผู้ขายซ้ำ) ให้ส่ง Error กลับไป
      if (err.code === 'P2002') {
        return fail(400, { message: `รหัสผู้ขาย '${code}' นี้มีในระบบแล้ว` });
      }
      return fail(500, { message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    }

    // 5. ถ้าทุกอย่างสำเร็จ ให้ Redirect ผู้ใช้กลับไปที่หน้ารายการผู้ขาย
    throw redirect(303, '/suppliers');
  },
};