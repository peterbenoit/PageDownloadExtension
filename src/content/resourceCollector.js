// Collected resources to be sent to background script
const collectedResources = [];

/**
 * Remove extension UI elements from the HTML being downloaded
 */
function cleanupExtensionElements(html) {
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
		'[data-extension-ui="page-download-extension"]'
	);

	extensionElements.forEach(el => el.remove());

	// Return the cleaned HTML
	return doc.documentElement.outerHTML;
}

/**
 * Add a resource to the collection
 */
function addResource(url, type) {
	try {
		if (!url) return;

		if (url.startsWith('data:') && type !== "image") return;

		// Remove quotes from URL if present
		const cleanUrl = url.replace(/^['"](.*)['"]$/, '$1');

		// Convert to absolute URL
		const absoluteUrl = new URL(cleanUrl, window.location.href).href;

		// Check if this resource is already in the collection
		const exists = collectedResources.some(res => res.url === absoluteUrl);
		if (!exists) {
			collectedResources.push({
				url: absoluteUrl,
				type: type,
				filename: cleanUrl.startsWith('data:')
					? `data-image-${collectedResources.length}.png`
					: absoluteUrl.split('/').pop().split('?')[0]
			});
		}
	} catch (e) {
		console.warn(`Skipping invalid URL: ${url}`, e);
	}
}

/**
 * Collect all resources from the page
 */
function collectAllResources() {
	// Process img tags
	document.querySelectorAll("img[src]").forEach((img) => {
		addResource(img.getAttribute("src"), "image");
	});

	// Process stylesheets
	document.querySelectorAll("link[rel='stylesheet'][href]").forEach((linkEl) => {
		addResource(linkEl.getAttribute("href"), "css");
	});

	// Process scripts
	document.querySelectorAll("script[src]").forEach((scriptEl) => {
		addResource(scriptEl.getAttribute("src"), "js");
	});

	// Process fonts
	document.querySelectorAll("link[rel='preload'][as='font'][href]").forEach((fontEl) => {
		addResource(fontEl.getAttribute("href"), "font");
	});

	// Process videos
	document.querySelectorAll("video source[src]").forEach((sourceEl) => {
		addResource(sourceEl.getAttribute("src"), "video");
	});

	// Extract background images from inline styles
	document.querySelectorAll("[style]").forEach((el) => {
		const styleAttr = el.getAttribute("style");
		// More flexible regex that handles spaces and various quoting styles
		const regex = /url\s*\(\s*(['"]?)([^"')]+)\1\s*\)/gi;
		let match;
		while ((match = regex.exec(styleAttr)) !== null) {
			addResource(match[2], "image");
		}
	});

	// Extract background images from style elements
	document.querySelectorAll("style").forEach((styleEl) => {
		const cssText = styleEl.textContent;
		const regex = /url\s*\(\s*(['"]?)([^"')]+)\1\s*\)/gi;
		let match;
		while ((match = regex.exec(cssText)) !== null) {
			addResource(match[2], "image");
		}
	});

	// Process fonts - expanded methods
	// 1. Standard preloaded fonts
	document.querySelectorAll("link[rel='preload'][as='font'][href]").forEach((fontEl) => {
		addResource(fontEl.getAttribute("href"), "font");
	});

	// 2. Font files by extension
	document.querySelectorAll("link[href]").forEach((linkEl) => {
		const href = linkEl.getAttribute("href");
		if (href && /\.(woff2?|ttf|otf|eot)($|\?)/.test(href)) {
			addResource(href, "font");
		}
	});

	// 3. Check for font URLs in stylesheets
	document.querySelectorAll("style").forEach((styleEl) => {
		const cssText = styleEl.textContent;
		const fontRegex = /url\s*\(\s*['"]?([^'")]+\.(woff2?|ttf|otf|eot))['"]?\s*\)/gi;
		let match;
		while ((match = fontRegex.exec(cssText)) !== null) {
			addResource(match[1], "font");
		}
	});

	return collectedResources;
}

/**
 * Collect resources and send them to the background script
 */
function collectPageResources() {
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.action === "getPageContent") {
			try {
				const domainRaw = window.location.hostname;
				const domain = domainRaw.replace(/^www\./, '');

				// Clean the HTML before sending it
				const html = cleanupExtensionElements(document.documentElement.outerHTML);

				// Process resources
				collectAllResources();

				// Log for debugging
				console.log("Resources found:", collectedResources);

				chrome.runtime.sendMessage({
					type: "PAGE_DATA",
					data: {
						domain: domain,
						html: html,
						resources: collectedResources,
						url: window.location.href
					}
				});
			} catch (err) {
				console.error("Error in content script:", err);
			}
		}
	});

	// Execute immediately for popup-based triggers
	chrome.runtime.sendMessage({ type: "PAGE_READY" });
}

module.exports = {
	cleanupExtensionElements,
	collectPageResources,
	addResource
};
