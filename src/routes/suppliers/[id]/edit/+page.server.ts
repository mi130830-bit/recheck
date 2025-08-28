// File: src/routes/suppliers/[id]/edit/+page.server.ts

import { PrismaClient } from '@prisma/client';
import { error, fail, redirect } from '@sveltejs/kit';

const prisma = new PrismaClient();

// --- ดึงข้อมูลของผู้ขายคนนี้มาเพื่อแสดงในฟอร์ม ---
export async function load({ params }) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: Number(params.id) },
    });

    if (!supplier) {
      throw error(404, 'ไม่พบข้อมูลผู้ขาย');
    }
    return { supplier };
  } catch {
    throw error(404, 'ไม่พบข้อมูลผู้ขาย');
  }
}

// --- จัดการ Form Actions (ตอนนี้มีแค่ 'update') ---
export const actions = {
  update: async ({ request, params }) => {
    const data = await request.formData();
    const code = data.get('code') as string;
    const name = data.get('name') as string;
    const taxId = data.get('taxId') as string;
    const phone = data.get('phone') as string;
    const email = data.get('email') as string;
    const address = data.get('address') as string;

    if (!code || !name) {
      return fail(400, { message: 'กรุณากรอกรหัสและชื่อผู้ขาย' });
    }

    try {
      await prisma.supplier.update({
        where: { id: Number(params.id) },
        data: {
          code,
          name,
          taxId,
          phone,
          email,
          address,
        },
      });
    } catch (err) {
      console.error(err);
      // ตรวจสอบว่ารหัสซ้ำกับคนอื่นหรือไม่
      if (err.code === 'P2002') {
        return fail(400, { message: `รหัสผู้ขาย '${code}' นี้มีในระบบแล้ว` });
      }
      return fail(500, { message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
    }

    // ถ้าสำเร็จ ให้ Redirect กลับไปที่หน้ารายการผู้ขาย
    throw redirect(303, '/suppliers');
  },
};