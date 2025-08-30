<!-- File: src/routes/products/[id]/edit/+page.svelte (Final Corrected Version) -->

<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  
  export let data: PageData;
  export let form;

  // สร้าง state สำหรับค่าที่ bind ได้
  // ไม่ต้องมี barcode แล้ว เพราะเราไม่แก้ไขมัน
  let supplierId = data.product.supplierId;
  let vatType = data.product.vatType ?? 'none';
  let notTrackStock = !data.product.trackStock;
  let allowPriceEdit = data.product.allowPriceEdit;

  // [ลบออก] ฟังก์ชัน generateBarcode() ไม่ได้ใช้แล้ว
</script>

<main class="container">
  <article>
    <header>
      <h2>แก้ไขข้อมูลสินค้า: {data.product.name}</h2>
    </header>

    <!-- [แก้ไข] เปลี่ยน action เป็น ?/update เพื่อให้ตรงกับ +page.server.ts -->
    <form method="POST" action="?/update" use:enhance>
      {#if form?.error}
        <p class="error">{form.error}</p>
      {/if}

      <div class="form-grid">
        <!-- [แก้ไข] เปลี่ยน input ของ barcode เป็น readonly และลบปุ่ม "สร้างใหม่" -->
        <div>
          <label for="barcode">รหัสบาร์โค้ด (ไม่สามารถแก้ไขได้)</label>
          <input 
            type="text" 
            id="barcode" 
            name="barcode" 
            value={data.product.barcode || 'ไม่มี'} 
            readonly 
            disabled
          />
        </div>
        <div>
          <label for="name">* ชื่อสินค้า</label>
          <input type="text" id="name" name="name" required value={data.product.name} />
        </div>

        <!-- ... ส่วนที่เหลือของฟอร์มเหมือนเดิมทุกประการ ... -->
        
        <div>
          <label for="alias">ชื่อย่อ/รหัสค้นหา</label>
          <input type="text" id="alias" name="alias" value={data.product.alias || ''} />
        </div>
        <div>
          <label for="category">ประเภทสินค้า</label>
          <input type="text" id="category" name="category" value={data.product.category || ''} />
        </div>

        <div>
          <label for="costPrice">* ต้นทุน</label>
          <input type="number" step="0.01" id="costPrice" name="costPrice" required value={data.product.costPrice} />
        </div>
        <div>
          <label for="retailPrice">* ราคาปลีก</label>
          <input type="number" step="0.01" id="retailPrice" name="retailPrice" required value={data.product.retailPrice} />
        </div>

        <div>
          <label for="wholesalePrice">ราคาส่ง</label>
          <input type="number" step="0.01" id="wholesalePrice" name="wholesalePrice" value={data.product.wholesalePrice || ''} />
        </div>
        <div>
          <label for="vatType">Vat</label>
          <select id="vatType" name="vatType" bind:value={vatType}>
            <option value="none">ไม่มี Vat</option>
            <option value="include">ราคารวม Vat</option>
            <option value="exclude">ราคาไม่รวม Vat</option>
          </select>
        </div>
        
        <div>
            <label for="stockQuantity">* จำนวนสินค้า</label>
            <input type="number" id="stockQuantity" name="stockQuantity" required value={data.product.stockQuantity} />
        </div>
        <div>
            <label for="unit">หน่วย</label>
            <input type="text" id="unit" name="unit" placeholder="เช่น ชิ้น, กก." value={data.product.unit || ''} />
        </div>
        
        <div>
            <label for="reorderPoint">จุดสั่งซื้อ</label>
            <input type="number" id="reorderPoint" name="reorderPoint" value={data.product.reorderPoint || ''} />
        </div>
        <div>
            <label for="shelfLocation">ชั้นวางสินค้า</label>
            <input type="text" id="shelfLocation" name="shelfLocation" value={data.product.shelfLocation || ''} />
        </div>
      </div>

      <fieldset>
        <label for="supplierId">* ผู้ขายสินค้า</label>
        <select id="supplierId" name="supplierId" required bind:value={supplierId}>
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
  .container { max-width: 960px; margin: 2rem auto; }
  .error { color: var(--pico-color-red-500); background-color: var(--pico-form-element-invalid-background-color); padding: 0.75rem; border-radius: var(--pico-border-radius); border-left: 4px solid var(--pico-invalid-border-color); }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem 2rem; margin-bottom: 1.5rem; }
  /* [ลบออก] .barcode-group ไม่ได้ใช้แล้ว */
  fieldset { padding: 0; border: none; }
  .checkbox-group { display: flex; gap: 2rem; margin-top: 1rem; }
  
  /* [เพิ่ม] ทำให้ input ที่ readonly ดูแตกต่าง */
  input[readonly] {
    background-color: var(--pico-muted-background-color);
    cursor: not-allowed;
  }
</style>