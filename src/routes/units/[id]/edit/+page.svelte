<!-- src/routes/units/[id]/edit/+page.svelte -->

<script lang="ts">
	import { enhance } from '$app/forms';
	export let data;
	export let form;

	function confirmDelete(event: MouseEvent) {
		if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
			event.preventDefault();
		}
	}
</script>

<main class="container">
	<article>
		<header class="page-header">
			<h2>แก้ไขหน่วยสินค้า</h2>
			<p class="sub-header">คุณกำลังแก้ไข: {data.unit.name}</p>
		</header>
		<form method="POST" use:enhance>
			{#if form?.error}
				<div class="form-error">{form.error}</div>
			{/if}
			<label for="name">
				ชื่อหน่วย *
				<input type="text" id="name" name="name" required value={form?.name ?? data.unit.name} aria-invalid={!!form?.error} />
			</label>
			{#if form?.error}
				<small class="error-text">{form.error}</small>
			{/if}
			<footer class="form-actions">
				<button type="submit" class="danger-btn" formaction="?/delete" on:click={confirmDelete}>ลบรายการนี้</button>
				<a href="/units" role="button" class="cancel-btn">ยกเลิก</a>
				<button type="submit" class="save-btn" formaction="?/update">บันทึกการเปลี่ยนแปลง</button>
			</footer>
			{#if form?.deleteError}
				<p class="error-text">{form.deleteError}</p>
			{/if}
		</form>
	</article>
</main>
<style>
	/* === Layout หลักของหน้า === */
	.container {
		max-width: 800px;
		margin: 3rem auto;
	}
	.page-header {
		margin-bottom: 2rem;
		text-align: center;
	}
	.sub-header {
		color: var(--pico-secondary);
		margin-top: -1rem;
	}

	/* === สไตล์สำหรับฟอร์มและ Error === */
	.form-error {
		color: var(--pico-color-red-500);
		background-color: var(--pico-color-red-100);
		padding: 0.75rem;
		border-radius: var(--pico-border-radius);
		border-left: 4px solid var(--pico-invalid-border-color);
		margin-bottom: 1.5rem;
	}
	.error-text {
		color: var(--pico-color-red-500);
		margin-top: calc(var(--pico-form-element-spacing-vertical) * -0.75);
		margin-bottom: var(--pico-form-element-spacing-vertical);
		display: block;
	}
	label {
		font-weight: 500;
	}

	/* ================================================================ */
	/* === [แก้ไข] ส่วนท้ายฟอร์มและปุ่มทั้งหมด === */
	/* ================================================================ */

	.form-actions {
		display: flex;
		justify-content: flex-end; /* จัดให้กลุ่มปุ่มทั้งหมดชิดขวา */
		gap: 0.75rem; /* ระยะห่างระหว่างปุ่ม */
		margin-top: 2.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--pico-muted-border-color);
	}

	/* 
    1. สไตล์ร่วมสำหรับ "ปุ่มทุกอัน"
       *** ปรับขนาดและรูปทรงของปุ่มทั้งหมดที่นี่ ***
  */
	.form-actions button,
	.form-actions a[role='button'] {
		/* --- ทำให้ขนาดเท่ากัน (ถ้าต้องการ) --- */
		flex: 1; */ /* เอา comment ออกถ้าอยากให้ปุ่มยืดเท่ากัน */
		width: 200px; /* กำหนดความกว้างขั้นต่ำ */
		
		/* --- ขนาดและความสูง --- */
		padding: 0.75rem 1rem;
		height: 80px;

		/* --- รูปทรงและตัวอักษร --- */
		font-weight: bold;
		border: none;
		border-radius: 10px;
		text-decoration: none;
		color: #fff; /* กำหนดสีตัวอักษรเป็นสีขาวสำหรับทุกปุ่ม */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.2s;
		cursor: pointer;
	}

	/* 
    2. สไตล์สำหรับปุ่ม "ลบ" (สีแดง)
  */
	.danger-btn {
		background-color: #dc3545;
	}
	.danger-btn:hover {
		background-color: #c82333;
	}

	/* 
    3. สไตล์สำหรับปุ่ม "ยกเลิก" (สีส้ม)
  */
	.cancel-btn {
		background-color: #a39e9e;
	}
	.cancel-btn:hover {
		background-color: #7e7e7e;
	}

	/* 
    4. สไตล์สำหรับปุ่ม "บันทึก" (สีเขียว)
  */
	.save-btn {
		background-color: #15cb24;
	}
	.save-btn:hover {
		background-color: #18810e;
	}
</style>