// Path: src/routes/api/orders/+server.ts (Final Refactored Version)

import { db } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import { sendTelegramMessage, ChatId } from '$lib/server/telegram';
import { generateOrderNumber, validateAndCalculateCart, checkStockAvailability } from '$lib/server/orderUtils';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { cart, customerId, paymentType, received, change, heldBillIdToDelete } = await request.json();

	if (!cart || cart.length === 0) {
		return json({ message: 'ข้อมูลไม่ถูกต้อง: ตะกร้าว่างเปล่า' }, { status: 400 });
	}

	try {
		const newOrder = await db.$transaction(async (tx) => {
			
			// --- 1. ตรวจสอบข้อมูลและความถูกต้อง ---
			await checkStockAvailability(cart, tx);
			const { grandTotal } = await validateAndCalculateCart(cart, tx);
			
			// --- 2. ลบบิลที่พักไว้ (ถ้ามี) ---
			if (heldBillIdToDelete) {
				await tx.orderItem.deleteMany({ where: { orderId: heldBillIdToDelete }});
				await tx.order.delete({ where: { id: heldBillIdToDelete } });
			}
			
			// --- 3. สร้างเลขที่บิลใหม่ (ปลอดภัยจาก Race Condition) ---
			const orderNumber = await generateOrderNumber('', tx);

			// --- 4. สร้าง Order หลัก ---
			const order = await tx.order.create({
				data: {
					orderNumber,
					total: grandTotal, // ใช้ยอดรวมที่คำนวณจาก server
					...(customerId && { customer: { connect: { id: customerId } } }),
					status: paymentType === 'CREDIT' ? 'CREDIT' : 'COMPLETED',
					received,
					change
				},
				include: { customer: true }
			});

			// --- 5. สร้าง Order Items และตัดสต็อก ---
			for (const item of cart) {
				await tx.orderItem.create({
					data: {
						orderId: order.id,
						productId: item.id,
						quantity: item.quantity,
						price: item.retailPrice, // ใช้ราคาจาก client (หรือจะดึงจาก DB ก็ได้)
						discount: item.discount || 0
					}
				});

				await tx.product.update({
					where: { id: item.id },
					data: { stockQuantity: { decrement: item.quantity } }
				});
			}

			// return ข้อมูล order ที่สมบูรณ์กลับไป
			return order;
		});

		// --- 6. ส่งข้อมูลกลับและแจ้งเตือน ---
		const serializableOrder = {
			...newOrder,
			total: newOrder.total.toString(),
			received: newOrder.received ? newOrder.received.toString() : null,
			change: newOrder.change ? newOrder.change.toString() : null,
		};
		
		if (newOrder.status === 'CREDIT' && newOrder.customer) {
			const customerName = `${newOrder.customer.firstName} ${newOrder.customer.lastName || ''}`.trim();
			const message = `🚨 *บิลขายเชื่อใหม่*\nเลขที่บิล: \`${newOrder.orderNumber}\`\nลูกค้า: ${customerName}\nยอดรวม: *${newOrder.total.toNumber().toFixed(2)}* บาท`;
			sendTelegramMessage(message, ChatId.SALES);
		}

		return json(serializableOrder, { status: 201 });

	} catch (err: any) {
		console.error('Error creating order:', err);
		if (err.code === 'P2002') { // จัดการ Unique constraint error
			return json({ message: 'เกิดข้อผิดพลาด: เลขที่บิลซ้ำกัน กรุณาลองใหม่อีกครั้ง' }, { status: 409 });
		}
		throw error(500, err.message || 'ไม่สามารถบันทึกการขายได้');
	}
};