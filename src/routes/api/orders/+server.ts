// Path: src/routes/api/orders/+server.ts (Final Corrected Version)

import { db } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import { sendTelegramMessage, ChatId } from '$lib/server/telegram';
import { generateOrderNumber } from '$lib/server/orderUtils';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { cart, customerId, paymentType, received, change } = await request.json();

	if (!cart || cart.length === 0) {
		return json({ message: 'ข้อมูลไม่ถูกต้อง: ตะกร้าว่างเปล่า' }, { status: 400 });
	}

	try {
		const orderNumber = await generateOrderNumber();

		const total = cart.reduce((sum: number, item: any) => {
			const price = Number(item.retailPrice);
			const discount = Number(item.discount) || 0;
			const quantity = Number(item.quantity);
			if (isNaN(price) || isNaN(discount) || isNaN(quantity)) {
				throw new Error('ข้อมูลสินค้าผิดประเภท');
			}
			const itemTotal = quantity * price;
			const itemDiscount = quantity * discount;
			return sum + (itemTotal - itemDiscount);
		}, 0);

		if (total < 0) {
			return json({ message: 'ยอดรวม total ต้องไม่ติดลบ' }, { status: 400 });
		}

		const newOrder = await db.$transaction(async (tx) => {
			const order = await tx.order.create({
				data: {
					orderNumber,
					total,
					customerId: customerId || null,
					status: paymentType === 'CREDIT' ? 'CREDIT' : 'COMPLETED',
					received,
					change
				},
				include: { customer: true }
			});

			for (const item of cart) {
				const price = Number(item.retailPrice);
				const discount = Number(item.discount) || 0;
				const quantity = Number(item.quantity);

				await tx.orderItem.create({
					data: {
						orderId: order.id,
						productId: item.id,
						quantity,
						price,
						discount
					}
				});

				await tx.product.update({
					where: { id: item.id },
					data: { stockQuantity: { decrement: quantity } }
				});
			}

			return order;
		});

		// [แก้ไขจุดสุดท้าย] ใช้ newOrder.customer แทน newOrder.customerId
		if (newOrder.status === 'CREDIT' && newOrder.customer) {
			const customerName = `${newOrder.customer.firstName} ${newOrder.customer.lastName || ''}`.trim();
			const message = `🚨 *บิลขายเชื่อใหม่*\nเลขที่บิล: \`${newOrder.orderNumber}\`\nลูกค้า: ${customerName}\nยอดรวม: *${newOrder.total.toFixed(2)}* บาท`;
			sendTelegramMessage(message, ChatId.SALES);
		}

		return json(newOrder, { status: 201 });
	} catch (err: any) {
		console.error('Error creating order:', err);
		throw error(500, err.message || 'ไม่สามารถบันทึกการขายได้');
	}
};