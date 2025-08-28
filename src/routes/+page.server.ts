// File: src/routes/+page.server.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function load() {
  // ดึงข้อมูลลูกค้าทั้งหมดเพื่อใช้ใน Dropdown ค้นหาลูกค้า
  const customers = await prisma.customer.findMany({
    orderBy: { firstName: 'asc' },
  });

  return { customers };
}