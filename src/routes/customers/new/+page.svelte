<!-- Path: src/routes/customers/new/+page.svelte (Refactored Version) -->

<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
</script>

<main class="container">
	<article>
		<header class="page-header">
			<h2>เพิ่มรายการสมาชิก</h2>
		</header>

		<form method="POST" use:enhance>
			{#if $page.form?.error}
				<!-- [ปรับปรุง] ใช้ชื่อคลาสที่สื่อความหมายมากขึ้น -->
				<div class="form-error">{$page.form.error}</div>
			{/if}

			<!-- ส่วน Grid ของฟอร์ม -->
			<div class="form-grid">
				<div class="legend">ข้อมูลส่วนตัวและข้อมูลติดต่อ</div>
				<div class="legend">ข้อมูลเพิ่มเติมและที่อยู่</div>

				<!-- รหัสสมาชิก / เลขบัตรประชาชน -->
				<div class="form-field">
					<label for="memberCode">* รหัสสมาชิก</label>
					<input type="text" id="memberCode" name="memberCode" required />
				</div>
				<div class="form-field">
					<label for="nationalId">เลขบัตรประชาชน</label>
					<input type="text" id="nationalId" name="nationalId" />
				</div>

				<!-- คำนำหน้า / เลขที่ภาษี -->
				<div class="form-field">
					<label for="title">คำนำหน้า</label>
					<select id="title" name="title">
						<option value="" selected>-</option>
						<option value="นาย">นาย</option>
						<option value="นาง">นาง</option>
						<option value="นางสาว">นางสาว</option>
					</select>
				</div>
				<div class="form-field">
					<label for="taxId">เลขที่ภาษี</label>
					<input type="text" id="taxId" name="taxId" />
				</div>

				<!-- ชื่อ / วันเกิด -->
				<div class="form-field">
					<label for="firstName">* ชื่อ</label>
					<input type="text" id="firstName" name="firstName" required />
				</div>
				<div class="form-field">
					<label for="dateOfBirth">วันเกิด</label>
					<input type="date" id="dateOfBirth" name="dateOfBirth" />
				</div>

				<!-- นามสกุล / จำกัดวงเงิน -->
				<div class="form-field">
					<label for="lastName">นามสกุล</label>
					<input type="text" id="lastName" name="lastName" />
				</div>
				<div class="form-field">
					<label for="creditLimit">จำกัดวงเงิน</label>
					<input type="number" step="0.01" id="creditLimit" name="creditLimit" />
				</div>

				<!-- เบอร์โทร / E-mail -->
				<div class="form-field">
					<label for="phone">เบอร์โทร</label>
					<input type="tel" id="phone" name="phone" />
				</div>
				<div class="form-field">
					<label for="email">E-mail</label>
					<input type="email" id="email" name="email" />
				</div>

				<!-- ที่อยู่ / ที่อยู่จัดส่ง -->
				<div class="form-field">
					<label for="address">ที่อยู่</label>
					<textarea id="address" name="address" rows="3"></textarea>
				</div>
				<div class="form-field">
					<label for="shippingAddress">ที่อยู่จัดส่งสินค้า</label>
					<textarea id="shippingAddress" name="shippingAddress" rows="3"></textarea>
				</div>
			</div>

			<!-- หมายเหตุ -->
			<fieldset>
				<label for="notes">หมายเหตุ</label>
				<textarea id="notes" name="notes" rows="4"></textarea>
			</fieldset>

			<!-- [ปรับปรุง] ส่วน Footer และปุ่ม ให้มีเส้นคั่นชัดเจน -->
			<footer class="form-actions">
        <a href="/customers" role="button">ยกเลิก</a>
        <button type="submit">บันทึก</button>
      </footer>
		</form>
	</article>
</main>

<style>
	/* === General Layout === */
	.container {
		max-width: 960px;
		margin: 2rem auto;
	}

	.page-header {
		margin-bottom: 1.5rem;
	}

	/* === Form Specific Styles === */
	.form-error {
		color: var(--pico-color-red-500);
		background-color: var(--pico-color-red-100);
		padding: 0.75rem;
		border-radius: var(--pico-border-radius);
		border-left: 4px solid var(--pico-invalid-border-color);
		margin-bottom: 1.5rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.25rem 2rem;
		margin-bottom: 1.5rem;
	}

	.legend {
		font-weight: bold;
		font-size: 1.1em;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--pico-muted-border-color); /* [แก้ไข] ลดความหนาเส้น */
		margin-bottom: 0.25rem;
	}

	.form-field {
		display: flex;
		flex-direction: column;
	}

	fieldset {
		padding: 0;
		border: none;
		margin-bottom: 1rem;
	}
	fieldset label {
		font-weight: bold;
	}

	/* ================================================================ */
	/* === Form Actions (Footer & Buttons) === */
	/* ================================================================ */

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--pico-muted-border-color);
	}

	/* 
    1. สไตล์ร่วมสำหรับ "ปุ่มทุกอัน" ใน footer
       *** นี่คือจุดหลักที่คุณต้องปรับขนาด ความกว้าง และความสูง ***
  */
	.form-actions a[role='button'],
	.form-actions button {
		/* --- ปรับขนาดตรงนี้ --- */
		padding: 0.75rem 1.5rem; /* ค่าตัวอย่าง: บน-ล่าง 0.75rem, ซ้าย-ขวา 1.5rem */
		width: 150px; /* ความกว้างขั้นต่ำของปุ่ม */
		/* ---------------------- */

		font-size: 1rem;
		font-weight: var(--pico-font-weight-bold, bold);
		border-radius: var(--pico-border-radius);
		margin: 0;
		text-align: center;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.2s ease-in-out;
	}

	/* 2. สไตล์สำหรับปุ่ม "ยกเลิก" (ปุ่มตัวแรก) */
	.form-actions a:first-child {
		background-color: transparent;
		border: 1px solid var(--pico-secondary-border, #8692a1);
		color: var(--pico-secondary, #5c6570);
	}
	.form-actions a:first-child:hover {
		background-color: var(--pico-secondary, #016ef4);
		border-color: var(--pico-secondary, #5c6570);
		color: var(--pico-primary-inverse, #fff);
	}

	/* 3. สไตล์สำหรับปุ่ม "บันทึก" (ปุ่มตัวสุดท้าย) */
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