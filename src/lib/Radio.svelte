<script lang="ts">
	export let checked: boolean = false;
	export let value: string;
	export let id: string = value;
	export let name: string;
</script>

<div>
	<input type="radio" {name} {value} {id} {checked} />
	<label for={id}><slot /></label>
</div>
