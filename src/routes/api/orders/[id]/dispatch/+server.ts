// Path: src/routes/api/orders/[id]/dispatch/+server.ts (ฉบับแก้ไขที่ถูกต้อง 100%)

import { db } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendTelegramMessage, ChatId } from '$lib/server/telegram';

export const POST: RequestHandler = async ({ params }) => {
	const orderId = parseInt(params.id);
	if (isNaN(orderId)) {
		throw error(400, 'ID ของบิลไม่ถูกต้อง');
	}

	try {
		const order = await db.order.findUnique({
			where: { id: orderId },
			include: {
				customer: true,
				items: { include: { product: true } }
			}
		});

		if (!order) {
			throw error(404, 'ไม่พบข้อมูลบิล');
		}

		const customerName = order.customer ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim() : 'ลูกค้าทั่วไป';
		
		let message = `🚚 **เตรียมจัดส่งสินค้า** 🚚\n\n`;
		message += `**ลูกค้า:** ${customerName}\n`;
		message += `**เบอร์โทร:** ${order.customer?.phone || '-'}\n`;
        
		message += `**ที่อยู่จัดส่ง:**\n${order.customer?.shippingAddress || order.customer?.address || 'ไม่มีข้อมูลที่อยู่'}\n\n`;

		message += `--- **รายการที่ต้องไปส่ง** ---\n`;
		order.items.forEach((item, index) => {
			message += `${index + 1}. ${item.product.name} (จำนวน: ${item.quantity} ${item.product.unit || 'ชิ้น'})\n`;
		});
		message += `----------------------------\n\n`;
		message += `*กรุณาตรวจสอบสินค้าให้ครบถ้วน*`;

		await sendTelegramMessage(message, ChatId.SHIPPING);

		return json({ success: true, message: 'แจ้งเตือนการจัดส่งเรียบร้อย' });

	} catch (err: any) {
		console.error('Dispatch API Error:', err);
		throw error(err.status || 500, err.body?.message || 'เกิดข้อผิดพลาดในการแจ้งเตือน');
	}
};