<script lang="ts">
	import type { HTMLTHeadAttributes } from "svelte/elements";
	import { cn } from "$lib/utils";

	type $$Props = HTMLTHeadAttributes;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<thead class={cn("[&_tr]:border-b", className)} {...$$restProps}>
	<slot />
</thead>