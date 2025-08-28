// Path: src/routes/api/+server.ts (ฉบับแก้ไขการแสดงชื่อลูกค้า)

import { db } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendTelegramMessage } from '$lib/server/telegram';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_SALES_CHAT_ID } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
	const { cart, total, customerId, paymentType } = await request.json();
	
	if (paymentType === 'CREDIT' && !customerId) {
		throw error(400, 'การขายเชื่อจำเป็นต้องเลือกข้อมูลลูกค้า');
	}
	
	if (!cart || cart.length === 0) {
		throw error(400, 'ไม่มีสินค้าในตะกร้า');
	}
	
	try {
		const newOrder = await db.$transaction(async (tx) => {
			const order = await tx.order.create({
				data: {
					orderNumber: `INV-${Date.now()}`,
					total: total,
					status: paymentType === 'CREDIT' ? 'CREDIT' : 'COMPLETED',
					customerId: customerId
				}
			});
			
			const orderItemsData = cart.map((item: any) => ({
				orderId: order.id,
				productId: item.id,
				quantity: item.quantity,
				price: item.retailPrice,
				discount: item.discount
			}));
			
			await tx.orderItem.createMany({ data: orderItemsData });
			
			for (const item of cart) {
				await tx.product.update({
					where: { id: item.id },
					data: { stockQuantity: { decrement: item.quantity } }
				});
			}
			return order;
		});
		
		if (newOrder.status === 'CREDIT' && TELEGRAM_SALES_CHAT_ID && newOrder.customerId) {
			const customer = await db.customer.findUnique({ where: { id: newOrder.customerId } });
			
			// [แก้ไข] สร้างตัวแปร customerName เพื่อรวมชื่อ-นามสกุล
			const customerName = customer ? `${customer.firstName} ${customer.lastName || ''}`.trim() : 'ไม่พบชื่อลูกค้า';

			let message = `💰 **[ขายเชื่อ]** 💰\n\n`;
			message += `**ลูกค้า:** ${customerName}\n`; // ใช้ตัวแปรใหม่
			message += `**ยอดรวม:** ${newOrder.total.toFixed(2)} บาท\n`;
			message += `**เลขที่บิล:** ${newOrder.orderNumber}`;
			
			await sendTelegramMessage(message, TELEGRAM_SALES_CHAT_ID);
		}
		
		return json(newOrder, { status: 201 });

	} catch (err: any) {
		console.error('Checkout API error:', err);
		if (err.code) {
			const errorMessage = err.meta?.cause || err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
			throw error(500, `Database Error: ${errorMessage}`);
		}
		throw error(err.status || 500, err.body?.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
	}
};