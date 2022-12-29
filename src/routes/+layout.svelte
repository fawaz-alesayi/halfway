<script lang="ts">
	import '../app.css';
	import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query';

	const queryClient = new QueryClient();
</script>

<svelte:head>
	<title>Halfway</title>
	<meta name="description" content="Find the perfect place to meet people" />
</svelte:head>

<QueryClientProvider client={queryClient}>
	<slot />
</QueryClientProvider>