<!-- Path: src/lib/components/PaymentModal.svelte (ฉบับอัปเกรด) -->

<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let showModal: boolean;
	export let totalAmount: number;

	let receivedAmount: number | null = null;

	const dispatch = createEventDispatcher();

	// คำนวณเงินทอนแบบ Real-time
	$: changeAmount = receivedAmount && receivedAmount > totalAmount ? receivedAmount - totalAmount : 0;

	function handleConfirm() {
		// ส่ง event 'confirm' กลับไป พร้อมข้อมูลที่จำเป็น
		dispatch('confirm', {
			paymentType: 'COMPLETED',
			received: receivedAmount || totalAmount, // ถ้าไม่กรอก ให้ถือว่ารับมาพอดี
			change: changeAmount
		});
	}

	function handleCreditSale() {
		// ส่ง event 'confirm' กลับไป บอกว่าเป็นขายเชื่อ
		dispatch('confirm', {
			paymentType: 'CREDIT',
			received: 0,
			change: 0
		});
	}

	function closeModal() {
		dispatch('close');
	}
</script>

{#if showModal}
	<dialog open on:close={closeModal}>
		<article>
			<header>
				<button aria-label="Close" class="close" on:click={closeModal}></button>
				<strong>รับเงิน / คำนวณเงินทอน</strong>
			</header>

			<div class="modal-body">
				<div class="summary-row">
					<span>ยอดชำระทั้งหมด:</span>
					<span class="total">{totalAmount.toFixed(2)} บาท</span>
				</div>
				
				<label for="received">
					รับเงินมา
					<input
						type="number"
						id="received"
						placeholder="กรอกจำนวนเงินที่รับ"
						bind:value={receivedAmount}
						min={totalAmount}
					/>
				</label>
				
				<div class="summary-row">
					<span>เงินทอน:</span>
					<span class="change">{changeAmount.toFixed(2)} บาท</span>
				</div>
			</div>

			<footer>
				<button on:click={handleConfirm} disabled={!receivedAmount || receivedAmount < totalAmount}>
					ยืนยันการชำระเงิน (เงินสด)
				</button>
				<button class="secondary" on:click={handleCreditSale}>บันทึกเป็นขายเชื่อ</button>
			</footer>
		</article>
	</dialog>
{/if}

<style>
	.modal-body {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.summary-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}
	.total {
		font-size: 1.5em;
		font-weight: bold;
	}
	.change {
		font-size: 1.2em;
		font-weight: bold;
		color: var(--pico-primary);
	}
	footer {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	footer button {
		width: 100%;
	}
</style>