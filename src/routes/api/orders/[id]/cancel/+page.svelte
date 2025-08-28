<!-- ... (โค้ดเดิม) ... -->
<script lang="ts">
  export let data;
  const { order } = data;
  let isLoading = false;

  async function cancelOrder(shouldRestock: boolean) {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการยกเลิกบิล ${order.orderNumber}?`)) return;

    isLoading = true;
    try {
      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shouldRestock }),
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) window.location.reload(); // รีเฟรชหน้าเพื่อดูสถานะใหม่
    } finally {
      isLoading = false;
    }
  }
</script>

<main class="container">
  <!-- ... (โค้ดแสดงรายละเอียดเหมือนเดิม) ... -->
  <article>
    <!-- ... -->
    {#if order.status !== 'CANCELLED'}
    <footer class="actions">
      <p><strong>การกระทำ:</strong></p>
      <button on:click={() => cancelOrder(true)} disabled={isLoading} class="secondary">
        ยกเลิกบิล (และคืนสต็อก)
      </button>
      <button on:click={() => cancelOrder(false)} disabled={isLoading} class="secondary contrast">
        ยกเลิกบิล (ไม่คืนสต็อก)
      </button>
    </footer>
    {/if}
  </article>
</main>