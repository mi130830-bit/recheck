<!-- File: src/routes/stock-in/+page.svelte -->

<script lang="ts">
  import type { Product, Supplier } from '@prisma/client';
  import { goto } from '$app/navigation';

  export let data;

  // สร้าง Type ที่ซับซ้อนขึ้นสำหรับรายการในตะกร้ารับของ
  type CartItem = Product & { receiveQty: number; receiveCost: number };

  let selectedSupplierId: number | null = null;
  let selectedProductId: number | null = null;
  let cart: CartItem[] = [];
  let notes = '';
  let isLoading = false;

  // ฟังก์ชันสำหรับเพิ่มสินค้าลงในรายการรับของ
  function addProductToCart() {
    if (!selectedProductId) return;
    const productToAdd = data.products.find(p => p.id === selectedProductId);

    // ตรวจสอบว่าสินค้ายังไม่มีในรายการ
    if (productToAdd && !cart.find(item => item.id === productToAdd.id)) {
      cart = [...cart, { ...productToAdd, receiveQty: 1, receiveCost: productToAdd.costPrice }];
    }
    selectedProductId = null; // Reset dropdown หลังเพิ่มเสร็จ
  }

  function removeFromCart(productId: number) {
    cart = cart.filter(c => c.id !== productId);
  }

  // ฟังก์ชันสำหรับบันทึกการรับสินค้า
  async function handleSave() {
    if (!selectedSupplierId || cart.length === 0) {
      alert('กรุณาเลือกผู้ขายและเพิ่มสินค้าอย่างน้อย 1 รายการ');
      return;
    }
    isLoading = true;
    try {
      const response = await fetch('/api/stock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: selectedSupplierId,
          items: cart, // ส่งรายการทั้งหมดไป
          notes: notes,
        }),
      });

      if (response.ok) {
        alert('บันทึกการรับสินค้าสำเร็จ!');
        // ไปที่หน้ารายการสินค้าเพื่อดูสต็อกที่อัปเดต
        await goto('/products'); 
      } else {
        const err = await response.json();
        alert(`เกิดข้อผิดพลาด: ${err.error}`);
      }
    } catch (error) {
        console.error('Save stock-in error:', error);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      isLoading = false;
    }
  }

  // คำนวณต้นทุนรวมอัตโนมัติ
  $: totalCost = cart.reduce((sum, item) => sum + item.receiveCost * item.receiveQty, 0);
</script>

<main class="container">
  <article>
    <header>
      <h2>รับของเข้าคลัง / สร้างใบสั่งซื้อ</h2>
    </header>
    
    <div class="grid">
      <label for="supplier"><strong>1. เลือกผู้ขาย</strong>
        <select id="supplier" bind:value={selectedSupplierId} required>
          <option value={null} disabled selected>-- กรุณาเลือกผู้ขาย --</option>
          {#each data.suppliers as supplier (supplier.id)}
            <option value={supplier.id}>{supplier.name} ({supplier.code})</option>
          {/each}
        </select>
      </label>
    </div>

    <fieldset>
        <legend><strong>2. เพิ่มรายการสินค้า</strong></legend>
        <div class="product-adder">
            <select bind:value={selectedProductId}>
                <option value={null} disabled selected>-- ค้นหาและเลือกสินค้าเพื่อเพิ่มในรายการ --</option>
                {#each data.products as product (product.id)}
                <option value={product.id}>{product.name} ({product.barcode || 'ไม่มีบาร์โค้ด'})</option>
                {/each}
            </select>
            <button on:click={addProductToCart} disabled={!selectedProductId}>เพิ่มรายการ</button>
        </div>

        <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>สินค้า</th>
                    <th style="width: 120px;">จำนวนรับเข้า</th>
                    <th style="width: 150px;">ต้นทุน/หน่วย</th>
                    <th style="width: 150px;">ราคารวม</th>
                    <th style="width: 50px;">ลบ</th>
                </tr>
            </thead>
            <tbody>
            {#if cart.length === 0}
                <tr><td colspan="5" style="text-align:center;">-- ยังไม่มีรายการ --</td></tr>
            {:else}
                {#each cart as item (item.id)}
                <tr>
                    <td>{item.name}</td>
                    <td><input type="number" bind:value={item.receiveQty} min="1" /></td>
                    <td><input type="number" step="0.01" bind:value={item.receiveCost} min="0" /></td>
                    <td><strong>{(item.receiveQty * item.receiveCost).toFixed(2)}</strong></td>
                    <td><button on:click={() => removeFromCart(item.id)} class="contrast outline small-btn">X</button></td>
                </tr>
                {/each}
            {/if}
            </tbody>
            <tfoot>
            <tr>
                <td colspan="3" style="text-align:right;"><strong>ต้นทุนรวมทั้งหมด</strong></td>
                <td colspan="2"><strong class="total-cost">{totalCost.toFixed(2)}</strong></td>
            </tr>
            </tfoot>
        </table>
        </div>
    </fieldset>

    <label for="notes"><strong>3. หมายเหตุ (ถ้ามี)</strong></label>
    <textarea bind:value={notes} id="notes" placeholder="เช่น เลขที่บิลอ้างอิงจากผู้ขาย..."></textarea>

    <footer>
      <button on:click={handleSave} aria-busy={isLoading} disabled={!selectedSupplierId || cart.length === 0}>
        {isLoading ? 'กำลังบันทึก...' : 'ยืนยันและบันทึกการรับสินค้า'}
      </button>
    </footer>
  </article>
</main>

<style>
  .container { max-width: 960px; margin: 0 auto; }
  .product-adder { display: grid; grid-template-columns: 1fr auto; gap: 1rem; margin-bottom: 1rem; }
  .table-container { overflow-y: auto; max-height: 40vh; }
  .small-btn { padding: 0.2rem; line-height: 1; width: 28px; height: 28px; }
  .total-cost { font-size: 1.2em; color: var(--pico-primary); }
</style>