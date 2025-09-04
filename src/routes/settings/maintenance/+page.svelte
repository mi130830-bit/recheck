<!-- src/routes/settings/maintenance/+page.svelte -->

<script lang="ts">
	import { enhance } from '$app/forms';
	export let form;

	let restoreFile: FileList;
</script>

<div class="container">
	<h1>บำรุงรักษาระบบ</h1>
	<p>จัดการข้อมูลสำรอง, กู้คืน, และล้างข้อมูลของระบบ</p>

	<!-- 1. Backup & Restore Card -->
	<article>
		<header><strong>สำรองและกู้คืนข้อมูล</strong></header>
		<div class="grid">
			<div>
				<p>ดาวน์โหลดข้อมูลทั้งหมดเพื่อเก็บไว้เป็นข้อมูลสำรอง</p>
				<a href="/api/backup" role="button" download>📥 ดาวน์โหลดข้อมูลสำรอง</a>
			</div>
			<div>
				<form
					method="POST"
					action="?/restore"
					enctype="multipart/form-data"
					use:enhance
					on:submit|preventDefault={(e) => {
						if (
							confirm(
								'คำเตือนสูงสุด!\nคุณแน่ใจหรือไม่ว่าต้องการกู้คืนข้อมูล?\n\nการกระทำนี้จะเขียนทับข้อมูลปัจจุบันทั้งหมดด้วยข้อมูลจากไฟล์ที่คุณเลือก และไม่สามารถย้อนกลับได้!'
							)
						) {
							e.currentTarget.submit();
						}
					}}
				>
					<div class="warning">
						<strong>คำเตือน!</strong> การกู้คืนจะเขียนทับข้อมูลปัจจุบันทั้งหมด
					</div>
					<label for="backupFile">เลือกไฟล์สำรอง (.sql) เพื่อกู้คืน</label>
					<input
						type="file"
						name="backupFile"
						id="backupFile"
						accept=".sql"
						bind:files={restoreFile}
						required
					/>

					<button type="submit" class="danger" disabled={!restoreFile || restoreFile.length === 0}>
						♻️ กู้คืนข้อมูล
					</button>
					{#if form?.restoreSuccess}<p class="success">{form.restoreSuccess}</p>{/if}
					{#if form?.restoreError}<p class="error">{form.restoreError}</p>{/if}
				</form>
			</div>
		</div>
	</article>

	<!-- 2. Clear Data Card -->
	<article class="danger-zone">
		<header><strong>ล้างข้อมูลระบบ (Clear Data)</strong></header>
		<div class="warning">
			<strong>คำเตือนอันตราย!</strong> การกระทำนี้จะลบข้อมูลอย่างถาวรและไม่สามารถกู้คืนได้
			โปรดสำรองข้อมูลก่อนดำเนินการ
		</div>

		<!-- Actions Grid -->
		<div class="grid">
			<!-- Clear Transactions -->
			<form
				method="POST"
				action="?/clearTransactions"
				use:enhance
				on:submit|preventDefault={(e) => {
					if (
						confirm(
							'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลธุรกรรมทั้งหมด?\n(บิลขาย, การซื้อ, การคืน, ประวัติสต็อก)'
						)
					) {
						e.currentTarget.submit();
					}
				}}
			>
				<button type="submit" class="danger outline">🗑️ ล้างข้อมูลธุรกรรม</button>
				<small>ลบบิลขาย, การซื้อ, การคืน, ประวัติสต็อก และรีเซ็ตสต็อกเป็น 0</small>
				{#if form?.clearTransactionSuccess}<p class="success">{form.clearTransactionSuccess}</p>{/if}
				{#if form?.clearTransactionError}<p class="error">{form.clearTransactionError}</p>{/if}
			</form>

			<!-- Clear Products -->
			<form
				method="POST"
				action="?/clearProducts"
				use:enhance
				on:submit|preventDefault={(e) => {
					if (
						confirm(
							'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลสินค้า, ประเภท, และหน่วยนับทั้งหมด?\n(ต้องล้างข้อมูลธุรกรรมก่อน)'
						)
					) {
						e.currentTarget.submit();
					}
				}}
			>
				<button type="submit" class="danger outline">🧨 ล้างข้อมูลสินค้า</button>
				<small>ลบสินค้า, ประเภท, และหน่วยนับทั้งหมด</small>
				{#if form?.clearProductsSuccess}<p class="success">{form.clearProductsSuccess}</p>{/if}
				{#if form?.clearProductsError}<p class="error">{form.clearProductsError}</p>{/if}
			</form>

			<!-- Clear Customers -->
			<form
				method="POST"
				action="?/clearCustomers"
				use:enhance
				on:submit|preventDefault={(e) => {
					if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลลูกค้าทั้งหมด?')) {
						e.currentTarget.submit();
					}
				}}
			>
				<button type="submit" class="danger outline">👤 ล้างข้อมูลลูกค้า</button>
				<small>ลบรายชื่อลูกค้าทั้งหมด</small>
				{#if form?.clearCustomersSuccess}<p class="success">{form.clearCustomersSuccess}</p>{/if}
				{#if form?.clearCustomersError}<p class="error">{form.clearCustomersError}</p>{/if}
			</form>

			<!-- Clear Suppliers -->
			<form
				method="POST"
				action="?/clearSuppliers"
				use:enhance
				on:submit|preventDefault={(e) => {
					if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลผู้ขายทั้งหมด?')) {
						e.currentTarget.submit();
					}
				}}
			>
				<button type="submit" class="danger outline">🚚 ล้างข้อมูลผู้ขาย</button>
				<small>ลบรายชื่อผู้ขายทั้งหมด</small>
				{#if form?.clearSuppliersSuccess}<p class="success">{form.clearSuppliersSuccess}</p>{/if}
				{#if form?.clearSuppliersError}<p class="error">{form.clearSuppliersError}</p>{/if}
			</form>
		</div>
	</article>
</div>

<style>
	.container {
		max-width: 900px;
		margin: auto;
		display: grid;
		gap: 1.5rem;
	}
	article {
		margin-bottom: 0;
	}
	.danger-zone {
		border: 2px solid var(--pico-color-red-500);
	}
	.danger-zone header {
		background-color: var(--pico-color-red-500);
		color: white;
	}
	.warning {
		background-color: var(--pico-color-amber-100);
		border-left: 4px solid var(--pico-color-amber-500);
		padding: 1rem;
		margin-bottom: 1rem;
	}
	.warning strong {
		color: var(--pico-color-red-600);
	}
	button.danger,
	a[role='button'].danger {
		--pico-background-color: var(--pico-color-red-500);
		--pico-border-color: var(--pico-color-red-500);
		--pico-color: white;
	}
	button.danger:hover,
	a[role='button'].danger:hover {
		--pico-background-color: var(--pico-color-red-600);
		--pico-border-color: var(--pico-color-red-600);
	}
	button.danger.outline {
		--pico-background-color: var(--pico-color-red-0);
		--pico-border-color: var(--pico-color-red-500);
		--pico-color: var(--pico-color-red-500);
	}
	button.danger.outline:hover {
		--pico-background-color: var(--pico-color-red-500);
		--pico-border-color: var(--pico-color-red-500);
		--pico-color: white;
	}
	.error {
		color: var(--pico-color-red-600);
		font-weight: bold;
		margin-top: 0.5rem;
		font-size: 0.875rem;
	}
	.success {
		color: var(--pico-color-green-600);
		font-weight: bold;
		margin-top: 0.5rem;
		font-size: 0.875rem;
	}
	.grid form {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
	.grid form small {
		margin-top: 0.5rem;
		color: var(--pico-secondary);
	}
</style>