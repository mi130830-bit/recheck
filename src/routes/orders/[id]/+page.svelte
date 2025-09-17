<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';

	let { data, form } = $props<PageData & ActionData>();
	let order = $derived(data.order);
	let showCancelConfirm = $state(false);
</script>

<main class="container">
	{#if order}
		<div class="page-header">
			<a href="/orders" role="button" class="secondary outline">&larr; กลับไปที่รายการบิล</a>
			{#if order.status !== 'CANCELLED'}
				<a href="/receipts/{order.id}?size=slip" target="_blank" role="button" class="print-button">
					🖨️ พิมพ์ใบเสร็จ
				</a>
			{/if}
		</div>

		<article>
			<header>
				<h2>รายละเอียดบิล: {order.orderNumber}</h2>
			</header>

			{#if form?.message}
				<aside class:success={form.success} class:error={!form.success}>
					{form.message}
				</aside>
			{/if}

			<div class="details-grid">
				<div><strong>วันที่:</strong></div>
				<div>
					{new Date(order.createdAt).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })}
				</div>
				<div><strong>ลูกค้า:</strong></div>
				<div>
					{order.customer ? `${order.customer.firstName} ${order.customer.lastName || ''}` : 'ลูกค้าทั่วไป'}
				</div>
				<div><strong>สถานะ:</strong></div>
				<div><span class="status-{order.status.toLowerCase()}">{order.status}</span></div>
			</div>

			<h4>รายการสินค้า</h4>
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>สินค้า</th>
							<th class="right">ราคา/หน่วย</th>
							<th class="center">จำนวน</th>
							<th class="right">ราคารวม</th>
						</tr>
					</thead>
					<tbody>
						{#each order.items as item (item.id)}
							<tr>
								<td>{item.product.name}</td>
								<td class="right">{item.price.toFixed(2)}</td>
								<td class="center">{item.quantity}</td>
								<td class="right">{(item.price * item.quantity).toFixed(2)}</td>
							</tr>
						{/each}
					</tbody>
					<tfoot>
						<tr>
							<td colspan="3" class="right"><strong>ยอดรวมสุทธิ</strong></td>
							<td class="right"><strong>{order.total.toFixed(2)}</strong></td>
						</tr>
					</tfoot>
				</table>
			</div>

			{#if order.status !== 'CANCELLED'}
				<footer class="actions-footer">
					{#if showCancelConfirm}
						<div class="confirm-cancel">
							<span>ต้องการยกเลิกบิลนี้ใช่หรือไม่?</span>
							<form method="POST" action="?/cancel" use:enhance class="cancel-form">
								<button name="shouldRestock" value="true" class="secondary">
									ยืนยัน (คืนสต็อก)
								</button>
								<button name="shouldRestock" value="false" class="secondary contrast">
									ยืนยัน (ไม่คืนสต็อก)
								</button>
								<button type="button" onclick={() => (showCancelConfirm = false)}>ยกเลิก</button>
							</form>
						</div>
					{:else}
						<div class="main-action-buttons">
							<form method="POST" action="?/dispatch" use:enhance class="dispatch-form">
								<button type="submit" class="dispatch-btn">🚚 แจ้งเตือนส่งของ</button>
							</form>
							<button onclick={() => (showCancelConfirm = true)} class="cancel-order-btn">
								ยกเลิกบิล
							</button>
						</div>
					{/if}
				</footer>
			{/if}
		</article>
	{:else}
		<article class="not-found-card">
			<header>
				<h2>ไม่พบข้อมูลบิล</h2>
			</header>
			<p>ไม่พบข้อมูลบิลที่คุณกำลังค้นหา (ID: {$page.params.id}) อาจถูกลบไปแล้ว</p>
			<footer>
				<a href="/orders" role="button">กลับไปที่รายการบิลทั้งหมด</a>
			</footer>
		</article>
	{/if}
</main>

<style>
	.container { max-width: 800px; margin: 2rem auto; }
	.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
	.print-button { gap: 0.5rem; }
	.details-grid { display: grid; grid-template-columns: auto 1fr; gap: 0.5rem 1rem; margin: 1.5rem 0; }
	.details-grid > div:nth-child(odd) { font-weight: bold; }
	.table-container { overflow-x: auto; }
	.right { text-align: right; }
	.center { text-align: center; }
	.actions-footer { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--pico-muted-border-color); }

	/* [แก้ไข CSS] จัดปุ่มหลักด้านล่าง */
	.main-action-buttons {
		display: flex;
		gap: 1rem; /* ระยะห่างระหว่างปุ่ม */
		width: 100%; /* ให้ div ยืดเต็มความกว้าง */
		justify-content: flex-end; /* ชิดขวา */
	}

	.main-action-buttons .dispatch-form { /* จัดการฟอร์มที่ครอบปุ่มแจ้งเตือน */
		flex: 1; /* ทำให้ปุ่มยืดเท่ากัน */
		margin: 0; /* ลบ margin เริ่มต้นของ form */
	}

	.main-action-buttons button {
		flex: 1; /* ทำให้ปุ่มยืดเท่ากัน */
		padding: 0.75rem 1.25rem;
		height: 60px; /* กำหนดความสูงให้เท่ากัน */
		font-weight: bold;
		border: none;
		border-radius: var(--pico-border-radius);
		cursor: pointer;
		transition: background-color 0.2s ease-in-out;
		display: flex; /* เพื่อจัด icon และ text กลางปุ่ม */
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-size: 1rem;
	}

	/* [แก้ไข CSS] สีปุ่มแจ้งเตือน (เขียว) */
	.dispatch-btn {
		background-color: #28a745; /* สีเขียว */
		color: white;
	}
	.dispatch-btn:hover {
		background-color: #218838; /* สีเขียวเข้มขึ้น */
	}

	/* [แก้ไข CSS] สีปุ่มยกเลิกบิล (แดง) */
	.cancel-order-btn {
		background-color: #dc3545; /* สีแดง */
		color: white;
	}
	.cancel-order-btn:hover {
		background-color: #c82333; /* สีแดงเข้มขึ้น */
	}


	.confirm-cancel { display: flex; flex-direction: column; gap: 1rem; background: var(--pico-card-background-color); padding: 1rem; border-radius: var(--pico-border-radius); border: 1px solid var(--pico-card-border-color); }
	.cancel-form { justify-content: flex-end; } /* จัดปุ่มในฟอร์มยืนยันยกเลิกให้ชิดขวา */
	.cancel-form button { /* สไตล์ปุ่มในฟอร์มยืนยันยกเลิก */
		width: auto; /* ไม่ต้องบังคับให้ยืดเท่ากัน */
		flex: none;
		height: auto;
		padding: 0.5rem 1rem;
		font-weight: normal;
		font-size: 0.9em;
		background-color: var(--pico-secondary-background-color);
		color: var(--pico-secondary-color);
		border: 1px solid var(--pico-secondary-border-color);
	}
	.cancel-form button.contrast { /* ปุ่มยืนยัน (ไม่คืนสต็อก) */
		background-color: var(--pico-primary-background-color);
		color: var(--pico-primary-color);
		border-color: var(--pico-primary-border-color);
	}


	aside { padding: 1rem; margin-bottom: 1rem; border-radius: var(--pico-border-radius); border-left-width: 4px; }
	aside.success { border-left-color: var(--pico-success-border-color); background-color: var(--pico-success-background-color); }
	aside.error { border-left-color: var(--pico-invalid-border-color); background-color: var(--pico-form-element-invalid-background-color); }
	[class*='status-'] { padding: 0.25rem 0.5rem; border-radius: 99px; font-size: 0.8em; font-weight: bold; color: white; }
	.status-completed { background-color: #28a745; }
    .status-shipping { background-color: #17a2b8; }
	.status-credit { background-color: #ffc107; color: black; }
	.status-held { background-color: #17a2b8; }
	.status-cancelled { background-color: #6c757d; }
	.not-found-card { text-align: center; padding: 2rem; }
	.not-found-card p { margin-bottom: 1.5rem; }
</style>