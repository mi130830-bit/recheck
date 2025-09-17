<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	// [แก้ไข] เปลี่ยนมาใช้ $props()
	let { data, form } = $props<{ data: PageData; form?: ActionData }>();

	function confirmDelete(event: MouseEvent) {
		if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
			event.preventDefault();
		}
	}
</script>

<main class="container">
	<article>
		<header class="page-header">
			<h2>แก้ไขประเภทสินค้า</h2>
			<p class="sub-header">คุณกำลังแก้ไข: {data.category.name}</p>
		</header>

		<form method="POST" use:enhance>
			{#if form?.error}
				<div class="form-error">{form.error}</div>
			{/if}

			<label for="name">
				ชื่อประเภท *
				<input
					type="text"
					id="name"
					name="name"
					required
					value={form?.name ?? data.category.name}
					aria-invalid={!!form?.error}
				/>

			</label>
			{#if form?.error}
				<small class="error-text">{form.error}</small>
			{/if}

			<footer class="form-actions">
				<button type="submit" class="danger-btn" formaction="?/delete" on:click={confirmDelete}>
					ลบรายการนี้
				</button>
				<a href="/categories" role="button" class="cancel-btn">ยกเลิก</a>
				<button type="submit" class="save-btn" formaction="?/update">บันทึกการเปลี่ยนแปลง</button>
			</footer>

			{#if form?.deleteError}
				<p class="error-text" style="text-align: right; margin-top: 1rem;">{form.deleteError}</p>
			{/if}
		</form>
	</article>
</main>

<style>
	/* === Layout หลักของหน้า === */
	.container {
		[cite_start]max-width: 800px; [cite: 19]
		[cite_start]margin: 3rem auto; [cite: 20]
	}
	.page-header {
		margin-bottom: 2rem;
		text-align: center;
	}
	.sub-header {
		color: var(--pico-secondary);
		[cite_start]margin-top: -1rem; [cite: 21]
	}

	/* === สไตล์สำหรับฟอร์มและ Error === */
	.form-error {
		color: var(--pico-color-red-500);
		background-color: var(--pico-color-red-100);
		padding: 0.75rem;
		border-radius: var(--pico-border-radius);
		border-left: 4px solid var(--pico-invalid-border-color);
		[cite_start]margin-bottom: 1.5rem; [cite: 22]
	}
	.error-text {
		color: var(--pico-color-red-500);
		margin-top: calc(var(--pico-form-element-spacing-vertical) * -0.75);
		margin-bottom: var(--pico-form-element-spacing-vertical);
		display: block;
	}
	label {
		[cite_start]font-weight: 500; [cite: 23]
	}

	/* ================================================================ */
	/* === ส่วนท้ายฟอร์มและปุ่มทั้งหมด === */
	/* ================================================================ */

	.form-actions {
		display: flex;
		justify-content: flex-end; /* จัดให้กลุ่มปุ่มทั้งหมดชิดขวา */
		[cite_start]gap: 0.75rem; [cite: 24]
		margin-top: 2.5rem;
		padding-top: 1.5rem;
		[cite_start]border-top: 1px solid var(--pico-muted-border-color); [cite: 25]
	}

	/* 1. สไตล์ร่วมสำหรับ "ปุ่มทุกอัน"
  */
	.form-actions button,
	.form-actions a[role='button'] {
		/* --- ทำให้ขนาดเท่ากัน (ถ้าต้องการ) --- */
		/* flex: 1; [cite_start]*/ /* เอา comment ออกถ้าอยากให้ปุ่มยืดเท่ากัน */ [cite: 26]
		width: 180px; /* กำหนดความกว้างขั้นต่ำ */
		
		/* --- ขนาดและความสูง --- */
		padding: 0.75rem 1rem;
		height: 80px;
		/* --- รูปทรงและตัวอักษร --- */
		font-weight: bold;
		border: none;
		border-radius: 8px;
		text-decoration: none;
		color: #fff; /* กำหนดสีตัวอักษรเป็นสีขาวสำหรับทุกปุ่ม */
		display: inline-flex;
		[cite_start]align-items: center; [cite: 27]
		[cite_start]justify-content: center; [cite: 28]
		transition: background-color 0.2s;
		cursor: pointer;
	}

	/* 2. สไตล์สำหรับปุ่ม "ลบ" (สีแดง)
  */
	.danger-btn {
		[cite_start]background-color: #dc3545; [cite: 29]
	}
	.danger-btn:hover {
		background-color: #c82333;
	}

	/* 3. สไตล์สำหรับปุ่ม "ยกเลิก" (สีเทา)
  */
	.cancel-btn {
		background-color: #a39e9e;
	}
	.cancel-btn:hover {
		[cite_start]background-color: #7e7e7e; [cite: 30]
	}

	/* 4. สไตล์สำหรับปุ่ม "บันทึก" (สีเขียว)
  */
	.save-btn {
		background-color: #15cb24;
	}
	.save-btn:hover {
		background-color: #18810e;
	}
</style>