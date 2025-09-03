<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	export let data;
	export let form; // รับข้อมูล form action
</script>

<main class="container">
	<article>
		<header class="page-header">
			<h1>แก้ไขข้อมูลผู้ขาย</h1>
			<p class="sub-header">คุณกำลังแก้ไข: {data.supplier.name}</p>
		</header>

		{#if form?.message}
			<p class="error">{form.message}</p>
		{/if}

		<form method="POST" action="?/update" use:enhance>
			<div class="grid">
				<label for="code">
					* รหัสผู้ขาย
					<input type="text" id="code" name="code" required value={data.supplier.code} />
				</label>
				<label for="name">
					* ชื่อผู้ขาย
					<input type="text" id="name" name="name" required value={data.supplier.name} />
				</label>
			</div>

			<label for="taxId">
				Tax ID
				<input type="text" id="taxId" name="taxId" value={data.supplier.taxId || ''} />
			</label>

			<div class="grid">
				<label for="phone">
					โทรศัพท์
					<input type="tel" id="phone" name="phone" value={data.supplier.phone || ''} />
				</label>
				<label for="email">
					E-mail
					<input type="email" id="email" name="email" value={data.supplier.email || ''} />
				</label>
			</div>

			<label for="address">ที่อยู่</label>
			<textarea id="address" name="address">{data.supplier.address || ''}</textarea>

			<footer class="form-actions">
				<a href="/suppliers" role="button">ยกเลิก</a>
				<button type="submit">บันทึกการเปลี่ยนแปลง</button>
			</footer>
			</form>
	</article>
</main>

<style>
	/* === Layout ทั่วไป === */
	.container {
		max-width: 800px; /* ขยายความกว้างเพื่อให้ดูดีขึ้น */
		margin: 2rem auto;
		padding: 1rem 2rem 2rem;
		background-color: #fff;
		border-radius: var(--pico-border-radius);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}
	.page-header {
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--pico-muted-border-color);
	}
	.page-header h1,
	.page-header p {
		margin: 0;
	}
	.sub-header {
		color: var(--pico-secondary);
		margin-top: 0.25rem;
	}
	.error {
		color: var(--pico-form-element-invalid-color);
		margin-bottom: 1rem;
	}

	/* === สไตล์ของฟอร์ม === */
	form > label,
	form > .grid {
		margin-bottom: 1.25rem;
	}

	input:focus,
	textarea:focus {
		--pico-form-element-focus-border-color: #15cb24;
		border-color: var(--pico-form-element-focus-border-color);
	}

	/* === ส่วนท้ายฟอร์มและปุ่ม (Form Actions) === */
	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--pico-muted-border-color);
	}

	.form-actions a[role='button'],
	.form-actions button {
		padding: 0.75rem 1.5rem;
		width: auto; /* ปรับความกว้างอัตโนมัติ */
		min-width: 150px; /* กำหนดความกว้างขั้นต่ำ */
		font-size: 1rem;
		font-weight: var(--pico-font-weight-bold, bold);
		border-radius: var(--pico-border-radius);
		margin: 0;
		text-align: center;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.2s ease-in-out;
	}

	/* ปุ่มยกเลิก (ปุ่มแรก) */
	.form-actions a[role='button'] {
		background-color: transparent;
		border: 1px solid var(--pico-secondary-border, #8692a1);
		color: var(--pico-secondary, #5c6570);
	}
	.form-actions a[role='button']:hover {
		background-color: var(--pico-secondary-hover, #d9dde2);
		border-color: var(--pico-secondary-hover, #8692a1);
		color: var(--pico-secondary-inverse, #29313d);
	}

	/* ปุ่มบันทึก (ปุ่มสุดท้าย) */
	.form-actions button {
		background-color: #15cb24;
		border: 1px solid #15cb24;
		color: #fff;
	}
	.form-actions button:hover {
		background-color: #26c217;
		border-color: #26c217;
	}
</style>