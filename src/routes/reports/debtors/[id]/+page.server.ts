// Path: src/routes/reports/debtors/[id]/+page.server.ts (ฉบับแก้ไขที่ถูกต้อง)

import { db } from '$lib/server/db';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const customerId = parseInt(params.id);
    if (isNaN(customerId)) {
        throw error(400, 'ID ลูกค้าไม่ถูกต้อง');
    }
    const customer = await db.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
        throw error(404, 'ไม่พบข้อมูลลูกค้า');
    }

    const creditOrders = await db.order.findMany({
        where: {
            customerId: customerId,
            status: 'CREDIT',
            billingNoteItem: null
        },
        orderBy: { createdAt: 'desc' }
    });

    return { customer, creditOrders };
};

// [แก้ไข] รวม actions ทั้งหมดไว้ใน object เดียว
export const actions: Actions = {
    // Action ที่ 1: รับชำระหนี้
    settleDebt: async ({ request }) => {
        const data = await request.formData();
        const orderId = data.get('orderId');

        if (!orderId || typeof orderId !== 'string') {
            return fail(400, { message: 'Order ID ไม่ถูกต้อง' });
        }
        try {
            await db.order.update({
                where: { id: Number(orderId) },
                data: { status: 'COMPLETED' }
            });
        } catch (err) {
            console.error('Failed to settle debt:', err);
            return fail(500, { message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
        }
        return { success: true };
    },

    // Action ที่ 2: สร้างใบวางบิล
    createInvoice: async ({ request, params }) => {
        const customerId = Number(params.id);
        const data = await request.formData();
        const selectedOrderIds = data.getAll('selectedOrders').map(id => Number(id));

        if (selectedOrderIds.length === 0) {
            return fail(400, { message: 'กรุณาเลือกอย่างน้อย 1 บิล' });
        }
        try {
            const ordersToInvoice = await db.order.findMany({
                where: {
                    id: { in: selectedOrderIds },
                    customerId: customerId,
                }
            });

            const totalAmount = ordersToInvoice.reduce((sum, order) => sum + order.total, 0);

            const newBillingNote = await db.$transaction(async (tx) => {
                const billingNote = await tx.billingNote.create({
                    data: {
                        bnNumber: `BN-${Date.now()}`,
                        totalAmount: totalAmount,
                        customerId: customerId,
                    }
                });
                await tx.billingNoteItem.createMany({
                    data: selectedOrderIds.map(orderId => ({
                        billingNoteId: billingNote.id,
                        orderId: orderId,
                    }))
                });
                return billingNote;
            });
            
            throw redirect(303, `/billing/${newBillingNote.id}`);

        } catch (err: any) {
            if (err.status === 303) throw err; 
            console.error('Failed to create invoice:', err);
            return fail(500, { message: 'เกิดข้อผิดพลาดในการสร้างใบวางบิล' });
        }
    }
};