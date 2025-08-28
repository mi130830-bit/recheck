import { prisma } from '$lib/server/prisma';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Endpoint: POST /api/orders/[id]/settle
export const POST: RequestHandler = async ({ params }) => {
	const orderId = parseInt(params.id);

	if (isNaN(orderId)) {
		throw error(400, 'Invalid Order ID');
	}

	try {
		// ค้นหาบิลที่ต้องการชำระ
		const orderToSettle = await prisma.order.findUnique({
			where: { id: orderId }
		});

		// ตรวจสอบว่ามีบิลจริง และสถานะเป็น 'CREDIT'
		if (!orderToSettle || orderToSettle.status !== 'CREDIT') {
			throw error(404, 'Credit order not found or already settled.');
		}

		// อัปเดตสถานะบิล
		const settledOrder = await prisma.order.update({
			where: { id: orderId },
			data: {
				status: 'COMPLETED',
				paidAt: new Date() // บันทึกเวลาที่ชำระเงิน
			}
		});

		return json({ success: true, order: settledOrder });
	} catch (err) {
		console.error('Failed to settle debt:', err);
		throw error(500, 'Could not settle the debt.');
	}
};