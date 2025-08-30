// Path: src/routes/billing/+page.server.ts (Final Working Version)

import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    // 1. ดึงข้อมูลใบวางบิลทั้งหมด
    const billingNotesFromDb = await db.billingNote.findMany({
        include: { 
            customer: true // ดึงข้อมูลลูกค้ามาด้วยเพื่อแสดงชื่อ
        },
        orderBy: { 
            createdAt: 'desc' // เรียงจากใบล่าสุดไปเก่าสุด
        }
    });
    
    // 2. แปลงค่า Decimal ทั้งหมดที่อาจมีอยู่
    const billingNotes = billingNotesFromDb.map(bn => ({
        ...bn,
        totalAmount: bn.totalAmount.toNumber(),
        // แปลงข้อมูลใน customer ที่ซ้อนอยู่ด้วย (เผื่อไว้)
        customer: {
            ...bn.customer,
            creditLimit: bn.customer.creditLimit ? bn.customer.creditLimit.toNumber() : null
        }
    }));

    return { billingNotes };
};