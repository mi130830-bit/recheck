// File: src/routes/products/[id]/edit/+page.server.ts
import { PrismaClient } from '@prisma/client';
import { error, fail, redirect } from '@sveltejs/kit';

const prisma = new PrismaClient();

export async function load({ params }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(params.id) },
    });
    if (!product) throw error(404, 'ไม่พบข้อมูลสินค้า');
    
    // ดึงรายชื่อผู้ขายทั้งหมดมาด้วย เพื่อใช้ใน Dropdown
    const suppliers = await prisma.supplier.findMany({ orderBy: { name: 'asc' } });
    
    // แปลงวันที่สำหรับ input
    const expiryDateString = product.expiryDate ? product.expiryDate.toISOString().split('T')[0] : null;

    return { product: { ...product, expiryDateString }, suppliers };
  } catch {
    throw error(404, 'ไม่พบข้อมูลสินค้า');
  }
}

export const actions = {
  update: async ({ request, params }) => {
    const data = await request.formData();
    // ดึงข้อมูลทั้งหมดจากฟอร์ม (เหมือนกับในหน้า new)
    const name = data.get('name') as string;
    // ... ดึงฟิลด์อื่นๆ ทั้งหมด ...
    const supplierId = parseInt(data.get('supplierId') as string);

    // ... (โค้ดแปลงชนิดข้อมูลเหมือนกับในหน้า new) ...
    
    try {
      await prisma.product.update({
        where: { id: Number(params.id) },
        data: {
          name,
          // ... ใส่ฟิลด์อื่นๆ ทั้งหมดที่จะอัปเดต ...
          supplierId,
        },
      });
    } catch (err) {
      console.error(err);
      return fail(500, { message: 'เกิดข้อผิดพลาดในการอัปเดต' });
    }
    throw redirect(303, '/products');
  },
};