import { defineConfig } from 'vite';
import { resolve } from 'path';
import copy from 'rollup-plugin-copy';

export default defineConfig({
	build: {
		outDir: 'dist',
		rollupOptions: {
			input: {
				background: resolve(__dirname, 'src/background.js'),
				content: resolve(__dirname, 'src/content.js'),
				popup: resolve(__dirname, 'src/popup.js'),
			},
			output: {
				entryFileNames: '[name].js',
				format: 'iife',
			},
		},
	},
	plugins: [
		copy({
			targets: [
				{ src: 'src/manifest.json', dest: 'dist' },
				{ src: 'src/icons', dest: 'dist' },
				{ src: 'src/popup.html', dest: 'dist' },
			],
			hook: 'writeBundle',
		}),
	],
});
