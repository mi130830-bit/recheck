// Path: src/routes/api/orders/hold/[id]/+server.ts (NEW FILE)
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		// ลบ order items ที่เกี่ยวข้องก่อน
		await db.orderItem.deleteMany({
			where: { orderId: Number(params.id) }
		});
		// แล้วค่อยลบตัว order เอง
		await db.order.delete({
			where: {
				id: Number(params.id),
				status: 'HELD'
			}
		});
	} catch (err) {
		console.warn(`Could not delete held bill ${params.id}, it might already be gone.`);
		// ส่ง 204 กลับไปเสมอแม้จะ error เพื่อให้ฝั่ง client ทำงานต่อได้
	}
	return new Response(null, { status: 204 }); // 204 No Content
};