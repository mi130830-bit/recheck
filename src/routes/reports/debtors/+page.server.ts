// File: src/routes/reports/debtors/+page.server.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function load() {
  // --- Prisma Query เพื่อสรุปยอดหนี้ของลูกค้าแต่ละคน ---
  const debtorsSummary = await prisma.order.groupBy({
    by: ['customerId'], // 1. จัดกลุ่มตาม ID ของลูกค้า
    where: {
      status: 'CREDIT', // 2. เอาเฉพาะบิลที่เป็น "ขายเชื่อ"
      customerId: {
        not: null, // และต้องเป็นบิลที่ผูกกับลูกค้าเท่านั้น
      },
    },
    _sum: {
      total: true, // 3. คำนวณ "ผลรวม" ของยอดบิลในแต่ละกลุ่ม
    },
    _count: {
      _all: true, // 4. "นับจำนวน" บิลในแต่ละกลุ่ม
    },
    orderBy: {
      _sum: {
        total: 'desc', // 5. เรียงจากลูกหนี้ที่มียอดค้างชำระสูงสุด
      },
    },
  });

  // ตอนนี้ debtorsSummary จะมีหน้าตาแบบนี้:
  // [ { customerId: 1, _sum: { total: 5000 }, _count: { _all: 3 } }, ... ]

  // ดึงข้อมูลลูกค้า (ชื่อ, โทรศัพท์) มาประกอบร่าง
  if (debtorsSummary.length > 0) {
    const customerIds = debtorsSummary.map(item => item.customerId as number);
    
    const customers = await prisma.customer.findMany({
      where: {
        id: { in: customerIds },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        memberCode: true,
      }
    });

    // นำข้อมูล 2 ส่วนมาประกอบร่างกัน
    const reportData = debtorsSummary.map(summary => {
      const customerInfo = customers.find(c => c.id === summary.customerId);
      return {
        customerId: summary.customerId,
        totalDebt: summary._sum.total,
        billCount: summary._count._all,
        customer: customerInfo,
      };
    });
    
    return { debtors: reportData };
  }

  // ถ้าไม่มีลูกหนี้เลย
  return { debtors: [] };
}