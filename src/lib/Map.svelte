<script lang="ts">
	import { Loader } from '@googlemaps/js-api-loader';
	import { PUBLIC_GMAPS_KEY } from '$env/static/public';
	let map: google.maps.Map;

	let container: HTMLElement;
	let zoom = 8;
	let center = { lat: -34.397, lng: 150.644 };

	import { onMount } from 'svelte';

	onMount(async () => {
		
		const loader = new Loader({
			apiKey: PUBLIC_GMAPS_KEY as string,
			version: 'quarterly'
		});

		loader.load().then(() => {
			map = new google.maps.Map(container, {
				center,
				zoom
			});
		});

		// ask for current user location
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				const pos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				map.setCenter(pos);
			}, () => {
				
			});
		} else {
			// Browser doesn't support Geolocation
			
		}
	});
</script>

<div class="full-screen" bind:this={container} />

<style>
	.full-screen {
		width: 100vw;
		height: 100vh;
	}  
</style>
