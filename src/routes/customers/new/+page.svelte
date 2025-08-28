<!-- File: src/routes/customers/new/+page.svelte (ฉบับ Final Touch) -->

<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
</script>

<main class="container">
  <article>
    <header>
      <h2>เพิ่มรายการสมาชิก</h2>
    </header>

    <form method="POST" use:enhance>
      {#if $page.form?.message}
        <p class="error">{$page.form.message}</p>
      {/if}

      <!-- Grid หลักสำหรับข้อมูลส่วนตัว -->
      <div class="main-grid">
        <fieldset>
          <legend>ข้อมูลส่วนตัว</legend>

          <label for="memberCode">* รหัสสมาชิก</label>
          <input type="text" id="memberCode" name="memberCode" required />
          
          <label for="title">คำนำหน้า</label>
          <select id="title" name="title">
            <option value="">-</option>
            <option value="นาย">นาย</option>
            <option value="นาง">นาง</option>
            <option value="นางสาว">นางสาว</option>
          </select>

          <!-- VVVVVV แก้ไขส่วนนี้ VVVVVV -->
          <label for="firstName">* ชื่อ</label>
          <input type="text" id="firstName" name="firstName" required />
          
          <label for="lastName">นามสกุล</label>
          <input type="text" id="lastName" name="lastName" />
          <!-- ^^^^^^ สิ้นสุดส่วนที่แก้ไข ^^^^^^ -->

        </fieldset>

        <fieldset>
            <legend>ข้อมูลระบุตัวตนและเพิ่มเติม</legend>
            
            <label for="nationalId">เลขบัตรประชาชน</label>
            <input type="text" id="nationalId" name="nationalId" />

            <label for="taxId">เลขที่ภาษี</label>
            <input type="text" id="taxId" name="taxId" />

            <label for="dateOfBirth">วันเกิด</label>
            <input type="date" id="dateOfBirth" name="dateOfBirth" />

            <label for="creditLimit">จำกัดวงเงิน</label>
            <input type="number" step="0.01" id="creditLimit" name="creditLimit" />
        </fieldset>
      </div>
      
      <!-- ส่วนข้อมูลติดต่อ จะอยู่นอก Grid หลักเพื่อให้เต็มความกว้าง -->
      <fieldset>
        <legend>ข้อมูลติดต่อ</legend>
        <div class="grid">
            <label for="phone">เบอร์โทร</label>
            <input type="tel" id="phone" name="phone" />
        </div>
        <div class="grid">
            <label for="email">E-mail</label>
            <input type="email" id="email" name="email" />
        </div>
        
        <label for="address">ที่อยู่</label>
        <textarea id="address" name="address" rows="3"></textarea>
        
        <label for="shippingAddress">ที่อยู่จัดส่งสินค้า</label>
        <textarea id="shippingAddress" name="shippingAddress" rows="3"></textarea>
      </fieldset>

      <!-- หมายเหตุ ย้ายมาอยู่ล่างสุด -->
      <fieldset>
        <legend>หมายเหตุ</legend>
        <textarea id="notes" name="notes" rows="4"></textarea>
      </fieldset>

      <footer>
        <button type="submit">บันทึก</button>
        <a href="/customers" role="button" class="secondary">ยกเลิก</a>
      </footer>
    </form>
  </article>
</main>

<style>
  .container { max-width: 960px; margin: 2rem auto; }
  .error { color: var(--pico-color-red-500); background-color: var(--pico-color-red-100); padding: 0.75rem; border-radius: var(--pico-border-radius); }
  
  .main-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem 2rem;
  }
  
  /* ไม่จำเป็นต้องใช้ .grid แล้ว เพราะทุกอย่างแยกแถวกันหมด */

  fieldset {
    padding: 0;
    border: none;
    margin-bottom: 1.5rem;
  }

  legend {
    font-weight: bold;
    margin-bottom: 0.75rem;
    font-size: 1.1em;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid var(--pico-muted-border-color);
    width: 100%;
  }

  /* เพิ่มระยะห่างระหว่าง Label และ Input ที่อยู่ติดกัน */
  label + input, label + select {
      margin-top: -0.5rem;
  }
</style>