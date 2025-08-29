// Path: src/routes/api/orders/hold/+server.ts (Final Corrected Version)

import { db } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateOrderNumber } from '$lib/server/orderUtils';

// =============================================================
//  ฟังก์ชัน GET สำหรับดึงรายการบิลที่พักไว้
// =============================================================
export const GET: RequestHandler = async () => {
	try {
		const heldOrdersFromDb = await db.order.findMany({
			where: { status: 'HELD' },
			include: { customer: true, items: { include: { product: true } } },
			orderBy: { createdAt: 'desc' }
		});
		
		// [แก้ไข] แปลงค่า Decimal เป็น String ก่อนส่ง JSON (ดีที่สุดสำหรับ API)
		const heldOrders = heldOrdersFromDb.map(order => ({
			...order,
			total: order.total.toString(),
			items: order.items.map(item => ({
				...item,
				price: item.price.toString(),
				discount: item.discount.toString()
			}))
		}));
		
		return json(heldOrders);

	} catch (err) {
		console.error('Error fetching held orders:', err);
		throw error(500, 'ไม่สามารถดึงข้อมูลบิลที่พักไว้ได้');
	}
};

// =============================================================
//  ฟังก์ชัน POST สำหรับการพักบิล
// =============================================================
export const POST: RequestHandler = async ({ request }) => {
	const { cart, customerId } = await request.json();

	// [หมายเหตุ] ต้องแน่ใจว่า validateAndCalculateCart ไม่มีในโค้ดแล้ว
	// หากมี ให้แน่ใจว่า grandTotal เป็น Number
	const grandTotal = cart.reduce((sum: number, item: any) => sum + (Number(item.retailPrice) * Number(item.quantity)), 0);


	try {
		const heldOrderFromDb = await db.$transaction(async (tx) => {
			const orderNumber = await generateOrderNumber('HELD', tx);

			const order = await tx.order.create({
				data: {
					orderNumber,
					total: grandTotal,
					status: 'HELD',
					...(customerId && { customer: { connect: { id: customerId } } })
				},
				include: { items: true, customer: true } // ดึงข้อมูลกลับมาด้วย
			});

			const orderItemsData = cart.map((item: any) => ({
				orderId: order.id,
				productId: item.id,
				quantity: item.quantity,
				price: item.retailPrice, // Prisma จะแปลง Number เป็น Decimal ให้
				discount: item.discount || 0
			}));

			await tx.orderItem.createMany({ data: orderItemsData });
			
			// ต้องดึงข้อมูล order อีกครั้งหลังสร้าง items เพื่อให้ข้อมูลครบ
			return await tx.order.findUnique({
				where: { id: order.id },
				include: { items: true, customer: true }
			});
		});

		if (!heldOrderFromDb) {
			throw new Error('Failed to create held order');
		}

		// [แก้ไข] แปลงค่า Decimal เป็น String ก่อนส่งกลับ
		const heldOrder = {
			...heldOrderFromDb,
			total: heldOrderFromDb.total.toString(),
			items: heldOrderFromDb.items.map(item => ({
				...item,
				price: item.price.toString(),
				discount: item.discount.toString()
			}))
		}

		return json(heldOrder, { status: 201 });

	} catch (err: any) {
		console.error('Hold Bill API error:', err);
		throw error(400, err.message || 'เกิดข้อผิดพลาดในการพักบิล');
	}
};