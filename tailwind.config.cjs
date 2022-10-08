/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/pnpm/flowbite-svelte*/**/*.{html,js,svelte,ts}',
	],
	theme: {
		extend: {}
	},
	plugins: [require('@tailwindcss/forms'), require('flowbite/plugin'), require("daisyui")]
};
