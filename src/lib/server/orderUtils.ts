import type { PrismaClient, Prisma } from '@prisma/client';

// ใช้ Prisma.TransactionClient เพื่อให้ฟังก์ชันนี้ทำงานภายใน Transaction ได้
type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>;

/**
 * สร้างเลขที่บิลที่ไม่ซ้ำกันในแต่ละวัน
 * @param status สถานะของบิล (เช่น 'HELD', 'COMPLETED')
 * @param tx Prisma Transaction Client
 */
export async function generateOrderNumber(status: 'HELD' | 'COMPLETED' | 'CREDIT', tx: TxClient) {
	const today = new Date();
	const year = today.getFullYear().toString().slice(-2);
	const month = (today.getMonth() + 1).toString().padStart(2, '0');
	const day = today.getDate().toString().padStart(2, '0');
	const prefix = `${year}${month}${day}-`;

	const todayOrderCount = await tx.order.count({
		where: {
			createdAt: {
				gte: new Date(new Date().setHours(0, 0, 0, 0)),
				lt: new Date(new Date().setHours(23, 59, 59, 999))
			}
		}
	});

	const nextSequence = todayOrderCount + 1;
	return `${prefix}${nextSequence.toString().padStart(4, '0')}`;
}

/**
 * คำนวณยอดรวมและตรวจสอบข้อมูลตะกร้าสินค้าจากฐานข้อมูล
 * @param cart ข้อมูลตะกร้าจาก client
 * @param tx Prisma Transaction Client
 * @returns ยอดรวมที่คำนวณจากฝั่ง server และข้อมูลสินค้าที่ validated แล้ว
 */
export async function validateAndCalculateCart(
	cart: { id: number; quantity: number; discount: number }[],
	tx: TxClient
) {
	if (!cart || cart.length === 0) {
		throw new Error('Cart is empty');
	}

	const productIds = cart.map((item) => item.id);
	const productsInDb = await tx.product.findMany({
		where: {
			id: { in: productIds }
		}
	});

	if (productsInDb.length !== productIds.length) {
		throw new Error('Some products not found in database.');
	}

	let grandTotal = 0;
	const validatedCartItems = [];

	for (const cartItem of cart) {
		const product = productsInDb.find((p) => p.id === cartItem.id);
		if (!product) {
			// Redundant check, but good for safety
			throw new Error(`Product with ID ${cartItem.id} not found.`);
		}

		const itemSubtotal = product.retailPrice * cartItem.quantity;
		const itemTotalDiscount = (cartItem.discount || 0) * cartItem.quantity;
		grandTotal += itemSubtotal - itemTotalDiscount;

		validatedCartItems.push({
			...cartItem,
			price: product.retailPrice // ใช้ราคาจาก DB
		});
	}

	return { grandTotal, validatedCartItems };
}

/**
 * ตรวจสอบสต็อกสินค้าคงเหลือก่อนเริ่มทำรายการ
 * @param cart ข้อมูลตะกร้าจาก client
 * @param tx Prisma Transaction Client
 */
export async function checkStockAvailability(
	cart: { id: number; quantity: number }[],
	tx: TxClient
) {
	const productIds = cart.map((item) => item.id);
	const productsInDb = await tx.product.findMany({
		where: { id: { in: productIds } },
		select: { id: true, name: true, stockQuantity: true }
	});

	for (const cartItem of cart) {
		const product = productsInDb.find((p) => p.id === cartItem.id);
		if (!product || product.stockQuantity < cartItem.quantity) {
			throw new Error(
				`สินค้าไม่เพียงพอ: ${product?.name || 'Unknown'} (คงเหลือ: ${
					product?.stockQuantity || 0
				}, ต้องการ: ${cartItem.quantity})`
			);
		}
	}
}