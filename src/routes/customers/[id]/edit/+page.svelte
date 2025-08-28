<!-- File: src/routes/customers/[id]/edit/+page.svelte -->

<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  export let data; // รับข้อมูล customer จาก load
</script>

<main class="container">
  <article>
    <header>
      <h2>แก้ไขข้อมูลสมาชิก: {data.customer.firstName}</h2>
    </header>

    <form method="POST" action="?/update" use:enhance>
      {#if $page.form?.message}
        <p class="error">{$page.form.message}</p>
      {/if}

      <div class="main-grid">
        <fieldset>
          <legend>ข้อมูลส่วนตัว</legend>
          <label for="memberCode">* รหัสสมาชิก</label>
          <input type="text" id="memberCode" name="memberCode" required value={data.customer.memberCode} />
          
          <label for="title">คำนำหน้า</label>
          <select id="title" name="title" bind:value={data.customer.title}>
            <option value="">-</option>
            <option value="นาย">นาย</option>
            <option value="นาง">นาง</option>
            <option value="นางสาว">นางสาว</option>
          </select>

          <label for="firstName">* ชื่อ</label>
          <input type="text" id="firstName" name="firstName" required value={data.customer.firstName} />
          
          <label for="lastName">นามสกุล</label>
          <input type="text" id="lastName" name="lastName" value={data.customer.lastName || ''} />
        </fieldset>

        <fieldset>
            <legend>ข้อมูลระบุตัวตนและเพิ่มเติม</legend>
            <label for="nationalId">เลขบัตรประชาชน</label>
            <input type="text" id="nationalId" name="nationalId" value={data.customer.nationalId || ''} />
            <label for="taxId">เลขที่ภาษี</label>
            <input type="text" id="taxId" name="taxId" value={data.customer.taxId || ''} />
            <label for="dateOfBirth">วันเกิด</label>
            <input type="date" id="dateOfBirth" name="dateOfBirth" value={data.customer.dateOfBirthString || ''} />
            <label for="creditLimit">จำกัดวงเงิน</label>
            <input type="number" step="0.01" id="creditLimit" name="creditLimit" value={data.customer.creditLimit || ''} />
        </fieldset>
      </div>
      
      <fieldset>
        <legend>ข้อมูลติดต่อ</legend>
        <div class="grid">
            <label for="phone">เบอร์โทร</label>
            <input type="tel" id="phone" name="phone" value={data.customer.phone || ''} />
        </div>
        <div class="grid">
            <label for="email">E-mail</label>
            <input type="email" id="email" name="email" value={data.customer.email || ''} />
        </div>
        <label for="address">ที่อยู่</label>
        <textarea id="address" name="address" rows="3">{data.customer.address || ''}</textarea>
        <label for="shippingAddress">ที่อยู่จัดส่งสินค้า</label>
        <textarea id="shippingAddress" name="shippingAddress" rows="3">{data.customer.shippingAddress || ''}</textarea>
      </fieldset>

      <fieldset>
        <legend>หมายเหตุ</legend>
        <textarea id="notes" name="notes" rows="4">{data.customer.notes || ''}</textarea>
      </fieldset>

      <footer>
        <button type="submit">บันทึกการเปลี่ยนแปลง</button>
        <a href="/customers" role="button" class="secondary">ยกเลิก</a>
      </footer>
    </form>
  </article>
</main>

<style>
  /* คัดลอก CSS จาก src/routes/customers/new/+page.svelte มาใช้ได้เลย */
  .container { max-width: 960px; margin: 0 auto; }
  .error { color: var(--pico-form-element-invalid-color); }
  .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem 2rem; }
  fieldset { padding: 0; border: none; margin-bottom: 1.5rem; }
  legend { font-weight: bold; margin-bottom: 0.75rem; font-size: 1.1em; padding-bottom: 0.25rem; border-bottom: 1px solid var(--pico-muted-border-color); width: 100%; }
</style>