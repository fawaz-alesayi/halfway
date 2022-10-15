<script lang="ts">
	import { Loader } from '@googlemaps/js-api-loader';
	import { PUBLIC_GMAPS_KEY, PUBLIC_MAP_ID } from '$env/static/public';
	import { doubleClickZooming } from './zoomMachine';
	import { useMachine } from '@xstate/svelte';
	import { onMount } from 'svelte';
	import { pan } from 'svelte-gestures';
	let map: google.maps.Map;

	const { send, state } = useMachine(doubleClickZooming);

	// User location
	let marker1: google.maps.Marker;

	// Other user location
	let marker2: google.maps.Marker;

	let container: HTMLElement;
	let zoom = 11;
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
				zoomControl: false,
				streetViewControl: false,
				mapId: PUBLIC_MAP_ID
			});

			map.setOptions({
				isFractionalZoomEnabled: true
			});

			send({
				type: 'mapLoaded',
				map: map
			});

			// add an OnClick event to the map that adds a marker on the clicked location
			// map.addListener('dblclick', (event: any) => {
			// 	console.log(event);
			// 	console.log('clicked on map');
			// 	placeMarker(marker1, event.latLng);
			// 	// map.setCenter(event.latLng);
			// });
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
	<div class="fixed z-10 top-16 text-4xl left-4 rounded-md ">
		<!-- <button
			type="button"
			class="mx-auto inline-flex items-center rounded-full border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
			>Confirm First Location</button
		> -->
		<p class="bg-indigo-600 text-2xl text-white mb-4 p-1">
			{$state.value}
		</p>
		<p class="bg-indigo-600 text-2xl text-white mb-2 p-1">
			{`y-anchor: ${$state.context['anchor'].y}`}
		</p>
		<p class="bg-indigo-600 text-2xl text-white p-1">
			{`displacement: ${$state.context['anchor'].y - $state.context['y']}`}
		</p>
		<p class="bg-indigo-600 text-2xl text-white p-1">
			{`zoom: ${$state.context['map']?.getZoom()}`}
		</p>
	</div>
{/if}
<div
	class="full-screen"
	on:touchstart={(e) => {
		send({
			type: 'touchstart',
			y: e.touches[0].clientY,
			x: e.touches[0].clientX
		});
	}}
	on:touchend={() => {
		send('touchend');
	}}
	use:pan={{ delay: 0 }}
	on:pan={(e) => {
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
