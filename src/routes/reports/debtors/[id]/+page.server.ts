// Path: src/routes/reports/debtors/[id]/+page.server.ts (Final Corrected Version)
import { db } from '$lib/server/db';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { Prisma } from '@prisma/client';

export const load: PageServerLoad = async ({ params }) => {
    const customerId = parseInt(params.id);
    if (isNaN(customerId)) {
        throw error(400, 'ID ลูกค้าไม่ถูกต้อง');
    }

    const customerFromDb = await db.customer.findUnique({ where: { id: customerId } });
    if (!customerFromDb) {
        throw error(404, 'ไม่พบข้อมูลลูกค้า');
    }

    // ดึงเฉพาะบิลเชื่อที่ยังไม่ได้วางบิล (ตาม Logic เดิมของคุณ)
    const creditOrdersFromDb = await db.order.findMany({
        where: {
            customerId: customerId,
            status: 'CREDIT',
            billingNoteItem: null
        },
        orderBy: { createdAt: 'desc' }
    });

    // แปลงค่า Decimal ของ Customer
    const customer = {
        ...customerFromDb,
        // [แก้ไข] เพิ่มการรวมชื่อ-นามสกุลเข้ามาด้วย
        name: `${customerFromDb.firstName} ${customerFromDb.lastName || ''}`.trim(),
        creditLimit: customerFromDb.creditLimit ? customerFromDb.creditLimit.toNumber() : null
    };

    // แปลงค่า Decimal ทั้งหมดใน Order
    const creditOrders = creditOrdersFromDb.map(order => ({
        ...order,
        total: order.total.toNumber(),
        received: order.received ? order.received.toNumber() : null,
        change: order.change ? order.change.toNumber() : null
    }));
    
    // [แก้ไข] ส่งข้อมูลกลับในชื่อ creditOrders ตามที่หน้าเว็บต้องการ
    return { customer, creditOrders };
};

// --- Actions (ไม่มีการเปลี่ยนแปลง Logic) ---
export const actions: Actions = {
    settleDebt: async ({ request }) => {
        // ... (Logic เดิม)
        const data = await request.formData();
        const orderId = data.get('orderId');
        if (!orderId || typeof orderId !== 'string') return fail(400, { message: 'Order ID ไม่ถูกต้อง' });
        try {
            await db.order.update({ where: { id: Number(orderId) }, data: { status: 'COMPLETED' } });
        } catch (err) { return fail(500, { message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' }); }
        return { success: true };
    },

    createInvoice: async ({ request, params }) => {
        // ... (Logic เดิม)
        const customerId = Number(params.id);
        const data = await request.formData();
        const selectedOrderIds = data.getAll('selectedOrders').map(id => Number(id));
        if (selectedOrderIds.length === 0) return fail(400, { message: 'กรุณาเลือกอย่างน้อย 1 บิล' });
        try {
            const ordersToInvoice = await db.order.findMany({ where: { id: { in: selectedOrderIds }, customerId: customerId } });
            const totalAmount = ordersToInvoice.reduce((sum, order) => sum.add(order.total), new Prisma.Decimal(0));
            const newBillingNote = await db.$transaction(async (tx) => {
                const bn = await tx.billingNote.create({ data: { bnNumber: `BN-${Date.now()}`, totalAmount, customerId } });
                await tx.billingNoteItem.createMany({ data: selectedOrderIds.map(orderId => ({ billingNoteId: bn.id, orderId })) });
                return bn;
            });
            throw redirect(303, `/billing/${newBillingNote.id}`);
        } catch (err: any) {
            if (err.status === 303) throw err; 
            return fail(500, { message: 'เกิดข้อผิดพลาดในการสร้างใบวางบิล' });
        }
    }
};