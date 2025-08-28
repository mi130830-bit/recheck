<!-- File: src/routes/products/[id]/edit/+page.svelte (ฉบับ Layout คู่) -->

<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  export let data;

  let barcode: string | null = data.product.barcode;
  let notTrackStock = !data.product.trackStock;
  let allowPriceEdit = data.product.allowPriceEdit;

  function generateBarcode() {
    const timestamp = Date.now();
    const randomNumber = Math.floor(100 + Math.random() * 900);
    barcode = `${timestamp}${randomNumber}`;
  }
</script>

<main class="container">
  <article>
    <header>
      <h2>แก้ไขข้อมูลสินค้า: {data.product.name}</h2>
    </header>

    <form method="POST" action="?/update" use:enhance>
      {#if $page.form?.message}
        <p class="error">{$page.form.message}</p>
      {/if}

      <!-- ==== Layout หลักแบบ 2 คอลัมน์ ==== -->
      <div class="form-grid">
        <!-- คู่ที่ 1 -->
        <div>
          <label for="barcode">รหัสบาร์โค้ด</label>
          <div class="barcode-group">
            <input type="text" id="barcode" name="barcode" bind:value={barcode} />
            <button type="button" on:click={generateBarcode} class="secondary outline">สร้างใหม่</button>
          </div>
        </div>
        <div>
          <label for="name">* ชื่อสินค้า</label>
          <input type="text" id="name" name="name" required value={data.product.name} />
        </div>

        <!-- คู่ที่ 2 -->
        <div>
          <label for="alias">ชื่อย่อ/รหัสค้นหา</label>
          <input type="text" id="alias" name="alias" value={data.product.alias || ''} />
        </div>
        <div>
          <label for="category">ประเภทสินค้า</label>
          <input type="text" id="category" name="category" value={data.product.category || ''} />
        </div>

        <!-- คู่ที่ 3 -->
        <div>
          <label for="costPrice">* ต้นทุน</label>
          <input type="number" step="0.01" id="costPrice" name="costPrice" required value={data.product.costPrice} />
        </div>
        <div>
          <label for="retailPrice">* ราคาปลีก</label>
          <input type="number" step="0.01" id="retailPrice" name="retailPrice" required value={data.product.retailPrice} />
        </div>

        <!-- คู่ที่ 4 -->
        <div>
          <label for="wholesalePrice">ราคาส่ง</label>
          <input type="number" step="0.01" id="wholesalePrice" name="wholesalePrice" value={data.product.wholesalePrice || ''} />
        </div>
        <div>
          <label for="vatType">Vat</label>
          <select id="vatType" name="vatType" bind:value={data.product.vatType}>
            <option value="include">ราคารวม Vat</option>
            <option value="exclude">ราคาไม่รวม Vat</option>
            <option value="none">ไม่มี Vat</option>
          </select>
        </div>
        
        <!-- คู่ที่ 5 -->
        <div>
            <label for="stockQuantity">* จำนวนสินค้า</label>
            <input type="number" id="stockQuantity" name="stockQuantity" required value={data.product.stockQuantity} />
        </div>
        <div>
            <label for="unit">หน่วย</label>
            <input type="text" id="unit" name="unit" placeholder="เช่น ชิ้น, กก." value={data.product.unit || ''} />
        </div>
        
        <!-- คู่ที่ 6 -->
        <div>
            <label for="reorderPoint">จุดสั่งซื้อ</label>
            <input type="number" id="reorderPoint" name="reorderPoint" value={data.product.reorderPoint || ''} />
        </div>
        <div>
            <label for="shelfLocation">ชั้นวางสินค้า</label>
            <input type="text" id="shelfLocation" name="shelfLocation" value={data.product.shelfLocation || ''} />
        </div>
      </div>

      <!-- ==== ส่วนที่เหลือ (เต็มความกว้าง) ==== -->
      <fieldset>
        <label for="supplierId">* ผู้ขายสินค้า</label>
        <select id="supplierId" name="supplierId" required bind:value={data.product.supplierId}>
          <option value="" disabled>-- กรุณาเลือก --</option>
          {#each data.suppliers as supplier (supplier.id)}
            <option value={supplier.id}>{supplier.name}</option>
          {/each}
        </select>

        <label for="notes">หมายเหตุ</label>
        <textarea id="notes" name="notes" rows="3">{data.product.notes || ''}</textarea>
        
        <div class="checkbox-group">
            <label><input type="checkbox" name="allowPriceEdit" bind:checked={allowPriceEdit} /> อนุญาตให้แก้ไขราคา</label>
            <label><input type="checkbox" name="notTrackStock" bind:checked={notTrackStock} /> ไม่ตัดสต็อก</label>
        </div>
      </fieldset>
      
      <footer>
        <button type="submit">บันทึกการเปลี่ยนแปลง</button>
        <a href="/products" role="button" class="secondary">ยกเลิก</a>
      </footer>
    </form>
  </article>
</main>

<style>
  .container { max-width: 960px; margin: 0 auto; }
  .error { color: var(--pico-form-element-invalid-color); }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem 2rem; margin-bottom: 1.5rem; }
  .barcode-group { display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: stretch; }
  .barcode-group input, .barcode-group button { margin-bottom: 0; }
  fieldset { padding: 0; border: none; }
  .checkbox-group { display: flex; gap: 2rem; margin-top: 1rem; }
</style>