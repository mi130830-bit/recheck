// src/routes/settings/maintenance/backup/+server.ts

import { error } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { env } from '$env/dynamic/private';

const execPromise = promisify(exec);

// --- Helper Function: แยกส่วนประกอบจาก DATABASE_URL ---
function parseDbUrl(url: string) {
	const dbUrl = new URL(url);
	return {
		host: dbUrl.hostname,
		port: dbUrl.port,
		user: dbUrl.username,
		password: dbUrl.password,
		database: dbUrl.pathname.slice(1) // ตัด / ข้างหน้าออก
	};
}

export async function GET() {
	// ใช้ DATABASE_URL จาก environment variables
	const databaseUrl = env.DATABASE_URL;
	if (!databaseUrl) {
		throw error(500, 'DATABASE_URL is not defined in environment variables');
	}

	const dbConfig = parseDbUrl(databaseUrl);
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const backupFileName = `backup-${dbConfig.database}-${timestamp}.sql`;

	// ใช้ MYSQL_PWD เพื่อความปลอดภัย ไม่แสดง password ใน command
	const command = `mysqldump -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.user} ${dbConfig.database}`;

	try {
		const { stdout, stderr } = await execPromise(command, {
			env: { ...process.env, MYSQL_PWD: dbConfig.password },
			maxBuffer: 1024 * 1024 * 50 // 50MB buffer
		});

		if (stderr) {
			// mysqldump อาจส่ง warning มาที่ stderr แต่ก็ยังทำงานสำเร็จ
			// แต่ถ้ามีคำว่า 'error' ให้โยนเป็น exception
			if (stderr.toLowerCase().includes('error')) {
				throw new Error(stderr);
			}
			console.warn('mysqldump stderr:', stderr); // แสดง warning ใน console ของเซิร์ฟเวอร์
		}

		// ส่งไฟล์ให้ผู้ใช้ดาวน์โหลดโดยตรง
		return new Response(stdout, {
			status: 200,
			headers: {
				'Content-Type': 'application/sql',
				'Content-Disposition': `attachment; filename="${backupFileName}"`
			}
		});
	} catch (e: any) {
		console.error('Backup Failed:', e);
		throw error(500, `การสำรองข้อมูลล้มเหลว: ${e.message}`);
	}
}