<script lang="ts">
	import type { HTMLTBodyAttributes } from "svelte/elements";
	import { cn } from "$lib/utils";

	type $$Props = HTMLTBodyAttributes;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<tbody
	class={cn("[&_tr:last-child]:border-0", className)}
	{...$$restProps}
>
	<slot />
</tbody>