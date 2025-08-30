<!-- Path: src/routes/suppliers/import/+page.svelte (Final Working Version) -->
<script lang="ts">
	import { enhance } from '$app/forms';
	export let form;
	let isLoading = false;
</script>

<svelte:head>
	<title>นำเข้าข้อมูลผู้ขาย</title>
</svelte:head>

<main class="container" style="max-width: 768px;">
	<h1>นำเข้าข้อมูลผู้ขายจาก Excel</h1>

	<article>
		<header><strong>ขั้นตอนการนำเข้า</strong></header>
		<ol>
			<li>
				ดาวน์โหลดเทมเพลตไฟล์ Excel <a href="/template-suppliers.xlsx" download>ที่นี่</a>
			</li>
			<li>กรอกข้อมูลผู้ขายลงในไฟล์ Excel (ช่องที่มีคำว่า "บังคับ" ห้ามเว้นว่าง)</li>
			<li>เลือกไฟล์ Excel ของคุณและกดปุ่ม "นำเข้าข้อมูล"</li>
		</ol>
		<p><strong>ข้อควรระวัง:</strong> ผู้ขายที่มี "รหัสผู้ขาย" ซ้ำกับที่มีอยู่แล้วในระบบจะถูกข้ามไป</p>
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
			isLoading = true;
			form = undefined; 
			return async ({ update }) => {
				await update();
				isLoading = false;
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
		white-space: pre-wrap;
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