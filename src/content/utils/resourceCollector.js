/**
 * Collects all resources from the current page
 */
export async function collectResources() {
	// Find all resources in the page
	const resources = [];

	// Collect images
	const images = Array.from(document.querySelectorAll('img'));
	images.forEach(img => {
		if (img.src) {
			resources.push({
				url: img.src,
				type: 'image',
				element: 'img'
			});
		}
	});

	// Collect CSS
	const styleSheets = Array.from(document.styleSheets);
	styleSheets.forEach(sheet => {
		try {
			if (sheet.href) {
				resources.push({
					url: sheet.href,
					type: 'css',
					element: 'link'
				});
			}
		} catch (e) {
			console.warn('Could not access stylesheet:', e);
		}
	});

	// Collect scripts
	const scripts = Array.from(document.querySelectorAll('script'));
	scripts.forEach(script => {
		if (script.src) {
			resources.push({
				url: script.src,
				type: 'javascript',
				element: 'script'
			});
		}
	});

	// Collect other resources (fonts, videos, etc.)
	const links = Array.from(document.querySelectorAll('link'));
	links.forEach(link => {
		if (link.href && link.rel) {
			resources.push({
				url: link.href,
				type: link.rel,
				element: 'link'
			});
		}
	});

	return resources;
}
