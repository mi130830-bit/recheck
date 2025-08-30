// Path: src/routes/reports/debtors/+page.server.ts (Final Corrected Logic)

import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// 1. ค้นหา "ลูกค้า" ทั้งหมดที่มี "อย่างน้อย 1 ออเดอร์" ที่มีสถานะเป็น 'CREDIT'
	const customersWithDebt = await db.customer.findMany({
		where: {
			orders: {
				some: { // 'some' หมายถึง "มีอย่างน้อย 1 รายการที่ตรงเงื่อนไข"
					status: 'CREDIT'
				}
			}
		},
		include: {
			// 2. ดึงข้อมูล "เฉพาะ" ออเดอร์ที่เป็น 'CREDIT' ของลูกค้าแต่ละคนมาด้วย
			_count: {
				select: {
					orders: {
						where: { status: 'CREDIT' }
					}
				}
			},
			orders: {
				where: {
					status: 'CREDIT'
				},
				select: {
					total: true
				}
			}
		}
	});

	// 3. จัดรูปแบบข้อมูลให้พร้อมใช้งาน และแปลงค่า Decimal
	const debtors = customersWithDebt.map(customer => {
		// คำนวณยอดหนี้รวมจากบิล 'CREDIT' ทั้งหมดของลูกค้าคนนี้
		const totalDebt = customer.orders.reduce((sum, order) => {
			return sum + order.total.toNumber();
		}, 0);

		return {
			customerId: customer.id,
			memberCode: customer.memberCode,
			name: `${customer.firstName} ${customer.lastName || ''}`.trim(), 
			phone: customer.phone || '-',
			// ใช้ _count ที่เราดึงมาเพื่อนับจำนวนบิล
			billCount: customer._count.orders, 
			totalDebt: totalDebt
		};
	});

	return { debtors };
};