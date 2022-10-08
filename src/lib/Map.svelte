<script lang="ts">
	import { Loader } from '@googlemaps/js-api-loader';
	import { PUBLIC_GMAPS_KEY } from '$env/static/public';
	let map: google.maps.Map;

	// User location
	let marker1: google.maps.Marker;

	let container: HTMLElement;
	let zoom = 8;
	let center = { lat: -34.397, lng: 150.644 };

	import { onMount } from 'svelte';

	const placeMarker = (marker: google.maps.Marker, position: google.maps.LatLng) => {
		if (marker1) {
			marker1.setPosition(position);
		} else {
			marker1 = new google.maps.Marker({
				position,
				map,
			});
		}
	};

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

			// add an OnClick event to the map that adds a marker on the clicked location
			map.addListener('click', (event: any) => {
				console.log(event);
				console.log('clicked on map');
				placeMarker(marker1, event.latLng);
				map.setCenter(event.latLng);
			});
		});

		// ask for current user location
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const pos = {
						lat: position.coords.latitude,
						lng: position.coords.longitude
					};
					map.setCenter(pos);
				},
				() => {}
			);
		} else {
			// Browser doesn't support Geolocation
		}
	});
</script>

{#if map}
	<div class="fixed z-10 top-16 text-4xl">
		<button
			type="button"
			class="mx-auto inline-flex items-center rounded-full border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
			>Confirm First Location</button
		>
	</div>
{/if}
<div class="full-screen" bind:this={container} />

<style>
	.full-screen {
		width: 100vw;
		height: 100vh;
	}
</style>
