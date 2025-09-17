// src/routes/delivery-note/[id]/+page.server.ts (สร้างขึ้นใหม่)

import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const orderId = Number(params.id);
	if (isNaN(orderId)) {
		throw error(400, 'รหัสบิลไม่ถูกต้อง');
	}

	// 1. ดึงข้อมูล Order หลักพร้อมข้อมูลที่เกี่ยวข้อง
	const order = await db.order.findUnique({
		where: { id: orderId },
		include: {
			customer: true,
			items: {
				include: {
					product: {
						include: {
							unit: true // ดึงข้อมูลหน่วยนับมาด้วย
						}
					}
				}
			}
		}
	});

	// ถ้าหา order ไม่เจอ ให้ return ค่า null กลับไป
	if (!order) {
		return { deliveryData: { order: null, shopInfo: null } };
	}

	// 2. [สำคัญ] แปลงค่า Decimal ทั้งหมดให้เป็น Number
	const serializableOrder = {
		...order,
		total: order.total.toNumber(),
		received: order.received?.toNumber() ?? null,
		change: order.change?.toNumber() ?? null,
		customer: order.customer
			? {
					...order.customer,
					creditLimit: order.customer.creditLimit?.toNumber() ?? null
				}
			: null,
		items: order.items.map((item) => ({
			...item,
			price: item.price.toNumber(),
			discount: item.discount.toNumber(),
			product: {
				...item.product,
				costPrice: item.product.costPrice.toNumber(),
				retailPrice: item.product.retailPrice.toNumber(),
				wholesalePrice: item.product.wholesalePrice?.toNumber() ?? null
			}
		}))
	};

	// 3. กำหนดข้อมูลร้านค้า (ในอนาคตอาจดึงมาจากฐานข้อมูล)
	const shopInfo = {
		name: 'PjPOS Store',
		address: '123/45 ต.ในเมือง อ.เมือง จ.กรุงเทพ 10200',
		phone: '081-234-5678',
		taxId: '1234567890123'
	};

	return {
		deliveryData: {
			order: serializableOrder,
			shopInfo: shopInfo
		}
	};
};

