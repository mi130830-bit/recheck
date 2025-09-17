<!-- src/routes/products/import/+page.svelte (ปรับปรุงสำหรับ Svelte 5) -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	// [แก้ไข] 1. ใช้ $props() เพื่อรับ form prop
	let { form } = $props<ActionData>();

	// [ปรับปรุง] 2. ใช้ $state สำหรับจัดการ State ที่เปลี่ยนแปลงใน UI
	let isLoading = $state(false);
</script>

<svelte:head>
	<title>นำเข้าสินค้าจาก Excel</title>
</svelte:head>

<main class="container" style="max-width: 768px;">
	<h1>นำเข้าสินค้าจาก Excel</h1>

	<article>
		<header><strong>ขั้นตอนการนำเข้า</strong></header>
		<ol>
			<li>
				ดาวน์โหลดเทมเพลตไฟล์ Excel <a href="/template-products.xlsx" download>ที่นี่</a>
			</li>
			<li>กรอกข้อมูลสินค้าลงในไฟล์ Excel (คอลัมน์ "ชื่อผู้ขาย" ต้องตรงกับชื่อที่มีอยู่แล้วในระบบ)</li>
			<li>เลือกไฟล์ Excel ของคุณและกดปุ่ม "นำเข้าข้อมูล"</li>
		</ol>
		<p><strong>ข้อควรระวัง:</strong> สินค้าที่มี "รหัสบาร์โค้ด" ซ้ำกับที่มีอยู่แล้วในระบบจะถูกข้ามไป</p>
	</article>

	{#if form?.message}
		<aside class:invalid={!form?.success} class:valid={form?.success}>
			<pre>{form.message}</pre>
		</aside>
	{/if}

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={() => {
			isLoading = true; // เริ่ม loading
			return async ({ update }) => {
				await update(); // รอให้ SvelteKit อัปเดต form prop
				isLoading = false; // หยุด loading
			};
		}}
	>
		<label for="excelFile">
			เลือกไฟล์ Excel (.xlsx)
			<input type="file" id="excelFile" name="excelFile" accept=".xlsx" required />
		</label>

		<button type="submit" aria-busy={isLoading} disabled={isLoading}>
			{#if isLoading}
				กำลังประมวลผล...
			{:else}
				นำเข้าข้อมูล
			{/if}
		</button>
	</form>
</main>

<style>
	aside {
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: var(--pico-border-radius);
		border-left-width: 4px;
		white-space: pre-wrap; /* ทำให้ <pre> ตัดคำและขึ้นบรรทัดใหม่ได้ */
		word-break: break-word;
	}
	aside.invalid {
		background-color: var(--pico-form-element-invalid-background-color);
		color: var(--pico-form-element-invalid-color);
		border-left-color: var(--pico-invalid-border-color);
	}
	aside.valid {
		background-color: #d1e7dd;
		color: #0f5132;
		border-left-color: #badbcc;
	}
	pre {
		margin: 0;
		font-family: inherit;
		font-size: inherit;
	}
</style>
