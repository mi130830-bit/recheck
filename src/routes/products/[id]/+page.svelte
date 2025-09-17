<!-- src/routes/products/[id]/+page.svelte (แก้ไขสำหรับ Svelte 5) -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	// [แก้ไข] ใช้ $props() เพื่อรับ data และ form ตามมาตรฐาน Svelte 5
	let { data, form } = $props<PageData & ActionData>();

	// [ปรับปรุง] ใช้ $derived เพื่อสร้างตัวแปรที่อัปเดตอัตโนมัติตาม data ที่รับมา
	// สะอาดกว่าการใช้ $: product = data.product
	let product = $derived(data.product);
</script>

<div class="header-container">
	<h1>รายละเอียดสินค้า: {product.name}</h1>
	<div class="actions">
		<a href="/products/{product.id}/history" role="button" class="secondary outline history-btn">
			ดูประวัติสต็อก
		</a>
		<a href="/products/{product.id}/edit" role="button" class="edit-btn">แก้ไขข้อมูล</a>
	</div>
</div>

<div class="details-grid">
	<!-- ส่วนรูปภาพและการอัปโหลด -->
	<article class="image-panel">
		<header>รูปภาพสินค้า</header>
		<img
			src={product.imageUrl || '/placeholder.png'}
			alt={product.name}
			class="main-product-image"
		/>

		<form
			method="POST"
			action="?/updateImage"
			enctype="multipart/form-data"
			use:enhance={() => {
				return async ({ update }) => {
					// ไม่ reset form แต่ให้ SvelteKit อัปเดต `data` จาก load function ใหม่
					await update({ reset: false });
				};
			}}
		>
			<label for="productImage">อัปโหลดรูปภาพใหม่</label>
			<input type="file" id="productImage" name="productImage" accept="image/*" required />
			<button type="submit" class="submit-btn">บันทึกรูปภาพ</button>

			{#if form?.success}
				<p class="success-message">{form.message}</p>
			{:else if form?.message}
				<p class="error-message">{form.message}</p>
			{/if}
		</form>
	</article>

	<!-- ส่วนรายละเอียดสินค้า -->
	<article class="info-panel">
		<header>ข้อมูลทั่วไป</header>
		<div class="info-grid">
			<strong>ชื่อสินค้า</strong><span>{product.name}</span>
			<strong>บาร์โค้ด</strong><span>{product.barcode || '-'}</span>
			<strong>ประเภท</strong><span>{product.category?.name || '-'}</span>
			<strong>หน่วยนับ</strong><span>{product.unit?.name || '-'}</span>
			<strong>จำนวนคงคลัง</strong><span>{product.stockQuantity} ชิ้น</span>
			<strong>จุดสั่งซื้อ (Reorder)</strong><span>{product.reorderPoint || '-'}</span>
			<strong>ตำแหน่งจัดเก็บ</strong><span>{product.shelfLocation || '-'}</span>
			<strong>ผู้ขาย</strong><span>{product.supplier?.name || '-'}</span>
		</div>
		<hr />
		<header>ข้อมูลราคา</header>
		<div class="info-grid">
			<strong>ราคาต้นทุน</strong><span>{product.costPrice.toFixed(2)} บาท</span>
			<strong>ราคาขายปลีก</strong><span>{product.retailPrice.toFixed(2)} บาท</span>
			<strong>ราคาขายส่ง</strong><span>{product.wholesalePrice?.toFixed(2) || '-'} บาท</span>
		</div>
	</article>
</div>

<!-- สไตล์ยังคงเดิม เนื่องจากออกแบบมาได้ดีและเข้ากันอยู่แล้ว -->
<style>
	:root {
		--mint-green: #15cb24;
		--mint-green-hover: #26c217;
		--mint-green-light: #f0fafa;
		--text-color-on-mint: #ffffff;
		--danger-red: #c62828;
	}
	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}
	.header-container h1 {
		font-size: 1.75rem;
	}
	.actions {
		display: flex;
		gap: 0.5rem;
	}
	.actions a[role='button'] {
		border-radius: 20px;
		font-weight: 500;
	}
	.edit-btn {
		--pico-background-color: var(--mint-green);
		--pico-border-color: var(--mint-green);
		--pico-color: var(--text-color-on-mint);
	}
	.edit-btn:hover {
		--pico-background-color: var(--mint-green-hover);
		--pico-border-color: var(--mint-green-hover);
	}
	.history-btn {
		--pico-background-color: transparent;
		--pico-border-color: var(--mint-green);
		--pico-color: var(--mint-green);
	}
	.history-btn:hover {
		--pico-background-color: var(--mint-green-light);
		--pico-border-color: var(--mint-green-hover);
		--pico-color: var(--mint-green-hover);
	}
	.details-grid {
		display: grid;
		grid-template-columns: 350px 1fr;
		gap: 1.5rem;
		align-items: start;
	}
	.details-grid article {
		padding: 1.5rem;
		border-radius: 8px;
	}
	.info-panel header,
	.image-panel header {
		font-size: 1.2rem;
		font-weight: 600;
		color: var(--pico-h5-color);
		margin-bottom: 1.25rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--pico-muted-border-color);
	}
	.main-product-image {
		width: 100%;
		aspect-ratio: 1 / 1;
		object-fit: cover;
		border-radius: var(--pico-border-radius);
		border: 1px solid var(--pico-card-border-color);
	}
	.image-panel form {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.submit-btn {
		background-color: var(--mint-green);
		border-color: var(--mint-green);
		color: var(--text-color-on-mint);
		border-radius: 20px;
		font-weight: 500;
	}
	.submit-btn:hover {
		background-color: var(--mint-green-hover);
		border-color: var(--mint-green-hover);
	}
	.info-grid {
		display: grid;
		grid-template-columns: 150px 1fr;
		gap: 0.85rem 1rem;
		align-items: center;
	}
	.info-grid strong {
		color: var(--pico-h6-color);
		font-weight: 600;
	}
	.success-message {
		padding-top: 0.5rem;
		text-align: center;
		color: var(--mint-green);
		font-weight: 500;
	}
	.error-message {
		padding-top: 0.5rem;
		text-align: center;
		color: var(--danger-red);
		font-weight: 500;
	}
</style>
