export const load: import('./$types').PageServerLoad = async ({ request }) => {
	// get cloudflare country code
	const country = request.headers.get('cf-ipcountry');

	return {
		country,
	};
}
