<!-- src/routes/categories/new/+page.svelte -->

<script lang="ts">
	import { enhance } from '$app/forms';
	export let form; // รับข้อมูลและ Error จาก server action
</script>

<main class="container">
	<article>
		<header class="page-header">
			<h2>เพิ่มประเภทสินค้าใหม่</h2>
		</header>

		<form method="POST" use:enhance>
			<!-- แสดงข้อความ Error ถ้ามี -->
			{#if form?.error}
				<div class="form-error">{form.error}</div>
			{/if}

			<!-- ช่องกรอกข้อมูล -->
			<label for="name">
				ชื่อประเภท *
				<input
					type="text"
					id="name"
					name="name"
					required
					value={form?.name ?? ''}
					aria-invalid={!!form?.error}
				/>
			</label>
			{#if form?.error}
				<small class="error-text">{form.error}</small>
			{/if}

			<!-- ปุ่มยกเลิกและบันทึก -->
			<footer class="form-actions">
				<a href="/categories" role="button">ยกเลิก</a>
				<button type="submit">บันทึก</button>
			</footer>
		</form>
	</article>
</main>

<style>
	/* === Layout หลักของหน้า === */
	.container {
		max-width: 700px; /* ทำให้ฟอร์มไม่กว้างเกินไป */
		margin: 1.5rem auto;
	}

	.page-header {
		margin-bottom: 2rem;
		text-align: center;
	}

	/* === สไตล์สำหรับฟอร์มและ Error === */
	.form-error {
		/* ใช้สไตล์เดียวกับหน้ารวม */
		color: var(--pico-color-red-500);
		background-color: var(--pico-color-red-100);
		padding: 0.75rem;
		border-radius: var(--pico-border-radius);
		border-left: 4px solid var(--pico-invalid-border-color);
		margin-bottom: 1.5rem;
	}
	.error-text {
		color: var(--pico-color-red-500);
		margin-top: -0.75rem;
		display: block;
	}
	label {
		font-weight: 700;
	}

	/* === ส่วนท้ายฟอร์มและปุ่ม === */
	.form-actions {
		display: flex;
		justify-content: flex-end; /* จัดปุ่มชิดขวา */
		gap: 0.75rem;
		margin-top: 0.25rem;
		padding-top: 0.5rem;
		border-top: 6px solid var(--pico-muted-border-color);
	}

	/* สไตล์ร่วมสำหรับปุ่มทุกอัน */
	.form-actions a[role='button'],
	.form-actions button {
		height: 60px;
		width: 120px;
		padding: center;
	}
	    /*2. สไตล์สำหรับปุ่ม "ยกเลิก" (สีแดง)  *** ปรับสีปุ่มยกเลิกที่นี่ ***  */
	.form-actions a[role='button'] {
		background-color: #e53306; /* สีปกติ */
		color: #fff;
	}
	.form-actions a[role='button']:hover {
		background-color: #bc0a0a; /* สีตอนเอาเมาส์ไปชี้ (เข้มขึ้น) */
	}

	/*     3. สไตล์สำหรับปุ่ม "บันทึก" (สีเขียว)       *** ปรับสีปุ่มบันทึกที่นี่ ***  */
	.form-actions button {
		background-color: #15cb24; /* สีปกติ */
		color: #fff;
	}
	.form-actions button:hover {
		background-color: #26c217; /* สีตอนเอาเมาส์ไปชี้ (เข้มขึ้นเล็กน้อย) */
	}
</style>