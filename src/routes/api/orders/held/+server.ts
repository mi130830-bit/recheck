// File: src/routes/api/orders/[id]/dispatch/+server.ts

import { PrismaClient } from '@prisma/client';
import { json, error } from '@sveltejs/kit';
import { sendTelegramMessage, ChatId } from '$lib/server/telegram';

const prisma = new PrismaClient();

export async function POST({ params }) {
  const orderId = Number(params.id);
  if (isNaN(orderId)) {
    throw error(400, 'Invalid Order ID');
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    if (!order) {
      throw error(404, 'ไม่พบบิล');
    }

    // --- สร้างข้อความสำหรับแจ้งเตือน ---
    const customerName = order.customer
      ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim()
      : 'ลูกค้าทั่วไป';
    const shippingAddress = order.customer?.shippingAddress || order.customer?.address || 'รับที่ร้าน';

    let itemsText = order.items
      .map((item, index) => `${index + 1}. ${item.product.name} (x${item.quantity})`)
      .join('\n');

    const message = `
🚚 *แจ้งเตือนจัดส่งสินค้า* 🚚
*เลขที่บิล:* \`${order.orderNumber}\`
*ลูกค้า:* ${customerName}
*ที่อยู่จัดส่ง:* ${shippingAddress}
--------------------------------------
*รายการสินค้า:*
${itemsText}
--------------------------------------
*ยอดรวม:* *${order.total.toFixed(2)}* บาท
    `;

    // --- ส่งข้อความไปที่ห้อง "ส่งของ" ---
    await sendTelegramMessage(message, ChatId.SHIPPING);

    return json({ success: true, message: 'แจ้งเตือนการจัดส่งเรียบร้อย' });
  } catch (err) {
    console.error("Dispatch notification error:", err);
    throw error(500, 'ไม่สามารถส่งแจ้งเตือนได้');
  }
}