// Path: src/routes/orders/[id]/+page.server.ts (Final Corrected Version)

import { db } from '$lib/server/db';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_SHIPPING_CHAT_ID } from '$env/dynamic/private';

// ===================== LOAD FUNCTION (แก้ไขส่วนแปลงข้อมูล) =====================
export const load: PageServerLoad = async ({ params }) => {
	const orderId = parseInt(params.id);
	if (isNaN(orderId)) {
		throw error(400, 'ID ของบิลไม่ถูกต้อง');
	}

	const orderFromDb = await db.order.findUnique({
		where: { id: orderId },
		include: {
			customer: true,
			items: { include: { product: true } }
		}
	});

	if (!orderFromDb) {
		throw error(404, 'ไม่พบข้อมูลบิลนี้');
	}

	// [จุดแก้ไขสำคัญ] แปลงข้อมูล Decimal ทั้งหมด รวมถึงที่ซ้อนอยู่ใน customer
	const serializableCustomer = orderFromDb.customer
		? {
				...orderFromDb.customer,
				creditLimit: orderFromDb.customer.creditLimit ? orderFromDb.customer.creditLimit.toNumber() : null
		  }
		: null;

	const order = {
		...orderFromDb,
		total: orderFromDb.total.toNumber(),
		received: orderFromDb.received ? orderFromDb.received.toNumber() : null,
		change: orderFromDb.change ? orderFromDb.change.toNumber() : null,
		customer: serializableCustomer, // ใช้ข้อมูล customer ที่แปลงค่าแล้ว
		items: orderFromDb.items.map(item => ({
			...item,
			price: item.price.toNumber(),
			discount: item.discount.toNumber(),
			product: {
                ...item.product,
                costPrice: item.product.costPrice.toNumber(),
                retailPrice: item.product.retailPrice.toNumber(),
                wholesalePrice: item.product.wholesalePrice ? item.product.wholesalePrice.toNumber() : null,
            }
		}))
	};

	return { order };
};

// ===================== ACTIONS (เหมือนเดิมทุกประการ) =====================
export const actions: Actions = {
	notifyShipping: async ({ request }) => {
		const data = await request.formData();
		const orderId = data.get('id');
		if (!orderId || typeof orderId !== 'string') {
			return fail(400, { message: 'ID ของบิลไม่ถูกต้อง' });
		}
		const order = await db.order.findUnique({
			where: { id: Number(orderId) },
			include: { customer: true, items: { include: { product: true } } }
		});
		if (!order) return fail(404, { message: 'ไม่พบบิลที่ต้องการแจ้งเตือน' });
        
		let message = `🚚 **[แจ้งเตือนส่งของ]** 🚚\n\n`;
		message += `**เลขที่บิล:** ${order.orderNumber}\n`;
		message += `**ลูกค้า:** ${order.customer?.firstName || 'ลูกค้าทั่วไป'}\n`;
		message += `**เบอร์โทร:** ${order.customer?.phone || '-'}\n`;
		message += `**ที่อยู่:** ${order.customer?.address || 'ไม่มีข้อมูล'}\n\n`;
		message += `**รายการสินค้า:**\n`;
		order.items.forEach((item, index) => {
			message += `${index + 1}. ${item.product.name} (x${item.quantity})\n`;
		});
		message += `\n**ยอดรวม:** ${order.total.toNumber().toFixed(2)} บาท`;

		try {
			if (!TELEGRAM_SHIPPING_CHAT_ID) {
				console.error('TELEGRAM_SHIPPING_CHAT_ID is not defined');
				return fail(500, { message: 'ไม่ได้ตั้งค่าห้องแชทสำหรับแจ้งเตือน' });
			}
			await sendTelegramMessage(message, TELEGRAM_SHIPPING_CHAT_ID, TELEGRAM_BOT_TOKEN);
			return { success: true, message: 'แจ้งเตือนการจัดส่งสำเร็จ!' };
		} catch (err) {
			console.error('Failed to send Telegram message:', err);
			return fail(500, { message: 'เกิดข้อผิดพลาดในการส่งข้อความแจ้งเตือน' });
		}
	}
};

async function sendTelegramMessage(text: string, chatId: string, botToken: string) {
	const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
	const payload = { chat_id: chatId, text: text, parse_mode: 'Markdown' };
	const response = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(`Telegram API error: ${errorData.description}`);
	}
	return response.json();
}