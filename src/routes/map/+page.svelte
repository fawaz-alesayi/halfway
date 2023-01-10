<script lang="ts">
	import Map from '$lib/Map.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<Map countryCode={data.country} />

<style>
	:global(body) {
		padding: 0;
	}
</style>
