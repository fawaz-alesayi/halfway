<script lang="ts">
	import AutoComplete from './AutoComplete.svelte';
	import { mapService } from './mapMachine';
	let location = '';
	export let onPlaceChanged: (place: google.maps.places.PlaceResult) => void;

	export let directionsService: google.maps.DirectionsService;

	const calculateDirections = async (marker1: google.maps.Marker, marker2: google.maps.Marker) => {
		const request: google.maps.DirectionsRequest = {
			origin: marker1.getPosition() as google.maps.LatLng,
			destination: marker2.getPosition() as google.maps.LatLng,
			travelMode: google.maps.TravelMode.DRIVING
		};

		const result = await directionsService.route(request);

		console.log(result);

		const directionsRenderer = new google.maps.DirectionsRenderer();
		const map = $mapService.context.map;
		directionsRenderer.setMap(map);
		directionsRenderer.setDirections(result);
	};

	$: buttonEnabled =
		$mapService.context.firstPersonMarker.placed && $mapService.context.secondPersonMarker.placed;
</script>

<div class="z-10 absolute flex justify-center pointer-events-none">
	<form class="flex items-center justify-center">
		<label for="simple-search" class="sr-only">Search</label>
		<div class="relative w-full">
			<div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
				<svg
					aria-hidden="true"
					class="w-5 h-5 text-gray-500 dark:text-gray-400"
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
					><path
						fill-rule="evenodd"
						d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
						clip-rule="evenodd"
					/></svg
				>
			</div>
			<AutoComplete
				options={{ fields: ['geometry', 'name', 'formatted_address'] }}
				placeholder="Search for a place"
				on:place_changed={(event) => {
					onPlaceChanged(event.detail.place);
				}}
				value={location}
				class="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
			/>
		</div>
		<div class="mt-4 bg-indigo-700 text-white">
			State: {$mapService.value}
		</div>
	</form>

	<button
		type="button"
		disabled={!buttonEnabled}
		on:click={() => {
			calculateDirections(
				$mapService.context.firstPersonMarker.marker,
				$mapService.context.secondPersonMarker.marker
			);
		}}
		class="self-end px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
	>
		{#if buttonEnabled}
			Find the midpoint
		{:else}
			Place both markers
		{/if}
	</button>
</div>

<style global>
	.pac-container {
		background-color: white;
	}

	.pac-container:after {
		/* Disclaimer: not needed to show 'powered by Google' if also a Google Map is shown */

		background-image: none;
		height: 0px;
	}

	button, input, select, textarea, a {
		pointer-events: auto;
	}
</style>
