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

    // --- 1. ดึงข้อมูลจากฟอร์มให้ครบทุก field ---
    const name = data.get('name') as string;
    const alias = data.get('alias') as string | null;
    const barcode = data.get('barcode') as string | null;
    const category = data.get('category') as string | null;
    const unit = data.get('unit') as string | null;
    const costPrice = parseFloat(data.get('costPrice') as string);
    const retailPrice = parseFloat(data.get('retailPrice') as string);
    const wholesalePriceStr = data.get('wholesalePrice') as string;
    const vatType = data.get('vatType') as string | null;
    const stockQuantity = parseInt(data.get('stockQuantity') as string);
    const trackStock = data.get('trackStock') === 'on'; // Checkbox value is 'on' when checked
    const reorderPointStr = data.get('reorderPoint') as string;
    const shelfLocation = data.get('shelfLocation') as string | null;
    const expiryDateStr = data.get('expiryDate') as string;
    const notes = data.get('notes') as string | null;
    const allowPriceEdit = data.get('allowPriceEdit') === 'on';
    const supplierId = parseInt(data.get('supplierId') as string);

        // --- 2. ตรวจสอบและแปลงชนิดข้อมูล ---
    if (!name || isNaN(costPrice) || isNaN(retailPrice) || isNaN(stockQuantity) || isNaN(supplierId)) {
      return fail(400, { message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
    }

    const wholesalePrice = wholesalePriceStr ? parseFloat(wholesalePriceStr) : null;
    const reorderPoint = reorderPointStr ? parseInt(reorderPointStr) : null;
    const expiryDate = expiryDateStr ? new Date(expiryDateStr) : null;
    
    try {
      // --- 3. อัปเดตข้อมูลในฐานข้อมูลให้ครบทุก field ---
      await prisma.product.update({
        where: { id: Number(params.id) },
        data: {
          name,
          alias,
          barcode,
          category,
          unit,
          costPrice,
          retailPrice,
          wholesalePrice,
          vatType,
          stockQuantity,
          trackStock,
          reorderPoint,
          shelfLocation,
          expiryDate,
          notes,
          allowPriceEdit,
          supplierId,
        },
      });
    } catch (err) {
      console.error(err);
      return fail(500, { message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลสินค้า' });
    }

    // --- 4. เมื่อสำเร็จ ให้ Redirect กลับไป ---
    throw redirect(303, '/products');
  },
};