<!-- src/routes/products/new/+page.svelte (ปรับปรุงสำหรับ Svelte 5) -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import { onMount } from 'svelte';

	// [แก้ไข] 1. ใช้ $props() เพื่อรับข้อมูล data และ form
	let { data, form } = $props<PageData & ActionData>();

	// [ปรับปรุง] 2. ใช้ $state สำหรับ State ที่เปลี่ยนแปลงในหน้านี้
	let barcode = $state<string | null>(null);

	// [ปรับปรุง] 3. ใช้ $effect สำหรับ Logic ที่ทำงานเมื่อ State เปลี่ยนแปลง
	$effect(() => {
		// ถ้า form ส่งค่า success กลับมา และไม่มี error ให้เคลียร์ฟอร์ม
		if (form?.success && !form?.error) {
			const formElement = document.querySelector('form');
			if (formElement) {
				formElement.reset(); // Reset ค่าในฟอร์มทั้งหมด
				barcode = null; // เคลียร์ค่า barcode โดยเฉพาะ
			}
		}

		// อัปเดตค่า barcode ถ้ามีค่าส่งกลับมาจาก form action (กรณีเกิด error)
		if (form?.values?.barcode) {
			barcode = form.values.barcode;
		}
	});

	// --- Functions (ไม่มีการเปลี่ยนแปลง) ---
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

		<form
			method="POST"
			use:enhance={() => {
				return async ({ update }) => {
					// ให้ SvelteKit จัดการอัปเดต form prop โดยอัตโนมัติ
					await update();
				};
			}}
		>
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
					<input type="text" id="name" name="name" value={form?.values?.name ?? ''} required />
				</div>
				<div>
					<label for="alias">ชื่อย่อ/รหัสค้นหา</label>
					<input type="text" id="alias" name="alias" value={form?.values?.alias ?? ''} />
				</div>
				<div>
					<label for="categoryId">ประเภทสินค้า</label>
					<select id="categoryId" name="categoryId">
						<option value="">-- ไม่ระบุ --</option>
						{#each data.categories as category (category.id)}
							<option
								value={category.id}
								selected={(form?.values?.categoryId ?? '') === category.id}
							>
								{category.name}
							</option>
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
						value={form?.values?.costPrice ?? '0.00'}
					/>
				</div>
				<div>
					<label for="retailPrice">* ราคาปลีก</label>
					<input
						type="number"
						step="0.01"
						id="retailPrice"
						name="retailPrice"
						value={form?.values?.retailPrice ?? ''}
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
						value={form?.values?.wholesalePrice ?? ''}
					/>
				</div>
				<div>
					<label for="vatType">Vat</label>
					<select id="vatType" name="vatType">
						<option value="none" selected={(form?.values?.vatType ?? 'none') === 'none'}>
							ไม่มี Vat
						</option>
						<option value="include" selected={(form?.values?.vatType ?? '') === 'include'}>
							ราคารวม Vat
						</option>
						<option value="exclude" selected={(form?.values?.vatType ?? '') === 'exclude'}>
							ราคาไม่รวม Vat
						</option>
					</select>
				</div>
				<div>
					<label for="stockQuantity">จำนวนสินค้า</label>
					<input
						type="number"
						id="stockQuantity"
						name="stockQuantity"
						value={form?.values?.stockQuantity ?? '0'}
					/>
				</div>
				<div>
					<label for="unitId">หน่วย</label>
					<select id="unitId" name="unitId">
						<option value="">-- ไม่ระบุ --</option>
						{#each data.units as unit (unit.id)}
							<option value={unit.id} selected={(form?.values?.unitId ?? '') === unit.id}>
								{unit.name}
							</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="reorderPoint">จุดสั่งซื้อ</label>
					<input
						type="number"
						id="reorderPoint"
						name="reorderPoint"
						value={form?.values?.reorderPoint ?? ''}
					/>
				</div>
				<div>
					<label for="shelfLocation">ชั้นวางสินค้า</label>
					<input
						type="text"
						id="shelfLocation"
						name="shelfLocation"
						value={form?.values?.shelfLocation ?? ''}
					/>
				</div>
			</div>

			<fieldset>
				<label for="supplierId">* ผู้ขายสินค้า</label>
				<select id="supplierId" name="supplierId" required>
					<option value="" disabled selected={(form?.values?.supplierId ?? '') === ''}>
						-- กรุณาเลือก --
					</option>
					{#each data.suppliers as supplier (supplier.id)}
						<option value={supplier.id} selected={(form?.values?.supplierId ?? '') === supplier.id}>
							{supplier.name}
						</option>
					{/each}
				</select>

				<label for="notes">หมายเหตุ</label>
				<textarea id="notes" name="notes" rows="3">{form?.values?.notes ?? ''}</textarea>

				<div class="checkbox-group">
					<label>
						<input type="checkbox" name="notTrackStock" checked={form?.values?.notTrackStock === true} />
						ไม่ตัดสต็อกเมื่อขาย
					</label>
					<label>
						<input
							type="checkbox"
							name="saveAndContinue"
							checked={form?.values?.saveAndContinue === true}
						/>
						บันทึกและเพิ่มรายการต่อไป
					</label>
				</div>
			</fieldset>

			<footer class="form-actions">
				<a href="/products" role="button">ยกเลิก</a>
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
	.container { max-width: 960px; margin: 2rem auto; }
	.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
	.page-header h2, .page-header a { margin-bottom: 0; }
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
	.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem 2rem; margin-bottom: 1.5rem; }
	.barcode-group { display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: stretch; }
	.barcode-group input, .barcode-group button { margin-bottom: 0; }
	fieldset { padding: 0; border: none; }
	.checkbox-group { display: flex; gap: 2rem; margin-top: 1rem; }
	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--pico-muted-border-color);
	}
	.form-actions a[role='button'], .form-actions button {
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
		background-color: var(--pico-secondary, #016ef4);
		border-color: var(--pico-secondary, #5c6570);
		color: var(--pico-primary-inverse, #fff);
	}
	.form-actions button:last-child { background-color: #15cb24; border: 1px solid #15cb24; color: #fff; }
	.form-actions button:last-child:hover { background-color: #26c217; border-color: #26c217; }
</style>

