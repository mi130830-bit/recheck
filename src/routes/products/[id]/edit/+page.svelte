<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	// [แก้ไข] ใช้ $props() เพื่อรับ data และ form ตามมาตรฐาน Svelte 5
	// นี่คือสาเหตุหลักของ Error ที่คุณเจอ
	let { data, form } = $props<PageData & ActionData>();
	
	// [ปรับปรุง] ใช้ $derived เพื่อสร้างตัวแปร product ที่จะอัปเดตอัตโนมัติเมื่อ data เปลี่ยน
	// ทำให้โค้ดสะอาดขึ้น ไม่ต้องใช้ $: 
	let product = $derived(data.product);

	let name = data.product.name;
	let alias = data.product.alias;
	let costPrice = data.product.costPrice;
	let retailPrice = data.product.retailPrice;
	let wholesalePrice = data.product.wholesalePrice;
	let stockQuantity = data.product.stockQuantity;
	let reorderPoint = data.product.reorderPoint;
	let shelfLocation = data.product.shelfLocation;
	let notes = data.product.notes;
	let vatType = data.product.vatType;
	let categoryId = data.product.categoryId;
	let unitId = data.product.unitId;
	let supplierId = data.product.supplierId;

	// --- จัดการค่า Checkbox ---
	let allowPriceEdit = data.product.allowPriceEdit;
	let notTrackStock = !data.product.trackStock;
</script>


<main class="container">
	<article>
		<header class="page-header">
			<h2>แก้ไขรายการสินค้า: {data.product.name}</h2>
		</header>

		<form method="POST" action="?/update" use:enhance>
			{#if form?.error}
				<p class="error">{form.error}</p>
			{/if}

			<div class="form-grid">
				<div>
					<label for="barcode">รหัสบาร์โค้ด (ไม่สามารถแก้ไขได้)</label>
					<input
						type="text"
						id="barcode"
						name="barcode"
						value={data.product.barcode || 'ไม่มี'}
						readonly
					/>
				</div>
				<div>
					<label for="name">* ชื่อสินค้า</label>
					<input type="text" id="name" name="name" bind:value={name} required />
				</div>
				<div>
					<label for="alias">ชื่อย่อ/รหัสค้นหา</label>
					<input type="text" id="alias" name="alias" bind:value={alias} />
				</div>
				<div>
					<label for="categoryId">ประเภทสินค้า</label>
					<select id="categoryId" name="categoryId" bind:value={categoryId}>
						<option value={null}>-- ไม่ระบุ --</option>
						{#each data.categories as category (category.id)}
							<option value={category.id}>{category.name}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="costPrice">ต้นทุน</label>
					<input type="number" step="0.01" id="costPrice" name="costPrice" bind:value={costPrice} />
				</div>
				<div>
					<label for="retailPrice">* ราคาปลีก</label>
					<input
						type="number"
						step="0.01"
						id="retailPrice"
						name="retailPrice"
						bind:value={retailPrice}
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
						bind:value={wholesalePrice}
					/>
				</div>
				<div>
					<label for="vatType">Vat</label>
					<select id="vatType" name="vatType" bind:value={vatType}>
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
						bind:value={stockQuantity}
					/>
				</div>
				<div>
					<label for="unitId">หน่วย</label>
					<select id="unitId" name="unitId" bind:value={unitId}>
						<option value={null}>-- ไม่ระบุ --</option>
						{#each data.units as unit (unit.id)}
							<option value={unit.id}>{unit.name}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="reorderPoint">จุดสั่งซื้อ</label>
					<input type="number" id="reorderPoint" name="reorderPoint" bind:value={reorderPoint} />
				</div>
				<div>
					<label for="shelfLocation">ชั้นวางสินค้า</label>
					<input
						type="text"
						id="shelfLocation"
						name="shelfLocation"
						bind:value={shelfLocation}
					/>
				</div>
			</div>
			<fieldset>
				<label for="supplierId">* ผู้ขายสินค้า</label>
				<select id="supplierId" name="supplierId" required bind:value={supplierId}>
					<option value={null} disabled>-- กรุณาเลือก --</option>
					{#each data.suppliers as supplier (supplier.id)}
						<option value={supplier.id}>{supplier.name}</option>
					{/each}
				</select>

				<label for="notes">หมายเหตุ</label>
				<textarea id="notes" name="notes" rows="3" bind:value={notes}></textarea>

				<div class="checkbox-group">
					<label>
						<input type="checkbox" name="notTrackStock" bind:checked={notTrackStock} />
						ไม่ตัดสต็อกเมื่อขาย
					</label>
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
	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem 2rem;
		margin-bottom: 1.5rem;
	}
	input[readonly] {
		background-color: var(--pico-muted-background-color);
		cursor: not-allowed;
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