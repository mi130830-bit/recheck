// Path: src/lib/server/orderUtils.ts (Final Corrected Version)

import { PrismaClient, Prisma } from '@prisma/client';

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>;

const prisma = new PrismaClient();

/**
 * [เวอร์ชัน Transaction] สร้างเลขที่บิลที่ไม่ซ้ำกันในแต่ละวัน
 * @param tx Prisma Transaction Client
 */
export async function generateOrderNumberInTransaction(tx: TxClient) {
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
 * [เวอร์ชัน Standalone] สร้างเลขที่บิลที่ไม่ซ้ำกันในแต่ละวัน
 */
export async function generateOrderNumber() {
	const today = new Date();
	const year = today.getFullYear().toString().slice(-2);
	const month = (today.getMonth() + 1).toString().padStart(2, '0');
	const day = today.getDate().toString().padStart(2, '0');
	const prefix = `${year}${month}${day}-`;

	const todayOrderCount = await prisma.order.count({
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
 */
// [แก้ไข] ใส่ Parameter ที่ถูกต้องแทน (...)
export async function validateAndCalculateCart(
	cart: { id: number; quantity: number; discount: number }[],
	tx: TxClient
) {
	if (!cart || cart.length === 0) { throw new Error('Cart is empty'); }
	const productIds = cart.map((item) => item.id);
	const productsInDb = await tx.product.findMany({ where: { id: { in: productIds } } });
	if (productsInDb.length !== productIds.length) { throw new Error('Some products not found in database.'); }
	let grandTotal = 0;
	const validatedCartItems = [];
	for (const cartItem of cart) {
		const product = productsInDb.find((p) => p.id === cartItem.id);
		if (!product) { throw new Error(`Product with ID ${cartItem.id} not found.`); }
		const itemSubtotal = product.retailPrice * cartItem.quantity;
		const itemTotalDiscount = (cartItem.discount || 0) * cartItem.quantity;
		grandTotal += itemSubtotal - itemTotalDiscount;
		validatedCartItems.push({ ...cartItem, price: product.retailPrice });
	}
	return { grandTotal, validatedCartItems };
}

/**
 * ตรวจสอบสต็อกสินค้าคงเหลือก่อนเริ่มทำรายการ
 * @param cart ข้อมูลตะกร้าจาก client
 * @param tx Prisma Transaction Client
 */
// [แก้ไข] ใส่ Parameter ที่ถูกต้องแทน (...)
export async function checkStockAvailability(
	cart: { id: number; quantity: number }[],
	tx: TxClient
) {
	const productIds = cart.map((item) => item.id);
	const productsInDb = await tx.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, stockQuantity: true } });
	for (const cartItem of cart) {
		const product = productsInDb.find((p) => p.id === cartItem.id);
		if (!product || product.stockQuantity < cartItem.quantity) { throw new Error(`สินค้าไม่เพียงพอ: ${product?.name || 'Unknown'} (คงเหลือ: ${product?.stockQuantity || 0}, ต้องการ: ${cartItem.quantity})`); }
	}
}