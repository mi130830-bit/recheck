<!-- Path: src/routes/customers/import/+page.svelte (NEW FILE) -->
<script lang="ts">
	import { enhance } from '$app/forms';
	export let form;
	let isLoading = false;
</script>
<svelte:head><title>นำเข้าข้อมูลสมาชิก</title></svelte:head>
<main class="container" style="max-width: 768px;">
	<h1>นำเข้าข้อมูลสมาชิกจาก Excel</h1>
	<article>
		<header><strong>ขั้นตอน</strong></header>
		<ol>
			<li>ดาวน์โหลดเทมเพลตไฟล์ Excel <a href="/template-customers.xlsx" download>ที่นี่</a></li>
			<li>กรอกข้อมูลสมาชิก (ช่องที่มี "บังคับ" ห้ามเว้นว่าง)</li>
			<li>เลือกไฟล์ Excel ของคุณและกดปุ่ม "นำเข้าข้อมูล"</li>
		</ol>
		<p><strong>ข้อควรระวัง:</strong> สมาชิกที่มี "รหัสสมาชิก" ซ้ำกันจะถูกข้ามไป</p>
	</article>
	{#if form?.message}<aside class:invalid={!form?.success} class:valid={form?.success}><pre>{form.message}</pre></aside>{/if}
	<form method="POST" enctype="multipart/form-data" use:enhance={() => {isLoading = true; form = undefined; return async ({ update }) => { await update(); isLoading = false; };}}>
		<label>เลือกไฟล์ Excel (.xlsx)<input type="file" name="excelFile" accept=".xlsx" required /></label>
		<button type="submit" aria-busy={isLoading} disabled={isLoading}>{#if isLoading} กำลังประมวลผล... {:else} นำเข้าข้อมูล {/if}</button>
	</form>
</main>
<style>
	aside { padding: 1rem; margin-bottom: 1rem; border-radius: var(--pico-border-radius); border-left-width: 4px; white-space: pre-wrap; word-break: break-word; }
	aside.invalid { background-color: var(--pico-form-element-invalid-background-color); color: var(--pico-form-element-invalid-color); border-left-color: var(--pico-invalid-border-color); }
	aside.valid { background-color: #d1e7dd; color: #0f5132; border-left-color: #badbcc; }
	pre { margin: 0; font-family: inherit; font-size: inherit; }
</style>