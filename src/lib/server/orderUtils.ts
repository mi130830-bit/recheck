// Path: src/lib/server/orderUtils.ts (Final Refactored Version)

import { db } from '$lib/server/db';
import type { PrismaClient } from '@prisma/client';

// สร้าง Type สำหรับ Prisma Transaction Client เพื่อใช้ซ้ำ
type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

/**
 * [เวอร์ชันใหม่] สร้างเลขที่บิลที่ไม่ซ้ำกันในแต่ละวัน โดยทำงานภายใต้ Transaction เพื่อป้องกัน Race Condition
 * @param prefix สามารถใส่ prefix เพิ่มเติมได้ เช่น 'HELD-' (ไม่บังคับ)
 * @param tx Prisma Transaction Client (บังคับ)
 */
export async function generateOrderNumber(prefix: string = '', tx: TxClient) {
	const now = new Date();
	// ใช้ปี พ.ศ. สองตัวท้าย
	const datePrefix = new Intl.DateTimeFormat('th-u-ca-buddhist', {
		year: '2-digit',
		month: '2-digit',
		day: '2-digit'
	}).format(now).replace(/\//g, ''); // ผลลัพธ์ เช่น 680829

	const searchPrefix = `${datePrefix}-`;

	// ใช้ tx ที่รับเข้ามาในการ query
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
 * ตรวจสอบราคาสินค้าจากฐานข้อมูลและคำนวณยอดรวมทั้งหมด (Grand Total)
 * @param cart ข้อมูลตะกร้าจาก client
 * @param tx Prisma Transaction Client
 */
export async function validateAndCalculateCart(
	cart: { id: number; quantity: number; discount: number }[],
	tx: TxClient
) {
	if (!cart || cart.length === 0) {
		throw new Error('ตะกร้าสินค้าว่างเปล่า');
	}

	const productIds = cart.map((item) => item.id);
	const productsInDb = await tx.product.findMany({
		where: { id: { in: productIds } },
		select: { id: true, retailPrice: true }
	});

	if (productsInDb.length !== productIds.length) {
		throw new Error('มีสินค้าบางรายการไม่พบในฐานข้อมูล');
	}

	const productMap = new Map(productsInDb.map(p => [p.id, p]));

	let grandTotal = 0;
	for (const cartItem of cart) {
		const product = productMap.get(cartItem.id);
		if (!product) {
			// This case should theoretically not happen due to the check above
			throw new Error(`ไม่พบสินค้า ID: ${cartItem.id}`);
		}
		// ใช้ retailPrice จากฐานข้อมูลเพื่อความปลอดภัย
		const price = product.retailPrice; 
		const discount = cartItem.discount || 0;
		const quantity = cartItem.quantity;

		const itemTotal = price.toNumber() * quantity;
		const itemDiscount = discount * quantity;
		grandTotal += itemTotal - itemDiscount;
	}

	return { grandTotal };
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
		select: { id: true, name: true, stockQuantity: true, trackStock: true }
	});

	for (const cartItem of cart) {
		const product = productsInDb.find((p) => p.id === cartItem.id);
		if (!product) {
			throw new Error(`ไม่พบสินค้า ID: ${cartItem.id} ในระบบ`);
		}
		// เช็คสต็อกเฉพาะสินค้าที่เปิดใช้งาน trackStock
		if (product.trackStock && product.stockQuantity < cartItem.quantity) {
			throw new Error(`สินค้าไม่เพียงพอ: ${product.name} (คงเหลือ: ${product.stockQuantity}, ต้องการ: ${cartItem.quantity})`);
		}
	}
}