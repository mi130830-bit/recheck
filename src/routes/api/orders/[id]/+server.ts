// Path: src/routes/api/orders/[id]/+server.ts (ฉบับปรับปรุง)

import { db } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// ฟังก์ชันสำหรับลบบิล (เช่น บิลที่พักไว้)
export const DELETE: RequestHandler = async ({ params }) => {
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
        throw error(400, 'ID ของบิลไม่ถูกต้อง');
    }

    try {
        // การลบข้อมูลที่มีความสัมพันธ์กัน (Order -> OrderItem)
        // Prisma จะจัดการให้เองโดยอัตโนมัติ ถ้าเราตั้งค่า `onDelete: Cascade` ใน schema
        // แต่เพื่อความปลอดภัย การลบแบบ manual ใน transaction ก็เป็นวิธีที่ดีมาก
        
        await db.$transaction(async (tx) => {
            // 1. ลบ OrderItem ทั้งหมดที่ผูกกับ Order นี้ก่อน
            await tx.orderItem.deleteMany({
                where: { orderId: orderId },
            });

            // 2. จากนั้นจึงลบ Order หลัก
            await tx.order.delete({
                where: { id: orderId },
            });
        });

        // ส่ง response กลับไปว่าสำเร็จ (ใช้ status 200 และ body ที่ชัดเจน)
        return json({ success: true, message: 'ลบบิลสำเร็จ' }, { status: 200 });

    } catch (err: any) {
        console.error('Failed to delete order:', err);
        
        // จัดการกรณีที่พยายามลบบิลที่ไม่มีอยู่จริง (เช่น ถูกลบไปแล้ว)
        if (err.code === 'P2025') { // 'Record to delete does not exist.'
            return json({ success: true, message: 'ไม่พบบิลที่ต้องการลบ (อาจถูกลบไปแล้ว)' }, { status: 200 });
        }
        
        throw error(500, 'เกิดข้อผิดพลาดในการลบบิล');
    }
};