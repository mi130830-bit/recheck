// File: src/routes/api/orders/+server.ts (ฉบับสมบูรณ์)

import { PrismaClient } from '@prisma/client';
import { json } from '@sveltejs/kit';
import { sendTelegramMessage, ChatId } from '$lib/server/telegram';

const prisma = new PrismaClient();

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

export async function POST({ request }) {
    const { cart, total, customerId, paymentType } = await request.json();

    if (!cart || cart.length === 0) {
        return json({ error: 'ข้อมูลไม่ถูกต้อง: ตะกร้าว่างเปล่า' }, { status: 400 });
    }

    try {
        const orderNumber = await generateOrderNumber();

        const newOrder = await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    orderNumber: orderNumber,
                    total: total,
                    customerId: customerId ? customerId : null,
                    status: paymentType === 'CREDIT' ? 'CREDIT' : 'COMPLETED',
                },
                include: {
                    customer: true,
                },
            });

            // ทำงานทุกครั้ง ไม่ว่าจะจ่ายสดหรือขายเชื่อ
            for (const item of cart) {
                // 1. สร้าง OrderItem
                await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.retailPrice,
                    },
                });
                // 2. ตัดสต็อกสินค้า
                await tx.product.update({
                    where: { id: item.id },
                    data: {
                        stockQuantity: {
                            decrement: item.quantity,
                        },
                    },
                });
            }
            return order;
        });

        if (newOrder.status === 'CREDIT') {
            const customerName = newOrder.customer ? `${newOrder.customer.firstName} ${newOrder.customer.lastName || ''}`.trim() : 'ลูกค้าทั่วไป';
            let itemsText = cart.map((item: { name: string; quantity: number }, index: number) => 
                `${index + 1}. ${item.name} (x${item.quantity})`
            ).join('\n');
            const message = `
*🚨 บิลขายเชื่อใหม่ 🚨*
*เลขที่บิล:* \`${newOrder.orderNumber}\`
*ลูกค้า:* ${customerName}
--------------------------------------
*รายการสินค้า:*
${itemsText}
--------------------------------------
*ยอดรวมสุทธิ:* *${newOrder.total.toFixed(2)}* บาท`;
            
            // ส่งไปที่ห้อง SALES
            sendTelegramMessage(message, ChatId.SALES);
        }

        return json(newOrder, { status: 201 });
    } catch (err) {
        console.error('Error creating order:', err);
        return json({ error: 'ไม่สามารถบันทึกการขายได้' }, { status: 500 });
    }
}