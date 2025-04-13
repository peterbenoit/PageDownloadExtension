import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Read the manifest file
const manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf-8'));

// Custom plugin to copy static files after build
const copyStaticFiles = () => {
	return {
		name: 'copy-static-files',
		closeBundle: async () => {
			// Copy popup.html
			fs.copyFileSync('./popup.html', './dist/popup.html');

			// Make sure jszip.min.js is available
			try {
				fs.copyFileSync('./jszip.min.js', './dist/jszip.min.js');
			} catch (err) {
				console.warn('jszip.min.js not found in source, will be bundled from node_modules');
			}

			// Make sure icons directory exists
			const iconsDir = path.resolve('./dist/icons');
			if (!fs.existsSync(iconsDir)) {
				fs.mkdirSync(iconsDir, { recursive: true });
			}

			// Copy icon files
			['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'].forEach(icon => {
				fs.copyFileSync(`./icons/${icon}`, `./dist/icons/${icon}`);
			});
		}
	};
};

export default defineConfig({
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				background: path.resolve('./src/background/index.js'),
				content: path.resolve('./src/content/index.js'),
				popup: path.resolve('./src/popup/index.js'),
			},
			output: {
				entryFileNames: '[name].js',
				chunkFileNames: 'chunks/[name].[hash].js',
				assetFileNames: 'assets/[name].[ext]',
			},
		},
		target: 'esnext',
	},
	plugins: [
		crx({ manifest }),
		copyStaticFiles()
	],
	resolve: {
		alias: {
			'@': path.resolve('./src'),
		},
	},
	optimizeDeps: {
		include: ['jszip']
	},
	// Configure asset handling to properly process HTML files
	assetsInclude: ['**/*.html'],
});
