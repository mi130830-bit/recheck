// File: src/routes/api/stock-in/+server.ts

import { PrismaClient } from '@prisma/client';
import { json } from '@sveltejs/kit';

const prisma = new PrismaClient();

// ฟังก์ชันสร้างเลขที่ใบรับของ (คล้ายกับเลขที่บิล)
async function generatePoNumber() {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const prefix = `PO${year}${month}${day}-`;

  const lastPo = await prisma.purchaseOrder.findFirst({
    where: {
      poNumber: { startsWith: prefix },
    },
    orderBy: { createdAt: 'desc' },
  });

  let nextSequence = 1;
  if (lastPo) {
    const lastSequence = parseInt(lastPo.poNumber.split('-')[1]);
    nextSequence = lastSequence + 1;
  }

  return `${prefix}${nextSequence.toString().padStart(4, '0')}`;
}


export async function POST({ request }) {
  const { supplierId, items, notes } = await request.json();

  if (!supplierId || !items || items.length === 0) {
    return json({ error: 'ข้อมูลไม่ถูกต้อง: กรุณาเลือกผู้ขายและเพิ่มสินค้า' }, { status: 400 });
  }

  try {
    const poNumber = await generatePoNumber();
    const totalCost = items.reduce((sum, item) => sum + item.receiveCost * item.receiveQty, 0);

    // ใช้ Transaction เพื่อให้แน่ใจว่าทุกอย่างสำเร็จพร้อมกัน
    await prisma.$transaction(async (tx) => {
      // 1. สร้าง PurchaseOrder และ PurchaseOrderItem พร้อมกัน
      await tx.purchaseOrder.create({
        data: {
          poNumber,
          supplierId,
          totalCost,
          notes,
          items: {
            create: items.map((item: { id: number, receiveQty: number, receiveCost: number }) => ({
              productId: item.id,
              quantity: item.receiveQty,
              costPrice: item.receiveCost,
            })),
          },
        },
      });

      // 2. วนลูปเพื่ออัปเดตสต็อกสินค้าแต่ละตัว
      for (const item of items) {
        if (item.receiveQty > 0) { // เพิ่มสต็อกเฉพาะรายการที่มีจำนวนมากกว่า 0
          await tx.product.update({
            where: { id: item.id },
            data: {
              stockQuantity: {
                increment: item.receiveQty, // <<<<<< เพิ่มสต็อกสินค้า
              },
            },
          });
        }
      }
    });

    return new Response(null, { status: 201 }); // 201 Created
  } catch (err) {
    console.error('Error creating purchase order:', err);
    return json({ error: 'ไม่สามารถบันทึกการรับสินค้าได้' }, { status: 500 });
  }
}