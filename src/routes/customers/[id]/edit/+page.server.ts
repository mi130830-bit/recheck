// File: src/routes/customers/[id]/edit/+page.server.ts

import { PrismaClient } from '@prisma/client';
import { error, fail, redirect } from '@sveltejs/kit';

const prisma = new PrismaClient();

// --- ดึงข้อมูลของลูกค้าคนนี้มาเพื่อแสดงในฟอร์ม ---
export async function load({ params }) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: Number(params.id) },
    });

    if (!customer) {
      throw error(404, 'ไม่พบข้อมูลลูกค้า');
    }
    // แปลง Date object ให้เป็น string YYYY-MM-DD เพื่อให้ input type="date" ใช้งานได้
    const dateOfBirthString = customer.dateOfBirth ? customer.dateOfBirth.toISOString().split('T')[0] : null;

    return { customer: { ...customer, dateOfBirthString } };
  } catch {
    throw error(404, 'ไม่พบข้อมูลลูกค้า');
  }
}

// --- จัดการ Form Actions (ตอนนี้มีแค่ 'update') ---
export const actions = {
  update: async ({ request, params }) => {
    const data = await request.formData();
    
    // ดึงข้อมูลทั้งหมดจากฟอร์ม
    const memberCode = data.get('memberCode') as string;
    const title = data.get('title') as string;
    const firstName = data.get('firstName') as string;
    const lastName = data.get('lastName') as string;
    const nationalId = data.get('nationalId') as string;
    const phone = data.get('phone') as string;
    const email = data.get('email') as string;
    const taxId = data.get('taxId') as string;
    const address = data.get('address') as string;
    const shippingAddress = data.get('shippingAddress') as string;
    const notes = data.get('notes') as string;
    const creditLimit = data.get('creditLimit') ? parseFloat(data.get('creditLimit') as string) : null;
    const dateOfBirthStr = data.get('dateOfBirth') as string;
    const dateOfBirth = dateOfBirthStr ? new Date(dateOfBirthStr) : null;

    if (!memberCode || !firstName) {
      return fail(400, { message: 'กรุณากรอกรหัสสมาชิกและชื่อ' });
    }

    try {
      await prisma.customer.update({
        where: { id: Number(params.id) },
        data: {
          memberCode, title, firstName, lastName, nationalId,
          phone, email, dateOfBirth, taxId, creditLimit,
          address, shippingAddress, notes,
        },
      });
    } catch (err) {
      console.error(err);
      if (err.code === 'P2002') { // Handle unique constraint errors
        const target = err.meta?.target || [];
        if (target.includes('memberCode')) return fail(400, { message: `รหัสสมาชิก '${memberCode}' ซ้ำ` });
        if (target.includes('nationalId')) return fail(400, { message: `เลขบัตรประชาชนซ้ำ` });
      }
      return fail(500, { message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
    }

    // ถ้าสำเร็จ ให้ Redirect กลับไปที่หน้ารายการลูกค้า
    throw redirect(303, '/customers');
  },
};