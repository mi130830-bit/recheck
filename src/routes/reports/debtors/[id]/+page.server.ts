// Path: src/routes/reports/debtors/[id]/+page.server.ts (ฉบับเพิ่ม Action)

import { db } from '$lib/server/db';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

// ฟังก์ชัน load (เหมือนเดิม)
export const load: PageServerLoad = async ({ params }) => {
    const customerId = parseInt(params.id);
    if (isNaN(customerId)) {
        throw error(400, 'ID ลูกค้าไม่ถูกต้อง');
    }

    const customer = await db.customer.findUnique({
        where: { id: customerId }
    });

    if (!customer) {
        throw error(404, 'ไม่พบข้อมูลลูกค้า');
    }

    const creditOrders = await db.order.findMany({
        where: {
            customerId: customerId,
            status: 'CREDIT'
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return { customer, creditOrders };
};

// [เพิ่มใหม่] ฟังก์ชันสำหรับจัดการ Form Actions
export const actions: Actions = {
    // Action ชื่อ 'settleDebt'
    settleDebt: async ({ request }) => {
        const data = await request.formData();
        const orderId = data.get('orderId');

        if (!orderId || typeof orderId !== 'string') {
            return fail(400, { message: 'Order ID ไม่ถูกต้อง' });
        }

        try {
            await db.order.update({
                where: { id: Number(orderId) },
                data: {
                    status: 'COMPLETED' // อัปเดตสถานะเป็นจ่ายแล้ว
                }
            });
        } catch (err) {
            console.error('Failed to settle debt:', err);
            return fail(500, { message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
        }
        
        // ไม่ต้อง return อะไรเป็นพิเศษ เพราะ use:enhance จะโหลดหน้าใหม่ให้เอง
        return { success: true };
    }
};