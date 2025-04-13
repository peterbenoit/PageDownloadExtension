// Helper functions for content script

// Clean up extension elements from HTML before sending it to background script
export function cleanupExtensionElements(html) {
	// Create a DOM parser to work with the HTML string
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');

	// Remove extension toast notification
	const toast = doc.getElementById('page-download-toast');
	if (toast) {
		toast.remove();
	}

	// Remove any other extension elements by their IDs or classes
	const extensionElements = doc.querySelectorAll(
		'#page-download-progress-bar, ' +
		'#page-download-progress-fill, ' +
		'#page-download-status, ' +
		'#file-status-container, ' +
		'.page-download-extension-element' // Add a class to any other elements you inject
	);

	extensionElements.forEach(el => el.remove());

	// Return the cleaned HTML
	return doc.documentElement.outerHTML;
}

// Add a resource to the resource map
export function addResource(url, type, resourceMap) {
	try {
		if (!url) return;

		if (url.startsWith('data:') && type !== "image") return;

		// Remove quotes from URL if present
		const cleanUrl = url.replace(/^['"](.*)['"]$/, '$1');

		const absoluteUrl = new URL(cleanUrl, window.location.href).href;

		if (!resourceMap.has(absoluteUrl)) {
			resourceMap.set(absoluteUrl, {
				url: absoluteUrl,
				type: type,
				filename: cleanUrl.startsWith('data:')
					? `data-image-${resourceMap.size}.png`
					: absoluteUrl.split('/').pop().split('?')[0]
			});
		}
	} catch (e) {
		console.warn(`Skipping invalid URL: ${url}`, e);
	}
}
