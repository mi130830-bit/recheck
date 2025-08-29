// Path: src/routes/reports/debtors/+page.server.ts (Final Corrected Version)

import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// 1. หายอดรวมและจำนวนบิลที่ค้างชำระของลูกค้าแต่ละคน
	const debtorsAggregates = await db.order.groupBy({
		by: ['customerId'],
		where: {
			status: 'CREDIT'
		},
		_count: {
			id: true
		},
		_sum: {
			total: true
		}
	});

	// 2. ดึงข้อมูลลูกค้าที่มีหนี้ค้าง
	// filter(Boolean) as number[] เป็น trick ในการกรองค่า null/undefined ออกไป
	const customerIds = debtorsAggregates.map((d) => d.customerId).filter(Boolean) as number[];
	
	const customers = await db.customer.findMany({
		where: {
			id: {
				in: customerIds
			}
		}
	});

	// 3. นำข้อมูล 2 ส่วนมารวมกัน และแปลงค่า Decimal เป็น Number
	const debtors = customers.map((customer) => {
		const aggregate = debtorsAggregates.find((agg) => agg.customerId === customer.id);
		
		return {
			...customer,
			// [แก้ไข] แปลงค่า Decimal ที่อาจมีใน customer object ด้วย
			creditLimit: customer.creditLimit ? customer.creditLimit.toNumber() : null,

			billCount: aggregate?._count.id || 0,
			
			// [แก้ไขจุดสำคัญ] แปลงค่า total ที่ได้จากการ _sum ให้เป็น Number
			totalDebt: aggregate?._sum.total ? aggregate._sum.total.toNumber() : 0
		};
	});

	// 4. ส่งข้อมูลที่แปลงค่าแล้วออกไป
	return { debtors };
};