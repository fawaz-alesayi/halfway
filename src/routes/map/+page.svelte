<script lang="ts">
	import Map from '$lib/Map.svelte';

	  /** @type {import('./$types').PageData} */
	export let data;
</script>

<Map countryCode={data.country}/>

<style>
	:global(body) {
		padding: 0;
	}
</style>
