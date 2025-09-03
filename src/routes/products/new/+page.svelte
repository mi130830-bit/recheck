<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let barcode: string | null = form?.barcode ?? null;
	$: if (form?.success && !form.error) {
		barcode = null;
		// เมื่อสำเร็จ อาจจะ reset form ทั้งหมดถ้าต้องการ
		// document.querySelector('form')?.reset();
	}

	function generateBarcode() {
		const timestamp = Date.now().toString().slice(-8);
		const randomNumber = Math.floor(100 + Math.random() * 900);
		barcode = `${timestamp}${randomNumber}`;
	}
</script>

<main class="container">
	<article>
		<header class="page-header">
			<h2>เพิ่มรายการสินค้า</h2>
			<a href="/products/import" role="button" class="secondary outline">
				เพิ่มหลายรายการ (Excel)
			</a>
		</header>

		{#if form?.success}
			<p class="success">{form.message}</p>
		{/if}

		<form method="POST" use:enhance>
			{#if form?.error}
				<p class="error">{form.error}</p>
			{/if}

			<div class="form-grid">
				<div>
					<label for="barcode">รหัสบาร์โค้ด</label>
					<div class="barcode-group">
						<input type="text" id="barcode" name="barcode" bind:value={barcode} />
						<button type="button" on:click={generateBarcode} class="secondary outline">สร้าง</button>
					</div>
				</div>
				<div>
					<label for="name">* ชื่อสินค้า</label>
					<input type="text" id="name" name="name" value={form?.name ?? ''} required />
				</div>

				<div>
					<label for="alias">ชื่อย่อ/รหัสค้นหา</label>
					<input type="text" id="alias" name="alias" value={form?.alias ?? ''} />
				</div>

				<div>
					<label for="categoryId">ประเภทสินค้า</label>
					<select id="categoryId" name="categoryId" value={form?.categoryId ?? ''}>
						<option value="">-- ไม่ระบุ --</option>
						{#each data.categories as category (category.id)}
							<option value={category.id}>{category.name}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="costPrice">ต้นทุน</label>
					<input
						type="number"
						step="0.01"
						id="costPrice"
						name="costPrice"
						value={form?.costPrice ?? '0.00'}
					/>
				</div>
				<div>
					<label for="retailPrice">* ราคาปลีก</label>
					<input
						type="number"
						step="0.01"
						id="retailPrice"
						name="retailPrice"
						value={form?.retailPrice ?? ''}
						required
					/>
				</div>

				<div>
					<label for="wholesalePrice">ราคาส่ง</label>
					<input
						type="number"
						step="0.01"
						id="wholesalePrice"
						name="wholesalePrice"
						value={form?.wholesalePrice ?? ''}
					/>
				</div>
				<div>
					<label for="vatType">Vat</label>
					<select id="vatType" name="vatType" value={form?.vatType ?? 'none'}>
						<option value="none">ไม่มี Vat</option>
						<option value="include">ราคารวม Vat</option>
						<option value="exclude">ราคาไม่รวม Vat</option>
					</select>
				</div>

				<div>
					<label for="stockQuantity">จำนวนสินค้า</label>
					<input
						type="number"
						id="stockQuantity"
						name="stockQuantity"
						value={form?.stockQuantity ?? '0'}
					/>
				</div>
				<div>
					<label for="unitId">หน่วย</label>
					<select id="unitId" name="unitId" value={form?.unitId ?? ''}>
						<option value="">-- ไม่ระบุ --</option>
						{#each data.units as unit (unit.id)}
							<option value={unit.id}>{unit.name}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="reorderPoint">จุดสั่งซื้อ</label>
					<input
						type="number"
						id="reorderPoint"
						name="reorderPoint"
						value={form?.reorderPoint ?? ''}
					/>
				</div>
				<div>
					<label for="shelfLocation">ชั้นวางสินค้า</label>
					<input
						type="text"
						id="shelfLocation"
						name="shelfLocation"
						value={form?.shelfLocation ?? ''}
					/>
				</div>
			</div>

			<fieldset>
				<label for="supplierId">* ผู้ขายสินค้า</label>
				<select id="supplierId" name="supplierId" required value={form?.supplierId ?? ''}>
					<option value="" disabled>-- กรุณาเลือก --</option>
					{#each data.suppliers as supplier (supplier.id)}
						<option value={supplier.id}>{supplier.name}</option>
					{/each}
				</select>

				<label for="notes">หมายเหตุ</label>
				<textarea id="notes" name="notes" rows="3">{form?.notes ?? ''}</textarea>

				<div class="checkbox-group">
					<label
						><input
							type="checkbox"
							name="notTrackStock"
							checked={form?.notTrackStock === true}
						/> ไม่ตัดสต็อกเมื่อขาย</label
					>
				</div>
			</fieldset>

			<footer class="form-actions">
        <a href="/customers" role="button">ยกเลิก</a>
        <button type="submit">บันทึก</button>
      </footer>
			</form>
	</article>
</main>

<style>
	/* CSS ไม่มีการเปลี่ยนแปลง */
	:root {
		--color-mint-green: #28a745;
		--color-mint-green-hover: #218838;
		--color-text-on-mint: #ffffff;
		--color-danger-red: #dc3545;
		--color-danger-red-hover: #c82333;
		--color-muted-border: var(--pico-muted-border-color, #e1e1e1);
	}
	.container {
		max-width: 960px;
		margin: 2rem auto;
	}
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}
	.page-header h2,
	.page-header a {
		margin-bottom: 0;
	}
	.error {
		color: var(--pico-color-red-600);
		background-color: var(--pico-form-element-invalid-background-color);
		padding: 0.75rem;
		border-radius: var(--pico-border-radius);
		border-left: 4px solid var(--pico-invalid-border-color);
		margin-bottom: 1.5rem;
	}

	.success {
		color: var(--pico-color-green-600);
		background-color: hsla(130, 80%, 94%, 1);
		padding: 0.75rem;
		border-radius: var(--pico-border-radius);
		border-left: 4px solid var(--pico-color-green-500);
		margin-bottom: 1.5rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem 2rem;
		margin-bottom: 1.5rem;
	}
	.barcode-group {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1rem;
		align-items: stretch;
	}
	.barcode-group input,
	.barcode-group button {
		margin-bottom: 0;
	}
	fieldset {
		padding: 0;
		border: none;
	}
	.checkbox-group {
		display: flex;
		gap: 2rem;
		margin-top: 1rem;
	}
/* ================================================================ */
/* === ส่วนท้ายฟอร์มและปุ่ม (Form Actions) === */
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