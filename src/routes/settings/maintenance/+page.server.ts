// src/routes/settings/maintenance/+page.server.ts

import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { prisma } from '$lib/server/prisma';

// --- Node.js Modules ---
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { env } from '$env/dynamic/private';

const execPromise = promisify(exec);

// --- Helper Function ---
function parseDbUrl(url: string) {
	const dbUrl = new URL(url);
	return {
		host: dbUrl.hostname,
		port: dbUrl.port,
		user: dbUrl.username,
		password: dbUrl.password,
		database: dbUrl.pathname.slice(1)
	};
}

export const actions: Actions = {
	// ====== ACTION: RESTORE DATABASE ======
	restore: async ({ request }) => {
		const formData = await request.formData();
		const backupFile = formData.get('backupFile') as File;

		if (!backupFile || backupFile.size === 0 || !backupFile.name.endsWith('.sql')) {
			return fail(400, { restoreError: 'กรุณาเลือกไฟล์ .sql สำหรับกู้คืนข้อมูล' });
		}

		const tempDir = path.join('temp');
		await fs.mkdir(tempDir, { recursive: true });
		const tempFilePath = path.join(tempDir, `restore-${Date.now()}.sql`);

		try {
			await fs.writeFile(tempFilePath, Buffer.from(await backupFile.arrayBuffer()));

			const dbConfig = parseDbUrl(env.DATABASE_URL!);
			const command = `mysql -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.user} ${dbConfig.database} < "${tempFilePath}"`;

			const { stderr } = await execPromise(command, {
				env: { ...process.env, MYSQL_PWD: dbConfig.password }
			});

			if (stderr && stderr.toUpperCase().includes('ERROR')) {
				throw new Error(stderr);
			}

			return { restoreSuccess: 'กู้คืนข้อมูลสำเร็จ! แนะนำให้รีเฟรชหน้าเว็บ หรือ รีสตาร์ทระบบ' };
		} catch (error: any) {
			console.error('Restore Error:', error);
			return fail(500, { restoreError: `การกู้คืนข้อมูลล้มเหลว: ${error.message}` });
		} finally {
			await fs.unlink(tempFilePath).catch((err) => console.error('Failed to delete temp file:', err));
		}
	},

	// ====== ACTION: CLEAR TRANSACTIONAL DATA ======
	clearTransactions: async () => {
		try {
			await prisma.$transaction([
				// STEP 1: ลบข้อมูลระดับ "หลาน"
				prisma.billingNoteItem.deleteMany(),
				prisma.orderItem.deleteMany(),
				prisma.returnItem.deleteMany(),
				prisma.purchaseOrderItem.deleteMany(),

				// STEP 2: ลบข้อมูลระดับ "ลูก"
				prisma.productReturn.deleteMany(),
				prisma.billingNote.deleteMany(),

				// STEP 3: ลบประวัติสต็อก
				prisma.stockLedger.deleteMany(),

				// STEP 4: ลบข้อมูล "แม่"
				prisma.order.deleteMany({ where: { status: { not: 'HELD' } } }),
				prisma.purchaseOrder.deleteMany(),

				// STEP 5: รีเซ็ตสต็อก
				prisma.product.updateMany({ data: { stockQuantity: 0 } })
			]);
			return { clearTransactionSuccess: 'ล้างข้อมูลธุรกรรมทั้งหมดเรียบร้อยแล้ว' };
		} catch (error: any) {
			console.error('Clear Transactions Error:', error);
			return fail(500, { clearTransactionError: `การล้างข้อมูลธุรกรรมล้มเหลว: ${error.message}` });
		}
	},

	// ====== ACTION: CLEAR PRODUCTS ======
	clearProducts: async () => {
		try {
			await prisma.$transaction([
				prisma.product.deleteMany(),
				prisma.category.deleteMany(),
				prisma.unit.deleteMany()
			]);
			return { clearProductsSuccess: 'ลบข้อมูลสินค้า, ประเภท และหน่วยนับทั้งหมดแล้ว' };
		} catch (error: any) {
			console.error('Clear Products Error:', error);
			return fail(500, {
				clearProductsError: `ลบข้อมูลสินค้าล้มเหลว: ${error.message}. กรุณาล้างข้อมูลธุรกรรมก่อน`
			});
		}
	},

	// ====== ACTION: CLEAR CUSTOMERS ======
	clearCustomers: async () => {
		try {
			await prisma.customer.deleteMany();
			return { clearCustomersSuccess: 'ลบข้อมูลลูกค้าทั้งหมดแล้ว' };
		} catch (error: any) {
			console.error('Clear Customers Error:', error);
			return fail(500, {
				clearCustomersError: `ลบข้อมูลลูกค้าล้มเหลว: ${error.message}. กรุณาล้างข้อมูลธุรกรรมก่อน`
			});
		}
	},

	// ====== ACTION: CLEAR SUPPLIERS ======
	clearSuppliers: async () => {
		try {
			await prisma.supplier.deleteMany();
			return { clearSuppliersSuccess: 'ลบข้อมูลผู้ขายทั้งหมดแล้ว' };
		} catch (error: any) {
			console.error('Clear Suppliers Error:', error);
			return fail(500, {
				clearSuppliersError: `ลบข้อมูลผู้ขายล้มเหลว: ${error.message}. กรุณาล้างข้อมูลธุรกรรมก่อน`
			});
		}
	}
};