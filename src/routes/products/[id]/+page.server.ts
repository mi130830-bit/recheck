import { prisma } from '$lib/server/prisma';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

// Node.js modules สำหรับจัดการไฟล์
import fs from 'fs/promises';
import path from 'path';

// --- 1. ฟังก์ชัน `load` สำหรับดึงข้อมูลมาแสดงที่หน้าเว็บ ---
export const load: PageServerLoad = async ({ params }) => {
	const productId = Number(params.id);

	// ตรวจสอบว่า ID ที่ส่งมาเป็นตัวเลขที่ถูกต้องหรือไม่
	if (isNaN(productId)) {
		throw error(400, 'ID สินค้าไม่ถูกต้อง');
	}

	// ค้นหาสินค้าจากฐานข้อมูลด้วย ID ที่ระบุ
	const product = await prisma.product.findUnique({
		where: { id: productId },
		include: {
			category: true,
			unit: true,
			supplier: true
		}
	});

	// ถ้าไม่พบสินค้า ให้โยน Error 404
	if (!product) {
		throw error(404, 'ไม่พบสินค้า');
	}

	// ✅ FIX: แก้ปัญหา Serialization Error
	// แปลงข้อมูลประเภท Decimal (costPrice, retailPrice, etc.) ให้เป็น Number
	// ก่อนที่จะส่งข้อมูลไปให้หน้า .svelte
	const serializableProduct = {
		...product,
		costPrice: product.costPrice.toNumber(),
		retailPrice: product.retailPrice.toNumber(),
		wholesalePrice: product.wholesalePrice ? product.wholesalePrice.toNumber() : null
	};

	// ส่งข้อมูลสินค้าที่แปลงค่าแล้วกลับไป
	return { product: serializableProduct };
};


// --- 2. ฟังก์ชัน `actions` สำหรับรับข้อมูลจากฟอร์ม (เช่น อัปโหลดรูป) ---
export const actions: Actions = {
	updateImage: async ({ request, params }) => {
		const productId = Number(params.id);
		const formData = await request.formData();
		const imageFile = formData.get('productImage') as File;

		// ตรวจสอบว่ามีการส่งไฟล์มาหรือไม่
		if (!imageFile || imageFile.size === 0) {
			return fail(400, { message: 'กรุณาเลือกไฟล์รูปภาพ' });
		}

		// สร้างชื่อไฟล์ใหม่ที่ไม่ซ้ำกัน โดยใช้ timestamp
		const uniqueFilename = `${Date.now()}-${imageFile.name}`;
		// กำหนดตำแหน่งที่จะบันทึกไฟล์ (ในโฟลเดอร์ static เพื่อให้เข้าถึงได้ผ่าน URL)
		const uploadDir = path.join('static', 'uploads', 'products');
		const savePath = path.join(uploadDir, uniqueFilename);

		try {
			// สร้าง folder ถ้ายังไม่มี
			await fs.mkdir(uploadDir, { recursive: true });

			// อ่านไฟล์เป็น Buffer แล้วบันทึกลงในตำแหน่งที่กำหนด
			const buffer = Buffer.from(await imageFile.arrayBuffer());
			await fs.writeFile(savePath, buffer);

			// สร้าง URL ที่จะใช้เก็บในฐานข้อมูล
			const imageUrl = `/uploads/products/${uniqueFilename}`;

			// อัปเดตฐานข้อมูลด้วย URL ของรูปภาพใหม่
			await prisma.product.update({
				where: { id: productId },
				data: { imageUrl }
			});

			return { success: true, message: 'อัปโหลดรูปภาพสำเร็จ' };

		} catch (err) {
			// หากเกิดข้อผิดพลาดในการบันทึกไฟล์
			console.error('File upload error:', err);
			return fail(500, { message: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์' });
		}
	}
};