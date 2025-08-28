// Path: src/lib/server/db.ts

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

export { db };