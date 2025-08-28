<!-- Path: src/routes/env-test/+page.svelte -->
<script lang="ts">
  export let data;
</script>

<h1>Environment Variable Test</h1>
<p>
  TELEGRAM_BOT_TOKEN: 
  {#if data.botTokenLoaded}
    <strong style="color: green;">LOADED SUCCESSFULLY</strong>
  {:else}
    <strong style="color: red;">NOT FOUND</strong>
  {/if}
</p>
<p>
  TELEGRAM_SHIPPING_CHAT_ID: 
  {#if data.shippingChatIdLoaded}
    <strong style="color: green;">LOADED SUCCESSFULLY</strong>
  {:else}
    <strong style="color: red;">NOT FOUND</strong>
  {/if}
</p>

<hr/>
<p>Please check the terminal where you ran `npm run dev` for more details.</p>