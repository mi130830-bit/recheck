// Path: src/routes/stock-in/+page.server.ts (Final Corrected Version - Please use this)

import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // 1. ดึงข้อมูล Suppliers (ไม่มี Decimal ไม่ต้องแปลง)
  const suppliers = await db.supplier.findMany({ orderBy: { name: 'asc' } });

  // 2. ดึงข้อมูล Products
  const productsFromDb = await db.product.findMany({ orderBy: { name: 'asc' } });

  // 3. [จุดแก้ไขสำคัญ] แปลงค่า Decimal ใน products ให้เป็น Number
  //    นี่คือส่วนที่แก้ไข Error "not serializable"
  const products = productsFromDb.map(p => ({
    ...p, // คัดลอกข้อมูลเดิมทั้งหมด
    // เขียนทับ field ที่เป็น Decimal ด้วยค่าที่แปลงแล้ว
    costPrice: p.costPrice.toNumber(),
    retailPrice: p.retailPrice.toNumber(),
    wholesalePrice: p.wholesalePrice ? p.wholesalePrice.toNumber() : null
  }));

  // 4. ส่งข้อมูลที่ปลอดภัย (แปลงค่าแล้ว) ออกไป
  return { suppliers, products };
}