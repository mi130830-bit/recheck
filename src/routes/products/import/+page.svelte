<!-- Path: src/routes/products/import/+page.svelte (Final Updated Version) -->
<script lang="ts">
	import { enhance } from '$app/forms';
	export let form;
	let isLoading = false;
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
				ดาวน์โหลดเทมเพลตไฟล์ Excel <a href="/template.xlsx" download>ที่นี่</a>
			</li>
			<li>กรอกข้อมูลสินค้าลงในไฟล์ Excel **โดยระบุชื่อ "ผู้ขายสินค้า" ที่มีอยู่แล้วในระบบ**</li>
			<li>เลือกไฟล์ Excel ของคุณและกดปุ่ม "นำเข้าข้อมูล"</li>
		</ol>
	</article>

	{#if form?.message}
		<aside class:invalid={!form?.success} class:valid={form?.success}>
			<!-- ใช้ <pre> เพื่อให้แสดงผลข้อความหลายบรรทัดได้ถูกต้อง -->
			<pre>{form.message}</pre>
		</aside>
	{/if}

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={() => {
			isLoading = true;
			return async ({ update }) => {
				await update();
				isLoading = false;
			};
		}}
	>
		<!-- [ลบออก] เอา Dropdown เลือกผู้ขายออกไป -->
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
		white-space: pre-wrap; /* ทำให้ <pre> ตัดคำได้ */
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