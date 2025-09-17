<script lang="ts">
	import type { HTMLTableCaptionAttributes } from "svelte/elements";
	import { cn } from "$lib/utils";

	type $$Props = HTMLTableCaptionAttributes;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<caption
	class={cn("mt-4 text-sm text-muted-foreground", className)}
	{...$$restProps}
>
	<slot />
</caption>