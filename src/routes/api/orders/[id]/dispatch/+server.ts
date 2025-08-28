// File: src/routes/api/orders/[id]/dispatch/+server.ts (ตรวจสอบ)

import { PrismaClient } from '@prisma/client';
import { json, error } from '@sveltejs/kit';
// VVVVVV ตรวจสอบว่า Import ChatId เข้ามา VVVVVV
import { sendTelegramMessage, ChatId } from '$lib/server/telegram';

const prisma = new PrismaClient();

export async function POST({ params }) {
  // ... โค้ดดึงข้อมูล order ...
  
  const message = `...`; // ข้อความแจ้งเตือนส่งของ

  // VVVVVV ตรวจสอบว่าส่งไปที่ห้อง SHIPPING VVVVVV
  await sendTelegramMessage(message, ChatId.SHIPPING);

  return json({ success: true, message: 'แจ้งเตือนการจัดส่งเรียบร้อย' });
}