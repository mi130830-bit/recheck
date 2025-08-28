// File: src/routes/products/new/+page.server.ts

import { PrismaClient } from '@prisma/client';
import { fail, redirect } from '@sveltejs/kit';

const prisma = new PrismaClient();

// --- ส่วนที่ 1: ดึงข้อมูลที่จำเป็นสำหรับแสดงในฟอร์ม ---
export async function load() {
  console.log('Server: กำลังดึงรายชื่อ suppliers สำหรับ Dropdown ในหน้าเพิ่มสินค้า...');
  
  // ดึงข้อมูลผู้ขายทั้งหมด เพื่อเอาไปสร้างเป็นตัวเลือกในฟอร์ม
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: 'asc' }, // เรียงตามชื่อ A-Z
  });

  // ส่งข้อมูล suppliers กลับไปให้หน้า +page.svelte
  return { suppliers };
}


// --- ส่วนที่ 2: จัดการการส่งข้อมูลจากฟอร์ม ---
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();

    // --- ดึงข้อมูลจากฟอร์ม (Text) ---
    const name = data.get('name') as string;
    const alias = data.get('alias') as string | null;
    const barcode = data.get('barcode') as string | null;
    const category = data.get('category') as string | null;
    const unit = data.get('unit') as string | null;
    const vatType = data.get('vatType') as string | null;
    const notes = data.get('notes') as string | null;
    const shelfLocation = data.get('shelfLocation') as string | null;
    const supplierIdStr = data.get('supplierId') as string;

    // --- ดึงและแปลงชนิดข้อมูลตัวเลข ---
    const costPrice = parseFloat(data.get('costPrice') as string || '0');
    const retailPrice = parseFloat(data.get('retailPrice') as string);
    const wholesalePrice = data.get('wholesalePrice') ? parseFloat(data.get('wholesalePrice') as string) : null;
    const stockQuantity = parseInt(data.get('stockQuantity') as string || '0');
    const reorderPoint = data.get('reorderPoint') ? parseInt(data.get('reorderPoint') as string) : null;
    const purchaseLimit = data.get('purchaseLimit') ? parseInt(data.get('purchaseLimit') as string) : null;
    const points = data.get('points') ? parseInt(data.get('points') as string) : null;

    // --- ดึงและแปลงชนิดข้อมูล Checkbox ---
    // ถ้าติ๊ก 'notTrackStock' (on) แปลว่า trackStock ต้องเป็น false
    const trackStock = data.get('notTrackStock') === null; 
    const allowPriceEdit = data.get('allowPriceEdit') === 'on';

    // --- ดึงและแปลงชนิดข้อมูลวันที่ ---
    const expiryDateStr = data.get('expiryDate') as string | null;
    const expiryDate = expiryDateStr ? new Date(expiryDateStr) : null;

    // --- ตรวจสอบข้อมูลเบื้องต้น ---
    if (!name || !retailPrice || !supplierIdStr) {
      return fail(400, { message: 'กรุณากรอกข้อมูล * ให้ครบถ้วน' });
    }
    const supplierId = parseInt(supplierIdStr);

    try {
      // --- บันทึกข้อมูลลงฐานข้อมูล ---
      await prisma.product.create({
        data: {
          name, alias, barcode, category, unit, vatType, notes, shelfLocation,
          costPrice, retailPrice, wholesalePrice, stockQuantity, reorderPoint,
          purchaseLimit, points, trackStock, allowPriceEdit, expiryDate,
          supplierId, // Foreign Key ที่เชื่อมไปยังตาราง Supplier
        },
      });
    } catch (err) {
      console.error(err);
      if (err.code === 'P2002') { // P2002 คือรหัส Error ของ Unique Constraint
        return fail(400, { message: `รหัสบาร์โค้ด '${barcode}' นี้มีในระบบแล้ว` });
      }
      return fail(500, { message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    }

    // ถ้าทุกอย่างสำเร็จ ให้ Redirect กลับไปที่หน้ารายการสินค้า
    throw redirect(303, '/products');
  },
};