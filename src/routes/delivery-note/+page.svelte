<!-- src/routes/suppliers/[id]/edit/+page.svelte (จัดระเบียบใหม่) -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	// [แก้ไข] ใช้ $props() เพื่อรับ data และ form ตามมาตรฐาน Svelte 5
	let { data, form } = $props<PageData & ActionData>();

	// ใช้ $derived เพื่อให้ตัวแปร supplier อัปเดตตาม data ที่รับมา
	let supplier = $derived(data.supplier);
</script>

<svelte:head>
	<title>แก้ไขข้อมูล: {supplier.name}</title>
</svelte:head>

<main class="container">
	<article>
		<header class="page-header">
			<h1>แก้ไขข้อมูลผู้ขาย</h1>
			<p class="sub-header">คุณกำลังแก้ไข: <strong>{supplier.name}</strong></p>
		</header>

		{#if form?.message}
			<aside class="error-message">
				<strong>เกิดข้อผิดพลาด:</strong> {form.message}
			</aside>
		{/if}

		<form method="POST" action="?/update" use:enhance>
			<div class="grid">
				<label>
					รหัสผู้ขาย *
					<input
						type="text"
						name="code"
						required
						value={form?.values?.code ?? supplier.code}
					/>
				</label>
				<label>
					ชื่อผู้ขาย *
					<input
						type="text"
						name="name"
						required
						value={form?.values?.name ?? supplier.name}
					/>
				</label>
			</div>

			<label>
				Tax ID
				<input type="text" name="taxId" value={form?.values?.taxId ?? supplier.taxId ?? ''} />
			</label>

			<div class="grid">
				<label>
					โทรศัพท์
					<input type="tel" name="phone" value={form?.values?.phone ?? supplier.phone ?? ''} />
				</label>
				<label>
					E-mail
					<input type="email" name="email" value={form?.values?.email ?? supplier.email ?? ''} />
				</label>
			</div>

			<label>
				ที่อยู่
				<textarea name="address">{form?.values?.address ?? supplier.address ?? ''}</textarea>
			</label>

			<footer class="form-footer">
				<a href="/suppliers" role="button" class="secondary">ยกเลิก</a>
				<button type="submit">บันทึกการเปลี่ยนแปลง</button>
			</footer>
		</form>
	</article>
</main>

<style>
	.container {
		max-width: 800px;
		margin: 2rem auto;
	}
	.page-header {
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--pico-muted-border-color);
	}
	.sub-header {
		color: var(--pico-secondary);
	}
	.error-message {
		background-color: var(--pico-form-element-invalid-background-color);
		color: var(--pico-form-element-invalid-color);
		border-left: 4px solid var(--pico-invalid-border-color);
		padding: 1rem;
		margin-bottom: 1.5rem;
	}
	.form-footer {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--pico-muted-border-color);
	}
</style>
