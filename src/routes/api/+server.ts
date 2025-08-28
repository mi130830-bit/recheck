// File: src/routes/api/orders/+server.ts

import { PrismaClient } from '@prisma/client';
import { json } from '@sveltejs/kit';

const prisma = new PrismaClient();

// ฟังก์ชันนี้จะรับ request แบบ POST
export async function POST({ request }) {
  // 1. ดึงข้อมูลตะกร้าสินค้า (cart) และยอดรวม (total) จาก request
  const { cart, total } = await request.json();

  // 2. ตรวจสอบข้อมูลเบื้องต้น
  if (!cart || cart.length === 0 || !total) {
    return json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    // 3. ใช้ Prisma Transaction เพื่อให้แน่ใจว่าทุกอย่างสำเร็จพร้อมกัน
    // ถ้าขั้นตอนใดขั้นตอนหนึ่งล้มเหลว ทุกอย่างจะถูกยกเลิก (rollback)
    const newOrder = await prisma.$transaction(async (tx) => {
      // 3.1 สร้าง Order หลักขึ้นมาก่อน
      const order = await tx.order.create({
        data: {
          total: total,
          // customerId: ... (ในอนาคตจะเพิ่ม)
        },
      });

      // 3.2 สร้าง OrderItem สำหรับสินค้าแต่ละชิ้นในตะกร้า
      for (const item of cart) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.id,
            quantity: item.quantity,
            price: item.retailPrice, // บันทึกราคา ณ ตอนที่ขาย
          },
        });

        // 3.3 (สำคัญ!) ตัดสต็อกสินค้า
        await tx.product.update({
          where: { id: item.id },
          data: {
            stockQuantity: {
              decrement: item.quantity, // ลดจำนวนสต็อกลง
            },
          },
        });
      }

      return order;
    });

    // 4. ถ้าทุกอย่างสำเร็จ ส่งข้อมูล order ที่สร้างใหม่กลับไป
    return json(newOrder, { status: 201 });

  } catch (err) {
    console.error('Error creating order:', err);
    return json({ error: 'ไม่สามารถบันทึกการขายได้' }, { status: 500 });
  }
}