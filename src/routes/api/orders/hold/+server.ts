// File: src/routes/api/orders/hold/+server.ts (ฉบับสมบูรณ์)

import { PrismaClient } from '@prisma/client';
import { json } from '@sveltejs/kit';

const prisma = new PrismaClient();

// ฟังก์ชันสร้างเลขบิล (ใช้ร่วมกัน)
async function generateOrderNumber() {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const prefix = `${year}${month}${day}-`;
  
  const todayOrderCount = await prisma.order.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    },
  });
  const nextSequence = todayOrderCount + 1;
  return `${prefix}${nextSequence.toString().padStart(4, '0')}`;
}

// --- ฟังก์ชันสำหรับ "ดึงข้อมูล" บิลที่พักไว้ (GET) ---
export async function GET() {
  try {
    const heldOrders = await prisma.order.findMany({
      where: { status: 'HELD' },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return json(heldOrders);
  } catch (err) {
    console.error('Error fetching held orders:', err);
    return json({ error: 'ไม่สามารถดึงข้อมูลบิลที่พักไว้ได้' }, { status: 500 });
  }
}

// --- ฟังก์ชันสำหรับ "สร้าง" บิลที่พักไว้ (POST) ---
export async function POST({ request }) {
  const { cart, total, customerId } = await request.json();
  if (!cart || cart.length === 0) {
    return json({ error: 'ตะกร้าว่างเปล่า' }, { status: 400 });
  }
  try {
    const orderNumber = await generateOrderNumber();
    const heldOrder = await prisma.order.create({
      data: {
        orderNumber,
        total,
        customerId,
        status: 'HELD',
        items: {
          create: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.retailPrice,
          })),
        },
      },
    });
    return json(heldOrder, { status: 201 });
  } catch (err) {
    console.error('Error holding order:', err);
    return json({ error: 'ไม่สามารถพักบิลได้' }, { status: 500 });
  }
}