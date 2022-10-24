/** @type {import('./$types').PageServerLoad} */
export function load({ request }) {
	// get cloudflare country code
	const country = request.headers.get('cf-ipcountry');

	return {
		country,
	};
}
