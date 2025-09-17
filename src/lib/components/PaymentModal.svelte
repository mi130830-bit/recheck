<script lang="ts">
	// [แก้ไข] เพิ่ม customerId เข้าไปใน props เพื่อใช้ตรวจสอบ
	let { showModal, totalAmount, customerId, onconfirm, onclose } = $props<{
		showModal: boolean;
		totalAmount: number;
		customerId?: number | null; // <-- รับ customerId เข้ามา
		onconfirm: (detail: {
			paymentType: 'COMPLETED' | 'CREDIT';
			received: number;
			change: number;
			notifyDispatch?: boolean; // <-- เพิ่ม flag สำหรับแจ้งเตือน
		}) => void;
		onclose: () => void;
	}>();

	let receivedAmount = $state<number | null>(null);
	let isPaid = $state(false);

	const changeAmount = $derived(
		receivedAmount && receivedAmount > totalAmount ? receivedAmount - totalAmount : 0
	);

	$effect(() => {
		if (showModal) {
			isPaid = false;
			receivedAmount = null;
		}
	});

	function handleConfirm() {
		onconfirm({
			paymentType: 'COMPLETED',
			received: receivedAmount || totalAmount,
			change: changeAmount,
			notifyDispatch: false // ไม่แจ้งเตือน
		});
		isPaid = true;
	}

	function handleCreditSale() {
		onconfirm({
			paymentType: 'CREDIT',
			received: 0,
			change: 0,
			notifyDispatch: false // ไม่แจ้งเตือน
		});
		isPaid = true;
	}

	// [เพิ่ม] ฟังก์ชันสำหรับยืนยันและแจ้งเตือนการจัดส่ง
	function handleConfirmAndDispatch() {
		onconfirm({
			paymentType: 'COMPLETED',
			received: receivedAmount || totalAmount,
			change: changeAmount,
			notifyDispatch: true // ส่งสัญญาณให้แจ้งเตือน
		});
		isPaid = true;
	}


	// Placeholder functions for printing
	function printReceipt() { console.log('Printing Receipt...'); }
	function printTaxInvoice() { console.log('Printing Tax Invoice...'); }
	function printDeliverySlip() { console.log('Printing Delivery Slip...'); }
</script>

{#if showModal}
	<dialog open onclose={onclose}>
		<article>
			<header>
				<button aria-label="Close" class="close" onclick={onclose}></button>
				<strong>รับเงิน / คำนวณเงินทอน</strong>
			</header>

			<div class="modal-body">
				<div class="summary-row total">
					<span>ยอดชำระ</span>
					<span>{totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
				</div>
				<label for="receivedAmount">
					รับเงิน
					<input
						type="number"
						id="receivedAmount"
						bind:value={receivedAmount}
						placeholder="กรอกจำนวนเงินที่รับ..."
						min={0}
						step="any"
						disabled={isPaid}
						autofocus
					/>
				</label>
				<div class="summary-row change">
					<span>เงินทอน</span>
					<span>{changeAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
				</div>
			</div>

			<footer>
				{#if !isPaid}
					<div class="payment-actions">
						<button class="credit-sale-btn" onclick={handleCreditSale} disabled={!customerId}>
							บันทึกเป็นขายเชื่อ
						</button>
						<button class="confirm-btn" onclick={handleConfirm} disabled={!receivedAmount || receivedAmount < totalAmount}>
							ยืนยันการชำระเงิน
						</button>
						<button class="dispatch-btn" onclick={handleConfirmAndDispatch} disabled={!receivedAmount || receivedAmount < totalAmount || !customerId}>
							ยืนยัน & แจ้งส่งของ
						</button>
					</div>
					{#if !customerId}
						<small class="notice-text">*ต้องเลือกลูกค้าเพื่อเปิดใช้งานปุ่ม "ขายเชื่อ" และ "แจ้งส่งของ"</small>
					{/if}
				{:else}
					<div class="post-payment-actions">
						<button onclick={onclose}>ปิด</button>
						<div class="print-options">
							<button class="secondary outline small" onclick={printReceipt}>พิมพ์ใบเสร็จ</button>
							<button class="secondary outline small" onclick={printTaxInvoice}>ใบกำกับภาษี</button>
							<button class="secondary outline small" onclick={printDeliverySlip}>ใบส่งของ</button>
						</div>
					</div>
				{/if}
			</footer>
		</article>
	</dialog>
{/if}

<style>
	/* [แก้ไข CSS] เพิ่ม style สำหรับปุ่มใหม่และปรับปรุงของเก่า */
	.payment-actions {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); /* ทำให้ปุ่มยืดหยุ่น */
		gap: 1rem;
	}
	.payment-actions button {
		padding: 0.75rem;
		font-weight: bold;
		border: none;
		border-radius: var(--pico-border-radius);
		cursor: pointer;
		transition: background-color 0.2s;
		color: white;
	}

	.credit-sale-btn { background-color: #007bff; } /* สีน้ำเงิน */
	.credit-sale-btn:hover { background-color: #0069d9; }

	.confirm-btn { background-color: #28a745; } /* สีเขียว */
	.confirm-btn:hover { background-color: #218838; }

	.dispatch-btn { background-color: #17a2b8; } /* สีฟ้าอมเขียว */
	.dispatch-btn:hover { background-color: #138496; }

	.payment-actions button:disabled {
		background-color: #6c757d;
		cursor: not-allowed;
	}

	.notice-text {
		display: block;
		text-align: center;
		margin-top: 1rem;
		color: var(--pico-muted-color);
	}


	/* --- CSS ส่วนอื่นๆ เหมือนเดิม --- */
	:root {
		--theme-green-text: #155724;
		--theme-neutral-bg: #f8f9fa;
		--theme-neutral-border: #dee2e6;
		--theme-neutral-text: #6c757d;
	}
	.modal-body {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem 0;
	}
	.summary-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: 0 0.5rem;
	}
	.total { font-size: 1.5em; font-weight: bold; }
	.change { font-size: 1.2em; font-weight: bold; color: var(--theme-green-text); }
	footer { padding-top: 1rem; }
	.post-payment-actions { display: flex; flex-direction: column; gap: 1rem; width: 100%; }
	.print-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
	.post-payment-actions button {
		background-color: #6c757d; color: white;
	}
	button.secondary.outline { background-color: transparent; color: var(--theme-neutral-text); border-color: var(--theme-neutral-border); }
	button.secondary.outline:is(:hover, :active, :focus) { background-color: var(--theme-neutral-bg); }
	header .close { color: var(--theme-neutral-text); background-color: transparent; border: none; }
</style>