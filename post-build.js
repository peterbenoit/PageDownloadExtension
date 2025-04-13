// Simple script to copy static files to dist folder after build
import fs from 'fs';
import path from 'path';

// Files to copy (relative to root directory)
const filesToCopy = [
	'popup.html',
	'jszip.min.js',
	'icons/icon16.png',
	'icons/icon32.png',
	'icons/icon48.png',
	'icons/icon128.png'
];

// Ensure the destination directory exists
function ensureDirectoryExistence(filePath) {
	const dirname = path.dirname(filePath);
	if (fs.existsSync(dirname)) {
		return true;
	}
	ensureDirectoryExistence(dirname);
	fs.mkdirSync(dirname);
}

console.log('Starting post-build file copy...');

// Copy each file to dist
filesToCopy.forEach(file => {
	const sourcePath = path.resolve(file);
	const targetPath = path.resolve('dist', file);

	try {
		// Make sure target directory exists
		ensureDirectoryExistence(targetPath);

		// Copy the file
		fs.copyFileSync(sourcePath, targetPath);
		console.log(`Copied ${file} to dist/${file}`);
	} catch (err) {
		console.warn(`Failed to copy ${file}: ${err.message}`);
	}
});

console.log('Post-build file copy complete!');
