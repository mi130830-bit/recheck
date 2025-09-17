<script lang="ts">
	import type { Order, OrderItem, Product } from '@prisma/client';

	type SearchResult = (OrderItem & { product: Product; order: Order })[];

	// 1. รับ props ด้วย $props() แทน export let
	const { showModal, onselectOrder, onclose } = $props<{
		showModal: boolean;
		onselectOrder: (orderNumber: string) => void;
		onclose: () => void;
	}>();

	// 2. ใช้ $state() สำหรับตัวแปรที่ต้องการให้ Svelte ติดตามการเปลี่ยนแปลง
	let searchQuery = $state('');
	let results = $state<SearchResult>([]);
	let isLoading = $state(false);

	async function searchItems() {
		if (searchQuery.trim().length < 2) return;
		isLoading = true;
		try {
			const res = await fetch(`/api/order-items/search?q=${encodeURIComponent(searchQuery)}`);
			if (res.ok) {
				results = await res.json();
			}
		} finally {
			isLoading = false;
		}
	}

	// 3. ไม่ต้องใช้ dispatch แล้ว สามารถเรียกใช้ callback function ที่รับมาจาก props ได้โดยตรง
</script>

{#if showModal}
	<dialog open on:close={onclose} on:click|self={onclose}>
		<article style="min-width: 80vw; max-width: 1200px;">
			<header>
				<button aria-label="Close" class="close" on:click={onclose}></button>
				<h3>ค้นหาบิลอย่างละเอียดจากสินค้า</h3>
			</header>

			<form on:submit|preventDefault={searchItems}>
				<input type="search" bind:value={searchQuery} placeholder="ค้นหาจากบาร์โค้ด, ชื่อสินค้า, หรือรหัส..." />
				<button type="submit" aria-busy={isLoading}>ค้นหา</button>
			</form>

			<div style="min-height: 400px; overflow-y: auto;">
				{#if isLoading}
					<p aria-busy="true">กำลังค้นหา...</p>
				{:else if results.length === 0}
					<p>-- ไม่พบข้อมูล --</p>
				{:else}
					<table>
						<thead>
							<tr>
								<th>เลขที่บิล</th>
								<th>วันที่</th>
								<th>บาร์โค้ด</th>
								<th>ชื่อสินค้า</th>
								<th style="text-align: center;">จำนวน</th>
								<th style="text-align: center;">คืนแล้ว</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each results as item (item.id)}
								<tr>
									<td>{item.order.orderNumber}</td>
									<td>{new Date(item.order.createdAt).toLocaleDateString('th-TH')}</td>
									<td>{item.product.barcode}</td>
									<td>{item.product.name}</td>
									<td style="text-align: center;">{item.quantity}</td>
									<td style="text-align: center;">{item.returnedQuantity}</td>
									<td>
										<button class="outline" on:click={() => onselectOrder(item.order.orderNumber)}>
											เลือกบิลนี้
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
			<footer>
				<button class="secondary" on:click={onclose}>ปิด</button>
			</footer>
		</article>
	</dialog>
{/if}

<style>
:root {
  /* ตัวแปรสี */
  --color-primary: #4dd30f; /* สีปุ่มหลัก */ [cite: 7]
  --color-primary-hover: #0bcc2f;   /* สีปุ่มหลักเมื่อ hover */
  --color-secondary: #ed620c;       /* สีปุ่มรอง */
  --color-secondary-hover: #e91506; /* สีปุ่มรองเมื่อ hover */ [cite: 8]
  --color-outline: #147db7;         /* สีปุ่มขอบ */
  --color-outline-hover: #105a8b;   /* สีปุ่มขอบเมื่อ hover */
  --color-text-on-primary: #ffffff; /* สีข้อความบนปุ่ม */ [cite: 9]
  --color-text-on-secondary: #ffffff;
  --color-text-on-outline: #147db7;
}

/* ปุ่มหลัก (สีพื้น) */
button.primary,
button[type="submit"] {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  border: none;
  transition: background-color 0.3s ease; [cite: 10]
  cursor: pointer;
}

button.primary:hover,
button[type="submit"]:hover {
  background-color: var(--color-primary-hover);
}

/* ปุ่มรอง (background สีเทาเข้ม) */
button.secondary {
  background-color: var(--color-secondary);
  color: var(--color-text-on-secondary); [cite: 11]
  border: none;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

button.secondary:hover {
  background-color: var(--color-secondary-hover); [cite: 12]
}

/* ปุ่มขอบ (outline) */
button.outline {
  background-color: transparent;
  border: 2px solid var(--color-outline);
  color: var(--color-text-on-outline);
  transition: all 0.3s ease;
  cursor: pointer; [cite: 13]
}

button.outline:hover {
  background-color: var(--color-outline);
  color: var(--color-text-on-primary);
  border-color: var(--color-outline-hover);
}
</style>