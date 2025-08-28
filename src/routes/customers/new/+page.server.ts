// File: src/routes/customers/new/+page.server.ts (ฉบับสมบูรณ์)

import { PrismaClient } from '@prisma/client';
import { fail, redirect } from '@sveltejs/kit';

const prisma = new PrismaClient();

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();

    // --- ดึงข้อมูลจากฟอร์ม ---
    const memberCode = data.get('memberCode') as string;
    const title = data.get('title') as string | null;
    const firstName = data.get('firstName') as string;
    const lastName = data.get('lastName') as string | null;
    const nationalId = data.get('nationalId') as string | null;
    const phone = data.get('phone') as string | null;
    const email = data.get('email') as string | null;
    const taxId = data.get('taxId') as string | null;
    const address = data.get('address') as string | null;
    const shippingAddress = data.get('shippingAddress') as string | null;
    const notes = data.get('notes') as string | null;

    // --- ดึงและแปลงชนิดข้อมูลตัวเลข ---
    const creditLimit = data.get('creditLimit') ? parseFloat(data.get('creditLimit') as string) : null;

    // --- ดึงและแปลงชนิดข้อมูลวันที่ ---
    const dateOfBirthStr = data.get('dateOfBirth') as string | null;
    const dateOfBirth = dateOfBirthStr ? new Date(dateOfBirthStr) : null;

    // --- ตรวจสอบข้อมูลเบื้องต้น ---
    if (!memberCode || !firstName) {
      return fail(400, { message: 'กรุณากรอกรหัสสมาชิกและชื่อลูกค้า' });
    }

    try {
      // --- บันทึกข้อมูลลงฐานข้อมูล ---
      await prisma.customer.create({
        data: {
          memberCode, title, firstName, lastName, nationalId,
          phone, email, dateOfBirth, taxId, creditLimit,
          address, shippingAddress, notes,
        },
      });
    } catch (err) {
      console.error(err);
      if (err.code === 'P2002') {
        const target = err.meta?.target || [];
        if (target.includes('memberCode')) {
            return fail(400, { message: `รหัสสมาชิก '${memberCode}' นี้มีในระบบแล้ว` });
        }
        if (target.includes('nationalId')) {
            return fail(400, { message: `เลขบัตรประชาชนนี้มีในระบบแล้ว` });
        }
      }
      return fail(500, { message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    }

    throw redirect(303, '/customers');
  },
};