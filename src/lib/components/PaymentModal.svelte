<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let showModal: boolean;
	export let totalAmount: number;

	let receivedAmount: number | null = null;
	let isPaid = false; // State to track if payment is confirmed

	const dispatch = createEventDispatcher();

	// --- Functions ---

	// Real-time change calculation
	$: changeAmount = receivedAmount && receivedAmount > totalAmount ? receivedAmount - totalAmount : 0;

	/** Handles cash payment confirmation */
	function handleConfirm() {
		dispatch('confirm', {
			paymentType: 'COMPLETED',
			received: receivedAmount || totalAmount,
			change: changeAmount
		});
		isPaid = true; // Change state to show print/close buttons
	}

	/** Handles credit sale confirmation */
	function handleCreditSale() {
		dispatch('confirm', {
			paymentType: 'CREDIT',
			received: 0,
			change: 0
		});
		isPaid = true; // Change state to show print/close buttons
	}

	/** Closes the modal and resets its state */
	function closeModal() {
		dispatch('close');
	}

	/** Resets the component state when the modal is opened */
	function resetState() {
		isPaid = false;
		receivedAmount = null;
	}

	// Placeholder functions for printing
	function printReceipt() {
		console.log('Printing Receipt...');
		// Add your receipt printing logic here
	}
	function printTaxInvoice() {
		console.log('Printing Tax Invoice...');
		// Add your tax invoice printing logic here
	}
	function printDeliverySlip() {
		console.log('Printing Delivery Slip...');
		// Add your delivery slip printing logic here
	}

	// Reset state every time the modal becomes visible
	$: if (showModal) {
		resetState();
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
						disabled={isPaid}
					/>
				</label>

				<div class="summary-row">
					<span>เงินทอน:</span>
					<span class="change">{changeAmount.toFixed(2)} บาท</span>
				</div>
			</div>

			<footer>
				{#if !isPaid}
					<div class="payment-actions">
						<button class="credit-sale" on:click={handleCreditSale}>บันทึกเป็นขายเชื่อ</button>
						<button
							on:click={handleConfirm}
							disabled={!receivedAmount || receivedAmount < totalAmount}
						>
							ยืนยันการชำระเงิน (เงินสด)
						</button>
					</div>
				{:else}
					<div class="post-payment-actions">
						<button on:click={closeModal}>ปิด</button>
						<div class="print-options">
							<button class="secondary outline small" on:click={printReceipt}>
								พิมพ์ใบเสร็จ
							</button>
							<button class="secondary outline small" on:click={printTaxInvoice}>
								ใบกำกับภาษี
							</button>
							<button class="secondary outline small" on:click={printDeliverySlip}>
								ใบส่งของ
							</button>
						</div>
					</div>
				{/if}
			</footer>
		</article>
	</dialog>
{/if}

<style>
	/* --- Color Palette --- */
	:root {
		/* Green Tones (Primary Action) */
		--theme-green-dark: #28e132;
		--theme-green-darker: #22c52a; /* Darker shade for hover */
		--theme-green-text: #1a8c1f; /* Darker shade for text */

		/* Blue Tones (Credit Sale Action) */
		--theme-blue-main: #36a3fc;
		--theme-blue-darker: #4490cf;
		--theme-blue-text: #ffffff;

		/* Neutral Tones (Print buttons, etc.) */
		--theme-neutral-bg: #f5f5f5;
		--theme-neutral-border: #e0e0e0;
		--theme-neutral-text: #757575;
	}

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
		color: var(--theme-green-text);
	}

	/* --- Footer Styles --- */
	footer {
		padding-top: 1rem;
	}
	.payment-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.post-payment-actions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}
	.print-options {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}
	.print-options button.small {
		font-size: 0.8rem;
		padding: 0.5rem;
	}

	/* === Button Styles === */

	/* Default Button (Vibrant Green) */
	button {
		background-color: var(--theme-green-dark);
		color: white;
		border: 1px solid var(--theme-green-dark);
		transition: background-color 0.2s;
	}

	button:is(:hover, :active, :focus) {
		background-color: var(--theme-green-darker);
		border-color: var(--theme-green-darker);
	}

	/* Credit Sale Button (Pastel Blue) */
	button.credit-sale {
		background-color: var(--theme-blue-main);
		color: var(--theme-blue-text);
		border-color: var(--theme-blue-main);
	}

	button.credit-sale:is(:hover, :active, :focus) {
		background-color: var(--theme-blue-darker);
		border-color: var(--theme-blue-darker);
		color: white;
	}

	/* Print Buttons (Neutral / Secondary Outline) */
	button.secondary.outline {
		background-color: transparent;
		color: var(--theme-neutral-text);
		border-color: var(--theme-neutral-border);
	}

	button.secondary.outline:is(:hover, :active, :focus) {
		background-color: var(--theme-neutral-bg);
		color: var(--theme-neutral-text);
		border-color: var(--theme-neutral-border);
	}

	/* Header Close button */
	header .close {
		color: var(--theme-neutral-text);
		background-color: transparent;
		border: none;
	}
	header .close:is(:hover, :active, :focus) {
		color: black;
		background-color: transparent;
	}
</style>