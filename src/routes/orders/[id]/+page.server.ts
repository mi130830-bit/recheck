// Path: src/routes/orders/[id]/+page.server.ts (Final Corrected Version)

import { db } from '$lib/server/db';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// [เพิ่ม] ดึงค่าจาก .env เข้ามาใช้งาน (ถ้ายังไม่มี)
import { TELEGRAM_BOT_TOKEN, TELEGRAM_SHIPPING_CHAT_ID } from '$env/dynamic/private';

// ===================== [จุดแก้ไขที่ 1: load function] =====================
export const load: PageServerLoad = async ({ params }) => {
	const orderId = parseInt(params.id);

	if (isNaN(orderId)) {
		throw error(400, 'ID ของบิลไม่ถูกต้อง');
	}

	const orderFromDb = await db.order.findUnique({
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

	if (!orderFromDb) {
		throw error(404, 'ไม่พบข้อมูลบิลนี้');
	}

	// แปลงค่า Decimal ทั้งหมดก่อนส่งไปที่หน้าเว็บ
	const order = {
		...orderFromDb,
		total: orderFromDb.total.toNumber(),
		received: orderFromDb.received ? orderFromDb.received.toNumber() : null,
		change: orderFromDb.change ? orderFromDb.change.toNumber() : null,
		items: orderFromDb.items.map(item => ({
			...item,
			price: item.price.toNumber(),
			discount: item.discount.toNumber(),
			product: { // แปลงค่าใน product ด้วยเพื่อความสมบูรณ์
                ...item.product,
                costPrice: item.product.costPrice.toNumber(),
                retailPrice: item.product.retailPrice.toNumber(),
                wholesalePrice: item.product.wholesalePrice ? item.product.wholesalePrice.toNumber() : null,
            }
		}))
	};

	return { order };
};


// ===================== [จุดแก้ไขที่ 2: actions function] =====================
export const actions: Actions = {
	notifyShipping: async ({ request }) => {
		const data = await request.formData();
		const orderId = data.get('id');

		if (!orderId || typeof orderId !== 'string') {
			return fail(400, { message: 'ID ของบิลไม่ถูกต้อง' });
		}

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
        
		let message = `🚚 **[แจ้งเตือนส่งของ]** 🚚\n\n`;
		message += `**เลขที่บิล:** ${order.orderNumber}\n`;
		// [แก้ไข] แก้ไข customer name field ให้ถูกต้อง
		message += `**ลูกค้า:** ${order.customer?.firstName || 'ลูกค้าทั่วไป'}\n`;
		message += `**เบอร์โทร:** ${order.customer?.phone || '-'}\n`;
		message += `**ที่อยู่:** ${order.customer?.address || 'ไม่มีข้อมูล'}\n\n`;
		message += `**รายการสินค้า:**\n`;
		order.items.forEach((item, index) => {
			message += `${index + 1}. ${item.product.name} (x${item.quantity})\n`;
		});
		// [แก้ไขจุดสำคัญ] แปลง order.total เป็น Number ก่อนใช้ .toFixed()
		message += `\n**ยอดรวม:** ${order.total.toNumber().toFixed(2)} บาท`;

		try {
			if (!TELEGRAM_SHIPPING_CHAT_ID) {
				console.error('TELEGRAM_SHIPPING_CHAT_ID is not defined in .env file');
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


// ฟังก์ชันนี้ถูกต้องอยู่แล้ว ไม่ต้องแก้ไข
async function sendTelegramMessage(text: string, chatId: string, botToken: string) {
	const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
	const payload = {
		chat_id: chatId,
		text: text,
		parse_mode: 'Markdown'
	};

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