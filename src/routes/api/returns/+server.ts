import { db } from '$lib/server/db';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	// [แก้ไข] เพิ่ม reason และ returnToStock
	const { orderId, itemsToReturn, reason, returnToStock } = await request.json();

	if (!orderId || !itemsToReturn || itemsToReturn.length === 0) {
		throw error(400, 'ข้อมูลไม่ครบถ้วน');
	}

	try {
		const newReturn = await db.$transaction(async (tx) => {
			// ... (โค้ดส่วนตรวจสอบความถูกต้องเหมือนเดิม) ...
			let totalRefundAmount = 0;
			for (const item of itemsToReturn) {
				const originalItem = await tx.orderItem.findUnique({ where: { id: item.orderItemId } });
				if (!originalItem) throw new Error(`ไม่พบรายการสินค้า ID ${item.orderItemId}`);
				const availableToReturn = originalItem.quantity - originalItem.returnedQuantity;
				if (item.quantityToReturn > availableToReturn) throw new Error(`คืนสินค้าเกินจำนวน (คืนได้อีก ${availableToReturn} ชิ้น)`);
				totalRefundAmount += item.price * item.quantityToReturn;
			}
			// ... (จบส่วนตรวจสอบ) ...


			// [แก้ไข] เพิ่ม reason เข้าไปตอนสร้างหัวบิล
			const productReturn = await tx.productReturn.create({
				data: {
					originalOrderId: orderId,
					totalRefundAmount: totalRefundAmount,
					reason: reason // <-- เพิ่มเหตุผล
				}
			});

			for (const item of itemsToReturn) {
				await tx.returnItem.create({
        			data: {
            			productReturnId: productReturn.id,
            			productId: item.productId,
            			quantity: item.quantityToReturn, // <-- ลืมบรรทัดนี้
            			priceAtReturn: item.price
        			}
				});

				// [แก้ไข] เพิ่มสต็อกก็ต่อเมื่อ returnToStock เป็น true เท่านั้น
				if (returnToStock) {
					await tx.product.update({
						where: { id: item.productId },
						data: { stockQuantity: { increment: item.quantityToReturn } }
					});
				}

				await tx.orderItem.update({
					where: { id: item.orderItemId },
					data: { returnedQuantity: { increment: item.quantityToReturn } }
				});
			}

			return productReturn;
		});

		return json(newReturn, { status: 201 });
	} catch (err: any) {
		console.error('Failed to process return:', err);
		throw error(400, err.message || 'เกิดข้อผิดพลาดในการบันทึกการรับคืน');
	}
};