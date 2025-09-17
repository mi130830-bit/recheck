// src/lib/server/db.ts
// นี่คือไฟล์ "ทางการ" สำหรับเชื่อมต่อฐานข้อมูลไฟล์เดียว

import { PrismaClient } from '@prisma/client';

// สร้าง instance ของ PrismaClient
// และ export ออกไปในชื่อ `db` เพื่อให้ไฟล์อื่นนำไปใช้
export const db = new PrismaClient();
