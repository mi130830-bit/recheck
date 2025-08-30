// Path: src/routes/billing/[id]/+page.server.ts (Final Corrected Version)

import { db } from '$lib/server/db';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const billingNoteId = parseInt(params.id);
    if (isNaN(billingNoteId)) {
        throw error(404, 'ID ของใบวางบิลไม่ถูกต้อง');
    }

    const billingNoteFromDb = await db.billingNote.findUnique({
        where: { id: billingNoteId },
        include: {
            customer: true,
            items: { 
                include: { 
                    order: true // ดึงข้อมูล Order เต็มๆ มาด้วย
                } 
            }
        }
    });

    if (!billingNoteFromDb) {
        throw error(404, 'ไม่พบข้อมูลใบวางบิล');
    }

    // [จุดแก้ไขสำคัญ] แปลงค่า Decimal ทั้งหมดที่เกี่ยวข้อง
    const customer = {
        ...billingNoteFromDb.customer,
        name: `${billingNoteFromDb.customer.firstName} ${billingNoteFromDb.customer.lastName || ''}`.trim(),
        creditLimit: billingNoteFromDb.customer.creditLimit ? billingNoteFromDb.customer.creditLimit.toNumber() : null
    };

    const billingNote = {
        ...billingNoteFromDb,
        totalAmount: billingNoteFromDb.totalAmount.toNumber(),
        customer: customer,
        items: billingNoteFromDb.items.map(item => ({
            ...item,
            order: {
                ...item.order,
                total: item.order.total.toNumber(),
                // [เพิ่ม] แปลงค่าที่อาจมีใน Order ด้วย
                received: item.order.received ? item.order.received.toNumber() : null,
                change: item.order.change ? item.order.change.toNumber() : null,
            }
        }))
    };

    const companyInfo = {
        name: 'บริษัท PJ วัสดุก่อสร้าง จำกัด',
        address: '123 หมู่ 4 ต.บางเมือง อ.เมือง จ.สมุทรปราการ 10270',
        taxId: '0123456789012',
        phone: '02-123-4567'
    };

    return { billingNote, companyInfo };
};

// --- Actions (เหมือนเดิมทุกประการ) ---
export const actions: Actions = {
    markAsPaid: async ({ params }) => {
        try {
            await db.billingNote.update({
                where: { id: Number(params.id) },
                data: { status: 'PAID', paidAt: new Date() }
            });
            return { success: true };
        } catch (err) {
            return fail(500, { message: 'เกิดข้อผิดพลาดในการบันทึกการชำระเงิน' });
        }
    },
    cancelBillingNote: async ({ params }) => {
        try {
            await db.billingNote.update({
                where: { id: Number(params.id) },
                data: { status: 'CANCELLED' }
            });
            return { success: true };
        } catch (err) {
            return fail(500, { message: 'เกิดข้อผิดพลาดในการยกเลิกใบวางบิล' });
        }
    }
};