<script lang="ts">
	import { enhance } from '$app/forms';
	export let data;
	export let form;
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
					<input name="memberCode" value={data.customer.memberCode} required />
				</label>
				<label>
					คำนำหน้า
					<input name="title" value={data.customer.title || ''} />
				</label>
			</div>

			<div class="form-grid">
				<label>
					ชื่อ *
					<input name="firstName" value={data.customer.firstName} required />
				</label>
				<label>
					นามสกุล
					<input name="lastName" value={data.customer.lastName || ''} />
				</label>
			</div>

			<div class="form-grid">
				<label>
					โทรศัพท์
					<input name="phone" value={data.customer.phone || ''} />
				</label>
				<label>
					อีเมล
					<input name="email" value={data.customer.email || ''} />
				</label>
			</div>

			<label>
				ที่อยู่
				<textarea name="address" rows="3">{data.customer.address || ''}</textarea>
			</label>

			<label>
				ที่อยู่สำหรับจัดส่ง
				<textarea name="shippingAddress" rows="3">{data.customer.shippingAddress || ''}</textarea>
			</label>

			<footer class="form-actions">
				<a href="/customers" role="button">ยกเลิก</a>
				<button type="submit">บันทึก</button>
			</footer>
		</form>
	</article>
	</main>

<style>
	/* === Layout ทั่วไป === */
	.container {
		max-width: 800px;
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
	.page-header h1 {
		margin-bottom: 0.25rem;
	}
	.sub-header {
		color: var(--pico-secondary);
		margin: 0;
	}

	/* === สไตล์ของฟอร์ม === */
	.form-error {
		color: #e53935;
		background: #fde9ea;
		padding: 0.75rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
		border-left: 4px solid #e53935;
	}
	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
	}
	form > label,
	form > .form-grid {
		margin-bottom: 1.25rem;
	}
	label {
		display: flex;
		flex-direction: column;
		font-weight: 500;
		gap: 0.5rem;
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
		width: 150px;
		font-size: 1rem;
		font-weight: var(--pico-font-weight-bold, bold);
		border-radius: var(--pico-border-radius);
		margin: 0;
		text-align: center;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.2s ease-in-out;
	}
	
	.form-actions a:first-child {
		background-color: transparent;
		border: 1px solid var(--pico-secondary-border, #8692a1);
		color: var(--pico-secondary, #5c6570);
	}
	.form-actions a:first-child:hover {
		background-color: var(--pico-secondary-hover, #d9dde2);
		border-color: var(--pico-secondary-hover, #8692a1);
		color: var(--pico-secondary-inverse, #29313d);
	}
	
	.form-actions button:last-child {
		background-color: #15cb24;
		border: 1px solid #15cb24;
		color: #fff;
	}
	.form-actions button:last-child:hover {
		background-color: #26c217;
		border-color: #26c217;
	}
</style>