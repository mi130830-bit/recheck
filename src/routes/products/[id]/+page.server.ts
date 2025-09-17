import { prisma } from '$lib/server/prisma';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import fs from 'fs/promises';
import path from 'path';

// --- 1. ฟังก์ชัน `load` สำหรับดึงข้อมูลมาแสดงที่หน้าเว็บ ---
export const load: PageServerLoad = async ({ params }) => {
	const productId = Number(params.id);

	if (isNaN(productId)) {
		throw error(400, 'ID สินค้าไม่ถูกต้อง');
	}

	// ค้นหาสินค้าจากฐานข้อมูล
	const product = await prisma.product.findUnique({
		where: { id: productId },
		include: {
			category: true,
			unit: true,
			supplier: true
		}
	});

	if (!product) {
		throw error(404, 'ไม่พบสินค้า');
	}

	// [สำคัญ] แก้ปัญหา Serialization Error โดยการแปลงค่า Decimal เป็น Number
	const serializableProduct = {
		...product,
		costPrice: product.costPrice.toNumber(),
		retailPrice: product.retailPrice.toNumber(),
		wholesalePrice: product.wholesalePrice ? product.wholesalePrice.toNumber() : null
	};

	return { product: serializableProduct };
};

// --- 2. ฟังก์ชัน `actions` สำหรับจัดการฟอร์ม (เช่น อัปโหลดรูป) ---
export const actions: Actions = {
	updateImage: async ({ request, params }) => {
		const productId = Number(params.id);
		const formData = await request.formData();
		const imageFile = formData.get('productImage') as File;

		if (!imageFile || imageFile.size === 0) {
			return fail(400, { message: 'กรุณาเลือกไฟล์รูปภาพ' });
		}

		// [ปรับปรุง] ดึงข้อมูลสินค้าเดิมเพื่อเอารูปเก่ามาลบ
		const existingProduct = await prisma.product.findUnique({
			where: { id: productId },
			select: { imageUrl: true }
		});

		const uploadDir = path.join('static', 'uploads', 'products');
		const uniqueFilename = `${Date.now()}-${imageFile.name}`;
		const savePath = path.join(uploadDir, uniqueFilename);

		try {
			// สร้าง folder ถ้ายังไม่มี
			await fs.mkdir(uploadDir, { recursive: true });

			// บันทึกไฟล์ใหม่
			const buffer = Buffer.from(await imageFile.arrayBuffer());
			await fs.writeFile(savePath, buffer);
			const newImageUrl = `/uploads/products/${uniqueFilename}`;

			// อัปเดตฐานข้อมูล
			await prisma.product.update({
				where: { id: productId },
				data: { imageUrl: newImageUrl }
			});

			// [ปรับปรุง] ลบรูปภาพเก่า (ถ้ามี) หลังจากอัปเดตสำเร็จ
			if (existingProduct?.imageUrl) {
				const oldImagePath = path.join('static', existingProduct.imageUrl);
				try {
					await fs.unlink(oldImagePath);
				} catch (unlinkError) {
					console.warn(`Could not delete old image file: ${oldImagePath}`, unlinkError);
				}
			}

			return { success: true, message: 'อัปโหลดรูปภาพสำเร็จ' };
		} catch (err) {
			console.error('File upload error:', err);
			return fail(500, { message: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์' });
		}
	}
};
