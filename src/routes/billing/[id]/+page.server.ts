// Path: src/routes/billing/[id]/+page.server.ts

import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const billingNoteId = parseInt(params.id);
    if (isNaN(billingNoteId)) {
        throw error(400, 'ID ของใบวางบิลไม่ถูกต้อง');
    }

    // ดึงข้อมูลใบวางบิลฉบับเต็ม
    const billingNote = await db.billingNote.findUnique({
        where: { id: billingNoteId },
        include: {
            // 1. ดึงข้อมูลลูกค้า
            customer: true,
            // 2. ดึงรายการบิลทั้งหมดที่อยู่ในใบวางบิลนี้
            items: {
                include: {
                    // 3. และดึงข้อมูลของบิล (Order) แต่ละใบมาด้วย
                    order: true
                }
            }
        }
    });

    if (!billingNote) {
        throw error(404, 'ไม่พบข้อมูลใบวางบิล');
    }

    // (ทางเลือก) ดึงข้อมูลร้านค้า (ถ้ามี)
    const companyInfo = {
        name: 'บริษัท PJ วัสดุก่อสร้าง จำกัด',
        address: '123 หมู่ 4 ต.บางเมือง อ.เมือง จ.สมุทรปราการ 10270',
        taxId: '0123456789012',
        phone: '02-123-4567'
    };

    return { billingNote, companyInfo };
};