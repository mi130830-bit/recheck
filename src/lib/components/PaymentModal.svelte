<!-- File: src/lib/components/PaymentModal.svelte (ฉบับแก้ไข A11y) -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let totalAmount = 0;
  export let showModal = false;

  let cashReceived = '';
  let change = 0;

  const dispatch = createEventDispatcher();

  function calculateChange() {
    const received = parseFloat(cashReceived);
    if (!isNaN(received) && received >= totalAmount) {
      change = received - totalAmount;
    } else {
      change = 0;
    }
  }

  function confirmCreditSale() {
    dispatch('confirm', { paymentType: 'CREDIT' });
  }

  function confirmCashPayment() {
    if (parseFloat(cashReceived) >= totalAmount) {
      dispatch('confirm', { paymentType: 'COMPLETED' });
    } else {
      alert('จำนวนเงินที่รับมาไม่เพียงพอ');
    }
  }

  function closeModal() {
    cashReceived = '';
    change = 0;
    dispatch('close');
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') closeModal();
    if (event.key === 'Enter' && cashReceived) confirmCashPayment();
  }

  $: if (cashReceived) calculateChange();
</script>

<svelte:window on:keydown={handleKeydown}/>

{#if showModal}
  <dialog open on:close={closeModal} on:click|self={closeModal}>
    <!-- VVVVVV ลบ on:click|stopPropagation ออกจาก article VVVVVV -->
    <article>
      <header>
        <button aria-label="Close" class="close" on:click={closeModal}></button>
        <h3>รับเงิน / คำนวณเงินทอน</h3>
      </header>
      
      <div class="summary">
        <span>ยอดชำระทั้งหมด:</span>
        <strong class="total-display">{totalAmount.toFixed(2)} บาท</strong>
      </div>

      <label for="cashReceived">
        รับเงินมา
        <input 
          type="number" 
          id="cashReceived" 
          bind:value={cashReceived}
          placeholder="กรอกจำนวนเงินที่รับ"
          step="any"
          autocomplete="off"
        />
      </label>
      
      <div class="summary">
        <span>เงินทอน:</span>
        <strong class="change-display">{change.toFixed(2)} บาท</strong>
      </div>

      <footer>
        <div class="button-group">
            <button on:click={confirmCashPayment} disabled={!cashReceived || parseFloat(cashReceived) < totalAmount}>
                ยืนยันการชำระเงิน (เงินสด)
            </button>
            <button on:click={confirmCreditSale} class="secondary">
                บันทึกเป็นขายเชื่อ
            </button>
        </div>
      </footer>
    </article>
  </dialog>
{/if}

<style>
  dialog { max-width: 450px; border: none; padding: 0; box-shadow: 0 0 2rem rgba(0, 0, 0, 0.2); }
  dialog::backdrop { background: rgba(0, 0, 0, 0.5); }
  .close { position: absolute; top: 0.5rem; right: 0.5rem; }
  .summary { display: flex; justify-content: space-between; align-items: center; margin: 1rem 0; padding: 1rem; background-color: var(--pico-muted-background-color); }
  .total-display, .change-display { font-size: 1.5em; font-weight: bold; }
  .change-display { color: var(--pico-color-green-500); }
  .button-group { display: grid; gap: 1rem; }
  .button-group button { width: 100%; }
</style>