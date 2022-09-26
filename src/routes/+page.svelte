<script lang="ts">
	import Button from '$lib/Button.svelte';
	import Radio from '$lib/Radio.svelte';
</script>

<!-- A -->
<section class="p-4 flex flex-col sm:items-center">
	<h1 class="text-center text-3xl">Halfway</h1>
	<h2 class="text-center text-xl">Find places to meet someone halfway</h2>
	<div class="mt-4 flex flex-row space-x-4 justify-center">
		<Button>I'll choose the place</Button>
		<Button>They'll choose the place</Button>
	</div>

	<section>
		<h3 class="text-2xl mt-8">How do you want to meet?</h3>
		<form class="mt-4">
			<p>Type of place</p>
			<div class="mb-2">
				<Radio name="type" value="resturant">Resturant</Radio>
				<Radio name="type" value="bar">Bar</Radio>
				<Radio name="type" value="coffee">Coffee Shop</Radio>
			</div>

			<p>Are you comfortable with a busy place?</p>
			<Radio name="busy" value="yes">Yes</Radio>
			<Radio name="busy" value="no">No</Radio>

			<p>Add time and place?</p>
			<Radio name="time" value="yes">Yes</Radio>
			<Radio name="time" value="no" checked={true}>No</Radio>
		</form>

		<section class="text-center mt-8" >
			<h4 class="text-xl mb-4">Next, choose your starting location</h4>
			<a href="/map" class="text-2xl font-bold">Choose location</a>
		</section>
	</section>
</section>
