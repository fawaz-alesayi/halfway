<script lang="ts">
	import UIOverlay from './UIOverlay.svelte';

	import { Loader } from '@googlemaps/js-api-loader';
	import { PUBLIC_GMAPS_KEY, PUBLIC_MAP_ID } from '$env/static/public';
	import { onMount } from 'svelte';
	import { pan } from 'svelte-gestures';
	import { mapService } from './mapMachine';
	
	export let countryCode: any;

	let map: google.maps.Map;

	let container: HTMLElement;
	let zoom = 6

	let directionsService: google.maps.DirectionsService;

	onMount(() => {
		const loader = new Loader({
			apiKey: PUBLIC_GMAPS_KEY as string,
			libraries: ['places'],
			version: 'quarterly'
		});

		loader.load().then(() => {
			map = new google.maps.Map(container, {
				zoom,
				gestureHandling: 'greedy',
				zoomControl: false,
				streetViewControl: false,
				mapId: PUBLIC_MAP_ID,
				fullscreenControl: false,
				mapTypeControl: false
			});
			const geocoder = new google.maps.Geocoder();
			const regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
			const country = regionNames.of(countryCode);
			geocoder.geocode({ address: country }, (results, status) => {
				if (status === 'OK') {
					map.setCenter(results[0].geometry.location);
				} else {
					alert('Geocode was not successful for the following reason: ' + status);
				}
			});

			directionsService = new google.maps.DirectionsService();

			map.setOptions({
				isFractionalZoomEnabled: true
			});

			mapService.send({
				type: 'mapLoaded',
				map: map
			});

			// // add an OnClick event to the map that adds a marker on the clicked location
			// map.addListener('click', (event: google.maps.MapMouseEvent) => {
			// 	console.log(event);
			// 	console.log('clicked on map');
			// 	placeMarker(marker1, event.latLng);
			// 	// map.setCenter(event.latLng);
			// });

			map.addListener('drag', (event: google.maps.MapMouseEvent) => {
				mapService.send({
					type: 'drag'
				});
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
					map.setZoom(12);
				},
				() => {}
			);
		} else {
			// Browser doesn't support Geolocation
		}
	});
</script>

{#if map && directionsService}
	<UIOverlay
		{directionsService}
		onPlaceChanged={(place) => {
			// Smoothly pan to the new location
			console.log(place);
			if (place.geometry?.location) {
				map.panTo(place.geometry.location);
			} else {
				console.log('no location');
			}
		}}
	/>
{/if}
<div
	class="full-screen"
	use:pan={{ delay: 0 }}
	on:pan={(e) => {
		mapService.send({
			type: 'pan',
			x: e.detail.x,
			y: e.detail.y
		});
	}}
	on:pointerdown={(e) => {
		mapService.send({
			type: 'touchstart',
			x: e.clientX,
			y: e.clientY
		});
	}}
	on:touchmove={(e) => {
		mapService.send({
			type: 'touchmove',
			y: e.touches[0].clientY,
			x: e.touches[0].clientX
		});
	}}
	on:pointerup={() => {
		mapService.send('touchend');
	}}
	bind:this={container}
/>

<style>
	.full-screen {
		width: 100vw;
		height: 100vh;
	}
</style>
