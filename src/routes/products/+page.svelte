<!-- File: src/routes/products/+page.svelte (ฉบับอัปเดต) -->

<script lang="ts">
  import { enhance } from '$app/forms';
  export let data;
</script>

<main class="container">
  <header class="header-container">
    <h1>จัดการข้อมูลสินค้า</h1>
    <a href="/products/new" role="button">+ เพิ่มสินค้าใหม่</a>
  </header>
  
  {#if data.form?.message}
    <aside class="error-message"><p>{data.form.message}</p></aside>
  {/if}

  {#if data.products.length === 0}
    <article><p>ยังไม่มีข้อมูลสินค้าในระบบ</p></article>
  {:else}
    <table>
      <thead>
        <tr>
          <th>ชื่อสินค้า</th>
          <th>บาร์โค้ด</th>
          <th style="text-align: right;">ราคาปลีก</th>
          <th style="text-align: right;">คงคลัง</th>
          <th>ผู้ขาย</th>
          <th style="width: 200px;">การกระทำ</th>
        </tr>
      </thead>
      <tbody>
        {#each data.products as product (product.id)}
          <tr>
            <td><strong>{product.name}</strong></td>
            <td>{product.barcode || '-'}</td>
            <td style="text-align: right;">{product.retailPrice.toFixed(2)}</td>
            <td style="text-align: right;">{product.stockQuantity} {product.unit || ''}</td>
            <td>{product.supplier.name}</td>
            <td>
              <div class="action-buttons">
                <a href="/products/{product.id}/edit" role="button" class="outline">แก้ไข</a>
                <form 
                  method="POST" 
                  action="?/delete" 
                  use:enhance
                  on:submit|preventDefault={async (event) => {
                    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${product.name}"?`)) {
                      await event.currentTarget.submit();
                    }
                  }}
                >
                  <input type="hidden" name="id" value={product.id} />
                  <button type="submit" class="contrast outline">ลบ</button>
                </form>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>

<style>
  .container { max-width: 960px; margin: 0 auto; }
  .header-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .action-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  .action-buttons form {
    margin: 0;
  }
  /* ทำให้ทั้ง <a> และ <button> มีสไตล์เหมือนกัน */
  .action-buttons a, .action-buttons button {
    width: 100%;
    padding: 0.25rem 0.5rem;
    font-size: 0.9em;
    margin: 0;
  }
  .error-message { background-color: var(--pico-form-element-invalid-background-color); color: var(--pico-form-element-invalid-color); border-color: var(--pico-form-element-invalid-border-color); padding: 0.5rem 1rem; margin-bottom: 1rem; border-radius: var(--pico-border-radius); }
</style>