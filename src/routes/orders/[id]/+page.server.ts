// Path: src/routes/orders/[id]/+page.server.ts (ฉบับสมบูรณ์)

import { db } from '$lib/server/db';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_SHIPPING_CHAT_ID } from '$env/dynamic/private';

// ฟังก์ชัน load (เหมือนเดิม แต่เปลี่ยนไปใช้ db instance กลาง)
export const load: PageServerLoad = async ({ params }) => {
	const orderId = parseInt(params.id);

	if (isNaN(orderId)) {
		throw error(400, 'ID ของบิลไม่ถูกต้อง');
	}

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

	if (!order) {
		throw error(404, 'ไม่พบข้อมูลบิลนี้');
	}

	return { order };
};

// [เพิ่มใหม่] ฟังก์ชันสำหรับจัดการ Form Actions
export const actions: Actions = {
	// Action ชื่อ 'notifyShipping'
	notifyShipping: async ({ request }) => {
		const data = await request.formData();
		const orderId = data.get('id');

		if (!orderId || typeof orderId !== 'string') {
			return fail(400, { message: 'ID ของบิลไม่ถูกต้อง' });
		}

		// ดึงข้อมูลบิลอีกครั้งเพื่อให้แน่ใจว่าข้อมูลเป็นปัจจุบันที่สุด
		const order = await db.order.findUnique({
			where: { id: Number(orderId) },
			include: {
				customer: true,
				items: { include: { product: true } }
			}
		});

		if (!order) {
			return fail(404, { message: 'ไม่พบบิลที่ต้องการแจ้งเตือน' });
		}

		// --- VVVVVV แก้ไขรูปแบบข้อความของคุณได้ที่นี่ VVVVVV ---
		let message = `🚚 **[แจ้งเตือนส่งของ]** 🚚\n\n`;
		message += `**เลขที่บิล:** ${order.orderNumber}\n`;
		message += `**ลูกค้า:** ${order.customer?.name || 'ลูกค้าทั่วไป'}\n`;
		message += `**เบอร์โทร:** ${order.customer?.phone || '-'}\n`;
		message += `**ที่อยู่:** ${order.customer?.address || 'ไม่มีข้อมูล'}\n\n`;
		message += `**รายการสินค้า:**\n`;
		order.items.forEach((item, index) => {
			message += `${index + 1}. ${item.product.name} (x${item.quantity})\n`;
		});
		message += `\n**ยอดรวม:** ${order.total.toFixed(2)} บาท`;
		// --- ^^^^^^ สิ้นสุดส่วนแก้ไขข้อความ ^^^^^^ ---

		try {
			// ตรวจสอบว่ามีค่า ID ห้องแชทหรือไม่
			if (!TELEGRAM_SHIPPING_CHAT_ID) {
				console.error('TELEGRAM_SHIPPING_CHAT_ID is not defined in .env file');
				return fail(500, { message: 'ไม่ได้ตั้งค่าห้องแชทสำหรับแจ้งเตือน' });
			}

			// เรียกใช้ฟังก์ชันส่งข้อความ
			await sendTelegramMessage(message, TELEGRAM_SHIPPING_CHAT_ID, TELEGRAM_BOT_TOKEN);

			return { success: true, message: 'แจ้งเตือนการจัดส่งสำเร็จ!' };

		} catch (err) {
			console.error('Failed to send Telegram message:', err);
			return fail(500, { message: 'เกิดข้อผิดพลาดในการส่งข้อความแจ้งเตือน' });
		}
	}
};


// [เพิ่มใหม่] ฟังก์ชันช่วยส่งข้อความไปที่ Telegram
async function sendTelegramMessage(text: string, chatId: string, botToken: string) {
	const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
	const payload = {
		chat_id: chatId,
		text: text,
		parse_mode: 'Markdown' // ใช้ Markdown เพื่อให้ตัวหนา (**) ทำงานได้
	};

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(`Telegram API error: ${errorData.description}`);
	}

	return response.json();
}