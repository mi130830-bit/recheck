// Path: src/lib/server/orderUtils.ts (ฉบับแก้ไขที่สมบูรณ์)

import type { PrismaClient } from '@prisma/client';

// สร้าง Type สำหรับ Prisma Transaction Client เพื่อให้เรียกใช้ง่ายและสอดคล้องกัน
type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

/**
 * สร้างเลขที่บิลที่ไม่ซ้ำกันในแต่ละวัน (รูปแบบ: YYMMDD-NNNN)
 * @param prefix สามารถใส่ prefix เพิ่มเติมได้ เช่น 'HELD-'
 * @param tx Prisma Transaction Client (จำเป็น)
 */
export async function generateOrderNumber(prefix: string = '', tx: TxClient) {
	const now = new Date();
	const datePrefix = new Intl.DateTimeFormat('th-u-ca-buddhist', {
		year: '2-digit',
		month: '2-digit',
		day: '2-digit'
	})
		.format(now)
		.replace(/\//g, ''); // ผลลัพธ์ เช่น 670829

	const searchPrefix = `${datePrefix}-`;

	const lastOrder = await tx.order.findFirst({
		where: {
			orderNumber: {
				startsWith: searchPrefix
			}
		},
		orderBy: {
			orderNumber: 'desc'
		},
		select: {
			orderNumber: true
		}
	});

	let nextNumber = 1;
	if (lastOrder) {
		const lastRunningNumber = parseInt(lastOrder.orderNumber.split('-')[1]);
		nextNumber = lastRunningNumber + 1;
	}

	const runningNumber = nextNumber.toString().padStart(4, '0');

	return `${prefix}${searchPrefix}${runningNumber}`;
}

/**
 * [แก้ไขแล้ว] ตรวจสอบข้อมูลสินค้าในตะกร้า, สร้างตะกร้าที่ถูกต้อง (validatedCart)
 * และคำนวณยอดรวมทั้งหมด (Grand Total) โดยใช้ข้อมูลจากฐานข้อมูลเป็นหลัก
 * @param cart ข้อมูลตะกร้าจาก client
 * @param tx Prisma Transaction Client
 * @returns {Promise<{grandTotal: number, validatedCart: any[]}>} Object ที่มียอดรวมและตะกร้าที่ตรวจสอบแล้ว
 */
export async function validateAndCalculateCart(
	cart: { id: number; quantity: number; discount?: number }[],
	tx: TxClient
) {
	if (!cart || cart.length === 0) {
		throw new Error('ตะกร้าสินค้าว่างเปล่า');
	}

	const productIds = cart.map((item) => item.id);

	// ดึงข้อมูลที่จำเป็นทั้งหมดจากฐานข้อมูลในครั้งเดียว
	const productsInDb = await tx.product.findMany({
		where: { id: { in: productIds } },
		select: { id: true, retailPrice: true, costPrice: true } // เพิ่ม costPrice สำหรับบันทึกประวัติ
	});

	if (productsInDb.length !== productIds.length) {
		throw new Error('มีสินค้าบางรายการไม่พบในฐานข้อมูล');
	}

	const productMap = new Map(productsInDb.map((p) => [p.id, p]));

	let grandTotal = 0;
	const validatedCart = []; // <-- สร้าง Array ว่างเพื่อเก็บข้อมูลตะกร้าที่ถูกต้อง

	for (const cartItem of cart) {
		const product = productMap.get(cartItem.id);
		if (!product) {
			// กรณีนี้ไม่ควรเกิดขึ้นได้เนื่องจากมีการตรวจสอบด้านบนแล้ว
			throw new Error(`ไม่พบสินค้า ID: ${cartItem.id}`);
		}
		
		const price = product.retailPrice.toNumber();
		const quantity = cartItem.quantity;
		const discount = cartItem.discount || 0; // อาจไม่มีส่วนลด

		const itemTotal = price * quantity - discount; // คำนวณยอดรวมของรายการนี้
		grandTotal += itemTotal; // เพิ่มเข้ายอดรวมทั้งหมด

		// <-- เพิ่มข้อมูลที่ผ่านการตรวจสอบแล้วเข้าไปใน validatedCart
		validatedCart.push({
			id: product.id,
			quantity: cartItem.quantity,
			discount: cartItem.discount || 0,
			retailPrice: product.retailPrice, // ใช้ราคาจริงจาก DB
			costPrice: product.costPrice // ใช้ต้นทุนจริงจาก DB
		});
	}

	// <-- คืนค่าทั้ง grandTotal และ validatedCart กลับไป
	return { grandTotal, validatedCart };
}

/**
 * ตรวจสอบสต็อกสินค้าคงเหลือก่อนเริ่มทำรายการขาย
 * @param cart ข้อมูลตะกร้าจาก client
 * @param tx Prisma Transaction Client
 */
export async function checkStockAvailability(
	cart: { id: number; quantity: number }[],
	tx: TxClient
) {
	if (!cart || cart.length === 0) {
		return; // ไม่ต้องทำอะไรถ้าตะกร้าว่าง
	}
	const productIds = cart.map((item) => item.id);
	const productsInDb = await tx.product.findMany({
		where: { id: { in: productIds } },
		select: { id: true, name: true, stockQuantity: true, trackStock: true }
	});

	for (const cartItem of cart) {
		const product = productsInDb.find((p) => p.id === cartItem.id);
		if (!product) {
			throw new Error(`ไม่พบสินค้า ID: ${cartItem.id} ในระบบ`);
		}
		// เช็คสต็อกเฉพาะสินค้าที่เปิดใช้งาน trackStock
		if (product.trackStock && product.stockQuantity < cartItem.quantity) {
			throw new Error(
				`สินค้าไม่เพียงพอ: ${product.name} (คงเหลือ: ${product.stockQuantity}, ต้องการ: ${cartItem.quantity})`
			);
		}
	}
}