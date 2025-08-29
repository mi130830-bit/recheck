<!-- File: src/routes/products/+page.svelte (Final Corrected Version) -->

<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  
  export let data: PageData;
  // ใช้ form จาก data โดยตรง เพื่อรับ message จาก action
  $: form = data.form; 
</script>

<main class="container">
  <header class="header-container">
    <h1>จัดการข้อมูลสินค้า</h1>
    <a href="/products/new" role="button">+ เพิ่มสินค้าใหม่</a>
  </header>
  
  {#if form?.message}
    <aside class="error-message"><p>{form.message}</p></aside>
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
        <!-- โค้ดส่วนนี้ของคุณถูกต้องแล้ว -->
        {#each data.products as product (product.id)}
          <tr>
            <td><strong>{product.name}</strong></td>
            <td>{product.barcode || '-'}</td>
            <!-- ข้อมูลที่มาจาก load เป็น Number อยู่แล้ว สามารถใช้ toFixed ได้เลย -->
            <td style="text-align: right;">{product.retailPrice.toFixed(2)}</td>
            <td style="text-align: right;">{product.stockQuantity} {product.unit || ''}</td>
            <!-- [แก้ไข] เพิ่ม '?.' (Optional Chaining) เพื่อความปลอดภัย -->
            <td>{product.supplier?.name || 'ไม่มีข้อมูล'}</td>
            <td>
              <div class="action-buttons">
                <a href="/products/{product.id}/edit" role="button" class="outline">แก้ไข</a>
                <form 
                  method="POST" 
                  action="?/delete" 
                  use:enhance
                >
                  <input type="hidden" name="id" value={product.id} />
                  <button 
                    type="submit" 
                    class="contrast outline"
                    on:click={(event) => {
                      if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${product.name}"?`)) {
                        event.preventDefault();
                      }
                    }}
                  >ลบ</button>
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
  .container { max-width: 960px; margin: 0 auto; padding: 1rem; }
  .header-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .action-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  .action-buttons form { margin: 0; }
  .action-buttons a, .action-buttons button { width: 100%; padding: 0.25rem 0.5rem; font-size: 0.9em; margin: 0; }
  .error-message { background-color: var(--pico-form-element-invalid-background-color); color: var(--pico-form-element-invalid-color); border-color: var(--pico-form-element-invalid-border-color); padding: 0.5rem 1rem; margin-bottom: 1rem; border-radius: var(--pico-border-radius); }
</style>