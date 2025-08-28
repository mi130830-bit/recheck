// Path: src/routes/reports/debtors/+page.server.ts (ฉบับแก้ไข)

import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// 1. หายอดรวมและจำนวนบิลที่ค้างชำระของลูกค้าแต่ละคน
	const debtorsAggregates = await db.order.groupBy({
		by: ['customerId'], // จัดกลุ่มตาม ID ของลูกค้า
		where: {
			status: 'CREDIT' // เอาเฉพาะบิลที่เป็นหนี้
		},
		_count: {
			id: true // นับจำนวนบิล (ตั้งชื่อเล่นว่า id)
		},
		_sum: {
			total: true // รวมยอดเงินทั้งหมด
		}
	});

	// 2. ดึงข้อมูลลูกค้าที่มีหนี้ค้าง
	const customerIds = debtorsAggregates.map((d) => d.customerId).filter(Boolean) as number[];
	
	const customers = await db.customer.findMany({
		where: {
			id: {
				in: customerIds
			}
		}
	});

	// 3. นำข้อมูล 2 ส่วนมารวมกันเพื่อให้แสดงผลได้ง่าย
	const debtors = customers.map((customer) => {
		const aggregate = debtorsAggregates.find((agg) => agg.customerId === customer.id);
		return {
			...customer,
			billCount: aggregate?._count.id || 0,
			totalDebt: aggregate?._sum.total || 0
		};
	});

	return { debtors };
};