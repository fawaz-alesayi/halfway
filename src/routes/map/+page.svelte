<script>
	import Map from '$lib/Map.svelte';
	// disable ssr and hydration

	export const ssr = false;

</script>

<Map />

<style>
	:global(body) {
		padding: 0;
	}
</style>
