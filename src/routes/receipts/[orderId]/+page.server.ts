// src/routes/receipts/[orderId]/+page.server.ts (แก้ไขแล้ว)

import { db } from '$lib/server/db'; // [แก้ไข] เปลี่ยนมา import `db` จากไฟล์ที่ถูกต้อง
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const orderId = Number(params.orderId);
	if (isNaN(orderId)) {
		throw error(400, 'รหัสบิลไม่ถูกต้อง');
	}

	// 1. ดึงข้อมูล Order หลักพร้อมข้อมูลที่เกี่ยวข้อง (relations)
	const order = await db.order.findUnique({
		where: { id: orderId },
		include: {
			customer: true,
			items: {
				include: {
					product: true
				}
			}
		}
	});

	// [ปรับปรุง] ถ้าหา order ไม่เจอ ให้ return ค่า null กลับไป
	if (!order) {
		return { receiptData: { order: null, shopInfo: null } };
	}

	// 2. แปลงข้อมูลประเภท Decimal ให้เป็น Number เพื่อให้ส่งไป Client ได้
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
			total: item.price.toNumber() * item.quantity - item.discount.toNumber(),
			product: {
				...item.product,
				costPrice: item.product.costPrice.toNumber(),
				retailPrice: item.product.retailPrice.toNumber(),
				wholesalePrice: item.product.wholesalePrice?.toNumber() ?? null
			}
		}))
	};

	// 3. กำหนดข้อมูลร้านค้า (ในอนาคตอาจดึงมาจากฐานข้อมูลหรือ config)
	const shopInfo = {
		storeName: 'PjPOS Store',
		address: '123/45 ต.ในเมือง อ.เมือง จ.กรุงเทพ 10200',
		phone: '081-234-5678',
		taxId: '1234567890123',
		receiptNote: 'ขอบคุณที่ใช้บริการ',
		receiptLogoUrl: null
	};

	return {
		receiptData: {
			order: serializableOrder,
			shopInfo: shopInfo
		}
	};
};

