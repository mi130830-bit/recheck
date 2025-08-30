<!-- File: src/routes/products/new/+page.svelte (Final Corrected Version) -->

<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  
  export let data: PageData;
  export let form;
  
  let barcode: string | null = form?.barcode ?? null;

  function generateBarcode() {
    const timestamp = Date.now().toString().slice(-8);
    const randomNumber = Math.floor(100 + Math.random() * 900);
    barcode = `${timestamp}${randomNumber}`;
  }
</script>

<main class="container">
  <article>
    <header class="page-header">
      <h2>เพิ่มรายการสินค้า</h2>
      <a href="/products/import" role="button" class="secondary outline">
        เพิ่มหลายรายการ (Excel)
      </a>
    </header>

    <form method="POST" use:enhance>
      {#if form?.error}
        <p class="error">{form.error}</p>
      {/if}

      <div class="form-grid">
        <div>
          <label for="barcode">รหัสบาร์โค้ด</label>
          <div class="barcode-group">
            <input type="text" id="barcode" name="barcode" bind:value={barcode} />
            <button type="button" on:click={generateBarcode} class="secondary outline">สร้าง</button>
          </div>
        </div>
        <div>
          <label for="name">* ชื่อสินค้า</label>
          <input type="text" id="name" name="name" value={form?.name ?? ''} required />
        </div>

        <div>
          <label for="alias">ชื่อย่อ/รหัสค้นหา</label>
          <input type="text" id="alias" name="alias" />
        </div>
        <div>
          <label for="category">ประเภทสินค้า</label>
          <input type="text" id="category" name="category" />
        </div>

        <div>
          <label for="costPrice">* ต้นทุน</label>
          <input type="number" step="0.01" id="costPrice" name="costPrice" value="0.00" required />
        </div>
        <div>
          <label for="retailPrice">* ราคาปลีก</label>
          <input type="number" step="0.01" id="retailPrice" name="retailPrice" required />
        </div>

        <div>
          <label for="wholesalePrice">ราคาส่ง</label>
          <input type="number" step="0.01" id="wholesalePrice" name="wholesalePrice" />
        </div>
        <div>
          <label for="vatType">Vat</label>
          <select id="vatType" name="vatType">
            <option value="none">ไม่มี Vat</option>
            <option value="include">ราคารวม Vat</option>
            <option value="exclude">ราคาไม่รวม Vat</option>
          </select>
        </div>
        
        <div>
            <label for="stockQuantity">* จำนวนสินค้า</label>
            <input type="number" id="stockQuantity" name="stockQuantity" value="0" required />
        </div>
        <div>
            <label for="unit">หน่วย</label>
            <input type="text" id="unit" name="unit" placeholder="เช่น ชิ้น, กก." />
        </div>
        
        <div>
            <label for="reorderPoint">จุดสั่งซื้อ</label>
            <input type="number" id="reorderPoint" name="reorderPoint" />
        </div>
        <div>
            <label for="shelfLocation">ชั้นวางสินค้า</label>
            <input type="text" id="shelfLocation" name="shelfLocation" />
        </div>

      </div>

      <fieldset>
        <label for="supplierId">* ผู้ขายสินค้า</label>
        <select id="supplierId" name="supplierId" required>
          <option value="" disabled selected>-- กรุณาเลือก --</option>
          {#each data.suppliers as supplier (supplier.id)}
            <option value={supplier.id}>{supplier.name}</option>
          {/each}
        </select>

        <label for="notes">หมายเหตุ</label>
        <textarea id="notes" name="notes" rows="3"></textarea>
        
        <div class="checkbox-group">
            <label><input type="checkbox" name="allowPriceEdit" /> อนุญาตให้แก้ไขราคาที่หน้าขาย</label>
            <label><input type="checkbox" name="notTrackStock" /> ไม่ตัดสต็อกเมื่อขาย</label>
        </div>
      </fieldset>
      
      <footer>
        <button type="submit">บันทึกสินค้า</button>
        <a href="/products" role="button" class="secondary">ยกเลิก</a>
      </footer>
    </form>
  </article>
</main>

<style>
  .container { max-width: 960px; margin: 2rem auto; }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .page-header h2, .page-header a { margin-bottom: 0; }
  .error { color: var(--pico-color-red-500); background-color: var(--pico-form-element-invalid-background-color); padding: 0.75rem; border-radius: var(--pico-border-radius); border-left: 4px solid var(--pico-invalid-border-color); }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem 2rem; margin-bottom: 1.5rem; }
  .barcode-group { display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: stretch; }
  .barcode-group input, .barcode-group button { margin-bottom: 0; }
  fieldset { padding: 0; border: none; }
  .checkbox-group { display: flex; gap: 2rem; margin-top: 1rem; }
</style>