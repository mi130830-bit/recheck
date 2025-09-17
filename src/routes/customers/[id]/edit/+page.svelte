<!-- src/routes/customers/[id]/edit/+page.svelte (ปรับปรุงสำหรับ Svelte 5) -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	// [แก้ไข] 1. ใช้ $props() เพื่อรับ data และ form
	let { data, form } = $props<PageData & ActionData>();
</script>

<main class="container">
	<article>
		<header class="page-header">
			<h1>แก้ไขข้อมูลสมาชิก</h1>
			<p class="sub-header">คุณกำลังแก้ไข: {data.customer.firstName}</p>
		</header>

		{#if form?.error}
			<div class="form-error">{form.error}</div>
		{/if}

		<form method="POST" use:enhance>
			<div class="form-grid">
				<label>
					รหัสสมาชิก *
					<!-- [ปรับปรุง] 2. ทำให้เป็น Sticky Form: แสดงค่าล่าสุดที่กรอกถ้ามี Error -->
					<input name="memberCode" value={form?.values?.memberCode ?? data.customer.memberCode} required />
				</label>
				<label>
					คำนำหน้า
					<input name="title" value={form?.values?.title ?? data.customer.title ?? ''} />
				</label>
			</div>

			<div class="form-grid">
				<label>
					ชื่อ *
					<input name="firstName" value={form?.values?.firstName ?? data.customer.firstName} required />
				</label>
				<label>
					นามสกุล
					<input name="lastName" value={form?.values?.lastName ?? data.customer.lastName ?? ''} />
				</label>
			</div>

			<div class="form-grid">
				<label>
					โทรศัพท์
					<input name="phone" value={form?.values?.phone ?? data.customer.phone ?? ''} />
				</label>
				<label>
					อีเมล
					<input type="email" name="email" value={form?.values?.email ?? data.customer.email ?? ''} />
				</label>
			</div>

			<label>
				ที่อยู่
				<textarea name="address" rows="3">{form?.values?.address ?? data.customer.address ?? ''}</textarea>
			</label>

			<label>
				ที่อยู่สำหรับจัดส่ง
				<textarea name="shippingAddress" rows="3">{form?.values?.shippingAddress ?? data.customer.shippingAddress ?? ''}</textarea>
			</label>

			<footer class="form-actions">
				<a href="/customers" role="button" class="secondary">ยกเลิก</a>
				<button type="submit">บันทึก</button>
			</footer>
		</form>
	</article>
</main>

<!-- สไตล์ยังคงเดิม เนื่องจากออกแบบมาได้ดีแล้ว -->
<style>
	.container { max-width: 800px; margin: 2rem auto; }
	.page-header { margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--pico-muted-border-color); }
	.page-header h1 { margin-bottom: 0.25rem; }
	.sub-header { color: var(--pico-secondary); margin: 0; }
	.form-error { color: #e53935; background: #fde9ea; padding: 0.75rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #e53935; }
	.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
	form > label, form > .form-grid { margin-bottom: 1.25rem; }
	label { display: flex; flex-direction: column; font-weight: 500; gap: 0.5rem; }
	.form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--pico-muted-border-color); }
	.form-actions a[role='button'], .form-actions button { padding: 0.75rem 1.5rem; width: 150px; font-size: 1rem; font-weight: bold; border-radius: var(--pico-border-radius); text-align: center; }
	.form-actions a[role='button'] { background-color: transparent; border: 1px solid var(--pico-secondary-border); color: var(--pico-secondary); }
	.form-actions button { background-color: #15cb24; border-color: #15cb24; color: #fff; }
</style>
