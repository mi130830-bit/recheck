// src/routes/orders/[id]/+page.server.ts

import { db } from '$lib/server/db';
// [แก้ไข] เพิ่ม fail เข้าไปใน import นี้
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { sendTelegramMessage, ChatId } from '$lib/server/telegram';

// --- `load` function: ดึงข้อมูลบิลมาแสดง ---
export const load: PageServerLoad = async ({ params }) => {
	const orderId = Number(params.id);
	if (isNaN(orderId)) {
		// `error` ถูก import มาแล้วและใช้งานได้ถูกต้อง
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
		throw error(404, 'ไม่พบข้อมูลบิล');
	}

	// แปลงค่า Decimal ทั้งหมดให้เป็น Number ก่อนส่งไปที่ Client
	const order = {
		...orderFromDb,
		total: orderFromDb.total.toNumber(),
		received: orderFromDb.received?.toNumber() ?? null,
		change: orderFromDb.change?.toNumber() ?? null,
		customer: orderFromDb.customer
			? {
					...orderFromDb.customer,
					creditLimit: orderFromDb.customer.creditLimit?.toNumber() ?? null
				}
			: null,
		items: orderFromDb.items.map((item) => ({
			...item,
			price: item.price.toNumber(),
			discount: item.discount.toNumber(),
			product: {
				...item.product,
				costPrice: item.product.costPrice.toNumber(),
				retailPrice: item.product.retailPrice.toNumber(),
				wholesalePrice: item.product.wholesalePrice ? item.product.wholesalePrice.toNumber() : null
			}
		}))
	};

	return { order };
};

// --- `actions`: จัดการการกระทำต่างๆ จากฟอร์ม ---
export const actions: Actions = {
	cancel: async ({ request, params }) => {
		const orderId = Number(params.id);
		const formData = await request.formData();
		const shouldRestock = formData.get('shouldRestock') === 'true';

		try {
			const orderToCancel = await db.order.findUnique({
				where: { id: orderId },
				include: { items: true }
			});

			if (!orderToCancel) {
				return fail(404, { success: false, message: 'ไม่พบบิลที่ต้องการยกเลิก' });
			}
			if (orderToCancel.status === 'CANCELLED') {
				return fail(400, { success: false, message: 'บิลนี้ถูกยกเลิกไปแล้ว' });
			}

			if (shouldRestock) {
				await db.$transaction(async (tx) => {
					for (const item of orderToCancel.items) {
						await tx.product.update({
							where: { id: item.productId },
							data: { stockQuantity: { increment: item.quantity } }
						});
					}
					await tx.order.update({
						where: { id: orderId },
						data: { status: 'CANCELLED' }
					});
				});
			} else {
				await db.order.update({
					where: { id: orderId },
					data: { status: 'CANCELLED' }
				});
			}

			return { success: true, message: 'ยกเลิกบิลสำเร็จ' };
		} catch (err) {
			console.error('Cancel order error:', err);
			return fail(500, { success: false, message: 'เกิดข้อผิดพลาดในการยกเลิกบิล' });
		}
	},

	dispatch: async ({ params }) => {
		const orderId = Number(params.id);

		try {
			// 1. ดึงข้อมูลให้ครบถ้วนมากขึ้น โดยรวมรายการสินค้า (items) และข้อมูลสินค้า (product) เข้ามาด้วย
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
				return fail(404, { success: false, message: 'ไม่พบบิล' });
			}

			// 2. สร้างข้อความรูปแบบใหม่ที่มีรายละเอียดครบถ้วน
			let message = `🚚 **เตรียมจัดส่งสินค้า** 🚚\n\n`;

			if (order.customer) {
				message += `**ลูกค้า:** ${order.customer.firstName} ${order.customer.lastName || ''}\n`;
				if (order.customer.phone) {
					message += `**เบอร์โทร:** \`${order.customer.phone}\`\n`;
				}
				if (order.customer.address) {
					message += `**ที่อยู่จัดส่ง:**\n${order.customer.address}\n`;
				}
			} else {
				message += `**ลูกค้า:** ลูกค้าทั่วไป\n`;
			}

			// เพิ่มรายการสินค้า
			if (order.items.length > 0) {
				message += `\n--- รายการที่ต้องไปส่ง ---\n`;
				order.items.forEach((item, index) => {
					message += `${index + 1}. ${item.product.name} (จำนวน: ${item.quantity} ชิ้น)\n`;
				});
				message += `--------------------\n\n`;
			}
			
			// เพิ่มข้อความปิดท้าย
			message += `**กรุณาตรวจสอบสินค้าให้ครบถ้วน**`;


			// 3. ส่งแจ้งเตือน (ส่วนนี้เหมือนเดิม)
			await sendTelegramMessage(message, ChatId.SHIPPING);

			await db.order.update({
				where: { id: orderId },
				data: { status: 'SHIPPING' }
			});
			
			return { success: true, message: 'แจ้งเตือนการส่งของเรียบร้อยแล้ว' };

		} catch (err) {
			console.error('Dispatch order error:', err);
			return fail(500, { success: false, message: 'เกิดข้อผิดพลาดในการแจ้งเตือน' });
		}
	}
};