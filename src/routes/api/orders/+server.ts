// Path: src/routes/api/orders/+server.ts (ฉบับสมบูรณ์)

import { db } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import { sendTelegramMessage, ChatId } from '$lib/server/telegram';
import {
	generateOrderNumber,
	validateAndCalculateCart,
	checkStockAvailability
} from '$lib/server/orderUtils';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	// [เพิ่ม] รับ notifyDispatch จาก request
	const { cart, customerId, paymentType, received, change, heldBillIdToDelete, notifyDispatch } =
		await request.json();

	if (!cart || cart.length === 0) {
		return json({ message: 'ข้อมูลไม่ถูกต้อง: ตะกร้าว่างเปล่า' }, { status: 400 });
	}

	try {
		const newOrder = await db.$transaction(async (tx) => {
			// --- 1. ตรวจสอบข้อมูลและความถูกต้อง ---
			await checkStockAvailability(cart, tx);
			const { grandTotal, validatedCart } = await validateAndCalculateCart(cart, tx);

			// --- 1.5 ตรวจสอบวงเงินเครดิต (Credit Limit) ---
			if (paymentType === 'CREDIT') {
				if (!customerId) {
					throw new Error('ไม่สามารถขายเชื่อได้หากไม่มีการเลือกลูกค้า');
				}
				const customer = await tx.customer.findUnique({ where: { id: customerId } });
				if (!customer || customer.creditLimit === null) {
					throw new Error(`ลูกค้าคนนี้ไม่ได้รับอนุญาตให้ซื้อเชื่อ หรือไม่ได้ตั้งวงเงินเครดิต`);
				}
				const existingDebtResult = await tx.order.aggregate({
					_sum: { total: true },
					where: { customerId: customerId, status: 'CREDIT' }
				});
				const existingDebt = existingDebtResult._sum.total?.toNumber() || 0;
				if (existingDebt + grandTotal > customer.creditLimit.toNumber()) {
					throw new Error(
						`วงเงินเครดิตไม่เพียงพอ! วงเงิน: ${customer.creditLimit.toFixed(2)}, หนี้คงค้าง: ${existingDebt.toFixed(2)}, ยอดซื้อใหม่: ${grandTotal.toFixed(2)}`
					);
				}
			}

			// --- 2. ลบบิลที่พักไว้ (ถ้ามี) ---
			if (heldBillIdToDelete) {
				await tx.orderItem.deleteMany({ where: { orderId: heldBillIdToDelete } });
				await tx.order.delete({ where: { id: heldBillIdToDelete } });
			}

			// --- 3. สร้างเลขที่บิลใหม่ ---
			const orderNumber = await generateOrderNumber('', tx);

			// --- 4. สร้าง Order หลัก ---
			// [แก้ไข] กำหนด status ตามเงื่อนไข ว่ามีการแจ้งส่งหรือไม่
			const orderStatus = notifyDispatch ? 'SHIPPING' : (paymentType === 'CREDIT' ? 'CREDIT' : 'COMPLETED');
			const order = await tx.order.create({
				data: {
					orderNumber,
					total: grandTotal,
					...(customerId && { customer: { connect: { id: customerId } } }),
					status: orderStatus,
					received,
					change
				},
				// [เพิ่ม] include items และ product เพื่อใช้ตอนแจ้งเตือน
				include: {
                    customer: true,
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
			});

			// --- 5. สร้าง Order Items, ตัดสต็อก, และบันทึกประวัติ ---
			for (const item of validatedCart) {
				await tx.orderItem.create({
					data: {
						orderId: order.id,
						productId: item.id,
						quantity: item.quantity,
						price: item.retailPrice,
						discount: item.discount || 0
					}
				});
				const updatedProduct = await tx.product.update({
					where: { id: item.id },
					data: { stockQuantity: { decrement: item.quantity } }
				});
				await tx.stockLedger.create({
					data: {
						productId: item.id,
						type: 'SALE_OUT',
						quantityChange: -item.quantity,
						newStockQuantity: updatedProduct.stockQuantity,
						priceAtTime: item.retailPrice,
						costAtTime: item.costPrice,
						notes: `ขายในบิลเลขที่ ${order.orderNumber}`,
						orderId: order.id
					}
				});
			}

			return order;
		});

		// --- 6. [เพิ่ม] Logic การแจ้งเตือนถ้ามีการส่ง notifyDispatch: true มา ---
		if (notifyDispatch) {
			let message = `🚚 **เตรียมจัดส่งสินค้า** 🚚\n\n`;
			if (newOrder.customer) {
				message += `**ลูกค้า:** ${newOrder.customer.firstName} ${newOrder.customer.lastName || ''}\n`;
				if (newOrder.customer.phone) message += `**เบอร์โทร:** \`${newOrder.customer.phone}\`\n`;
				if (newOrder.customer.address) message += `**ที่อยู่จัดส่ง:**\n${newOrder.customer.address}\n`;
			} else {
				message += `**ลูกค้า:** ลูกค้าทั่วไป\n`;
			}
			if (newOrder.items.length > 0) {
				message += `\n--- รายการที่ต้องไปส่ง ---\n`;
				newOrder.items.forEach((item, index) => {
					message += `${index + 1}. ${item.product.name} (จำนวน: ${item.quantity} ชิ้น)\n`;
				});
				message += `--------------------\n\n`;
			}
			message += `**กรุณาตรวจสอบสินค้าให้ครบถ้วน**`;
			await sendTelegramMessage(message, ChatId.SHIPPING);
		}

		// --- 7. ส่งข้อมูลกลับและแจ้งเตือน (บิลขายเชื่อปกติ) ---
		const serializableOrder = {
			...newOrder,
			total: newOrder.total.toString(),
			received: newOrder.received ? newOrder.received.toString() : null,
			change: newOrder.change ? newOrder.change.toString() : null,
			items: newOrder.items.map(item => ({
				...item,
				price: item.price.toString(),
				discount: item.discount.toString()
			}))
		};

		if (newOrder.status === 'CREDIT' && newOrder.customer) {
			const customerName = `${newOrder.customer.firstName} ${newOrder.customer.lastName || ''}`.trim();
			const message = `🚨 *บิลขายเชื่อใหม่*\nเลขที่บิล: \`${newOrder.orderNumber}\`\nลูกค้า: ${customerName}\nยอดรวม: *${newOrder.total.toString()}* บาท`;
			sendTelegramMessage(message, ChatId.SALES);
		}

		return json(serializableOrder, { status: 201 });
	} catch (err: any) {
		console.error('Error creating order:', err);
		if (err instanceof Error) {
			return json({ message: err.message }, { status: 400 });
		}
		if (err.code === 'P2002') {
			return json({ message: 'เกิดข้อผิดพลาด: เลขที่บิลซ้ำกัน กรุณาลองใหม่อีกครั้ง' }, { status: 409 });
		}
		throw error(500, 'ไม่สามารถบันทึกการขายได้');
	}
};