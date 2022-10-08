<script lang="ts">
	import { Loader } from '@googlemaps/js-api-loader';
	import { PUBLIC_GMAPS_KEY } from '$env/static/public';
	import { doubleClickZooming } from './zoomMachine';
	import { useMachine } from '@xstate/svelte';
	import { onMount } from 'svelte';
	import { pan } from 'svelte-gestures';
	let map: google.maps.Map;

	let holdingMap = false;

	const { send, state, service } = useMachine(doubleClickZooming);

	// User location
	let marker1: google.maps.Marker;

	// Other user location
	let marker2: google.maps.Marker;

	let bounds: google.maps.LatLngBounds | undefined;

	let anchor: google.maps.LatLngBounds | undefined;

	let container: HTMLElement;
	let zoom = 8;
	let center = { lat: -34.397, lng: 150.644 };

	const placeMarker = (marker: google.maps.Marker, position: google.maps.LatLng) => {
		if (marker1) {
			marker1.setPosition(position);
		} else {
			marker1 = new google.maps.Marker({
				position,
				map
			});
		}
	};

	onMount(() => {
		const loader = new Loader({
			apiKey: PUBLIC_GMAPS_KEY as string,
			version: 'quarterly'
		});

		loader.load().then(() => {
			map = new google.maps.Map(container, {
				center,
				zoom,
				gestureHandling: 'greedy',
				zoomControl:false,
				streetViewControl:false,
			});

			send({
				type: 'mapLoaded',
				map: map
			});

			// add an OnClick event to the map that adds a marker on the clicked location
			map.addListener('dblclick', (event: any) => {
				console.log(event);
				console.log('clicked on map');
				placeMarker(marker1, event.latLng);
				// map.setCenter(event.latLng);
			});

			bounds = map.getBounds();
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
		<p class="bg-indigo-600 text-2xl text-white">
			{$state.value}
		</p>
		<p class="bg-indigo-600 text-2xl text-white">
			{`bounds: ${bounds}`}
		</p>
	</div>
{/if}
<div
	class="full-screen"
	on:touchstart={() => {
		send('touchstart');
	}}
	on:touchend={() => {
		send('touchend');
	}}
	use:pan
	on:pan={(e) => {
		console.log(e.detail);
		send({
			type: 'pan',
			x: e.detail.x,
			y: e.detail.y
		});
		// zoom in on the map by changing the bounds
	}}
	bind:this={container}
/>

<style>
	.full-screen {
		width: 100vw;
		height: 100vh;
	}
</style>
