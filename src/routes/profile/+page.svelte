<!-- File: src/routes/profile/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;
</script>

<h1>หน้าโปรไฟล์</h1>
<p>ยินดีต้อนรับ, <strong>{data.user.username}</strong>!</p>
<p>บทบาทของคุณคือ: {data.user.role}</p>