<script lang="ts">
	import Map from '$lib/Map.svelte';

	export let data: import ('./$types').PageData;
</script>

<Map countryCode={data.country}/>

<style>
	:global(body) {
		padding: 0;
	}
</style>
