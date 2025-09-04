// Path: src/routes/receipts/[orderId]/+page.server.ts

import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const orderId = Number(params.orderId);
    if (isNaN(orderId)) {
        throw error(400, 'รหัสบิลไม่ถูกต้อง');
    }

    const order = await db.order.findUnique({
        where: { id: orderId },
        include: {
            customer: true,
            items: {
                include: {
                    product: true
                }
            }
        }
    });

    if (!order) {
        throw error(404, 'ไม่พบบิลที่ระบุ');
    }

    const serializableOrder = {
        ...order,
        total: order.total.toNumber(),
        received: order.received ? order.received.toNumber() : null,
        change: order.change ? order.change.toNumber() : null,
        
        // แปลงค่า Decimal ที่ซ้อนอยู่ใน customer object ด้วย
        customer: order.customer ? {
            ...order.customer,
            creditLimit: order.customer.creditLimit 
                ? order.customer.creditLimit.toNumber() 
                : null
        } : null,
        
        items: order.items.map((item) => ({
            ...item,
            price: item.price.toNumber(),
            discount: item.discount.toNumber(),
            total: (item.quantity * item.price.toNumber()) - item.discount.toNumber(),
            product: {
                ...item.product,
                costPrice: item.product.costPrice.toNumber(),
                retailPrice: item.product.retailPrice.toNumber(),
                wholesalePrice: item.product.wholesalePrice ? item.product.wholesalePrice.toNumber() : null
            }
        }))
    };
    
    // กำหนดข้อมูลร้านค้าที่ต้องการใช้ในใบเสร็จ
    const shopInfo = {
        storeName: 'ชื่อร้านของคุณ',
        address: 'ที่อยู่ร้านค้า 123/45 ต.ในเมือง อ.เมือง จ.กรุงเทพ 10200',
        phone: '081-234-5678',
        taxId: '1234567890123',
        receiptNote: 'ขอบคุณที่ใช้บริการ'
    };

    return {
        receiptData: {
            order: serializableOrder,
            shopInfo: shopInfo
        }
    };
};