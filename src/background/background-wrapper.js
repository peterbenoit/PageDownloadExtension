// This is a wrapper file for the background script
// It serves as an entry point for webpack without using ES modules syntax

(function () {
	// Import JSZip globally
	try {
		self.importScripts('jszip.min.js');
	} catch (e) {
		console.error('Error importing JSZip:', e);
	}

	// Require all needed modules
	require('./index');
})();
