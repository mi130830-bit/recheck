// Path: src/routes/api/orders/hold/+server.ts (ฉบับแก้ไขที่สมบูรณ์)

import { db } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
// ตรวจสอบให้แน่ใจว่า path ไปยัง orderUtils ถูกต้อง
import { generateOrderNumber, validateAndCalculateCart } from '$lib/server/orderUtils'; 

// =============================================================
//  ฟังก์ชัน GET สำหรับดึงรายการบิลที่พักไว้ (นี่คือส่วนที่ต้องแก้ไข)
// =============================================================
export const GET: RequestHandler = async () => {
	try {
		const heldOrders = await db.order.findMany({
			where: { status: 'HELD' },
			include: {
				customer: true, // ดึงข้อมูลลูกค้าที่ผูกกับบิล
				items: {      // ดึงรายการสินค้าทั้งหมดในบิล
					include: {
						product: true // และดึงข้อมูลสินค้าของแต่ละรายการ
					}
				}
			},
			orderBy: {
				createdAt: 'desc' // เรียงจากบิลล่าสุดไปเก่าสุด
			}
		});
		
		// [สำคัญ] ส่งข้อมูลกลับไปเป็น Response object ด้วย json()
		return json(heldOrders);

	} catch (err) {
		console.error('Error fetching held orders:', err);
		// [สำคัญ] หากเกิดข้อผิดพลาด ให้ throw error() ซึ่งจะสร้าง Response ที่มีสถานะ 500
		throw error(500, 'ไม่สามารถดึงข้อมูลบิลที่พักไว้ได้');
	}
};


// =============================================================
//  ฟังก์ชัน POST สำหรับการพักบิล (โค้ดส่วนนี้ของคุณดีอยู่แล้ว)
// =============================================================
export const POST: RequestHandler = async ({ request }) => {
	const { cart, customerId } = await request.json();

	try {
		const heldOrder = await db.$transaction(async (tx) => {
			const { grandTotal, validatedCartItems } = await validateAndCalculateCart(cart, tx);
			const orderNumber = await generateOrderNumber('HELD', tx);

			const order = await tx.order.create({
				data: {
					orderNumber,
					total: grandTotal,
					status: 'HELD',
					customerId: customerId
				}
			});

			const orderItemsData = validatedCartItems.map((item) => ({
				orderId: order.id,
				productId: item.id,
				quantity: item.quantity,
				price: item.price,
				discount: item.discount
			}));

			await tx.orderItem.createMany({
				data: orderItemsData
			});
			
			return order;
		});

		return json(heldOrder, { status: 201 });

	} catch (err: any) {
		console.error('Hold Bill API error:', err);
		throw error(400, err.message || 'เกิดข้อผิดพลาดในการพักบิล');
	}
};