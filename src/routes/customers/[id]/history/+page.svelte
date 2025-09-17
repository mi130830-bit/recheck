<!-- src/routes/customers/[id]/history/+page.svelte (ปรับปรุงสำหรับ Svelte 5) -->
<script lang="ts">
	import type { PageData } from './$types';

	// [แก้ไข] 1. ใช้ $props() เพื่อรับ data prop
	let { data } = $props<PageData>();

	// [ปรับปรุง] 2. ใช้ $derived เพื่อให้ตัวแปร update อัตโนมัติเมื่อ data เปลี่ยน
	let customer = $derived(data.customer);
	let orders = $derived(data.orders);

	// --- Functions (ไม่มีการเปลี่ยนแปลง) ---
	function formatDate(dateString: Date) {
		return new Date(dateString).toLocaleDateString('th-TH', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function formatStatus(status: string) {
		switch (status) {
			case 'COMPLETED':
				return { text: 'ขายสด', class: 'status-completed' };
			case 'CREDIT':
				return { text: 'ขายเชื่อ', class: 'status-credit' };
			case 'HELD':
				return { text: 'พักบิล', class: 'status-held' };
			case 'CANCELLED':
				return { text: 'ยกเลิก', class: 'status-cancelled' };
			default:
				return { text: status, class: '' };
		}
	}
</script>

<main class="container">
	<article>
		<header class="page-header">
			<div>
				<h1>ประวัติการซื้อของลูกค้า</h1>
				<p class="sub-header">
					<strong>{customer.firstName} {customer.lastName || ''}</strong>
					(รหัส: {customer.memberCode})
				</p>
			</div>
			<a href="/customers" role="button" class="secondary"> &laquo; กลับไปหน้ารายชื่อลูกค้า </a>
		</header>

		{#if !orders || orders.length === 0}
			<p>ลูกค้ารายนี้ยังไม่มีประวัติการซื้อ</p>
		{:else}
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th style="width: 20%;">วันที่</th>
							<th style="width: 20%;">เลขที่บิล</th>
							<th style="width: 15%;">สถานะ</th>
							<th style="text-align: right;">ยอดรวม (บาท)</th>
							<th style="text-align: center;">ดูรายละเอียด</th>
						</tr>
					</thead>
					<tbody>
						{#each orders as order (order.id)}
							<tr>
								<td>{formatDate(order.createdAt)}</td>
								<td><strong>{order.orderNumber}</strong></td>
								<td>
									<span class="status-badge {formatStatus(order.status).class}">
										{formatStatus(order.status).text}
									</span>
								</td>
								<td style="text-align: right;">{order.total.toFixed(2)}</td>
								<td style="text-align: center;">
									<a
										href="/receipts/{order.id}"
										target="_blank"
										role="button"
										class="outline secondary"
										aria-label="ดูรายละเอียดบิล">ดูบิล</a
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</article>
</main>

<!-- สไตล์ยังคงเดิม เนื่องจากออกแบบมาได้ดีแล้ว -->
<style>
	.container {
		max-width: 1100px;
		margin: 2rem auto;
	}
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		border-bottom: 1px solid var(--pico-muted-border-color);
		padding-bottom: 1rem;
	}
	.page-header h1,
	.page-header p {
		margin: 0;
	}
	.sub-header {
		color: var(--pico-secondary);
		font-size: 1.1rem;
		margin-top: 0.25rem;
	}
	.table-container {
		overflow-x: auto;
	}

	.status-badge {
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 600;
		color: #fff;
		white-space: nowrap;
	}
	.status-badge.status-completed {
		background-color: #28a745;
	}
	.status-badge.status-credit {
		background-color: #ffc107;
		color: #000;
	}
	.status-badge.status-held,
	.status-badge.status-cancelled {
		background-color: #6c757d;
	}
</style>
