(function () {
	try {
		// Get domain (without "www." if exists)
		const domainRaw = window.location.hostname;
		const domain = domainRaw.replace(/^www\./, '');

		// Get the raw HTML of the page
		const html = document.documentElement.outerHTML;

		// Collect resource URLs from the page (using a Map to avoid duplicates)
		const resourceMap = new Map(); // Use a Map to avoid duplicates by URL

		// Helper function to add resource to our collection
		function addResource(url, type) {
			try {
				// Skip empty URLs
				if (!url) return;

				// Handle data URLs - keep them for images
				if (url.startsWith('data:') && type !== "image") return;

				const absoluteUrl = new URL(url, window.location.href).href;

				// Use URL as key to prevent duplicates
				if (!resourceMap.has(absoluteUrl)) {
					resourceMap.set(absoluteUrl, {
						url: absoluteUrl,
						type: type,
						filename: url.startsWith('data:')
							? `data-image-${resourceMap.size}.png`
							: absoluteUrl.split('/').pop().split('?')[0]
					});
				}
			} catch (e) {
				console.warn(`Skipping invalid URL: ${url}`, e);
			}
		}

		// Images from <img> elements
		document.querySelectorAll("img[src]").forEach((img) => {
			addResource(img.getAttribute("src"), "image");
		});

		// CSS files from <link rel="stylesheet"> elements
		document.querySelectorAll("link[rel='stylesheet'][href]").forEach((linkEl) => {
			addResource(linkEl.getAttribute("href"), "css");
		});

		// JavaScript files from <script src=""> elements
		document.querySelectorAll("script[src]").forEach((scriptEl) => {
			addResource(scriptEl.getAttribute("src"), "js");
		});

		// Font files from <link rel="preload"> with as="font"
		document.querySelectorAll("link[rel='preload'][as='font'][href]").forEach((fontEl) => {
			addResource(fontEl.getAttribute("href"), "font");
		});

		// Video sources
		document.querySelectorAll("video source[src]").forEach((sourceEl) => {
			addResource(sourceEl.getAttribute("src"), "video");
		});

		// Scan inline style attributes for url(...) references
		document.querySelectorAll("[style]").forEach((el) => {
			const styleAttr = el.getAttribute("style");
			const regex = /url\(["']?([^"')]+)["']?\)/g;
			let match;
			while ((match = regex.exec(styleAttr)) !== null) {
				addResource(match[1], "image");
			}
		});

		// Scan <style> tags for url(...) references
		document.querySelectorAll("style").forEach((styleEl) => {
			const cssText = styleEl.innerText;
			const regex = /url\(["']?([^"')]+)["']?\)/g;
			let match;
			while ((match = regex.exec(cssText)) !== null) {
				addResource(match[1], "image");
			}
		});

		// Convert resourceMap to array of resources
		const resources = [...resourceMap.values()];

		// Send the collected data to the background script for processing
		chrome.runtime.sendMessage({
			type: "PAGE_DATA",
			data: {
				domain: domain,
				html: html,
				resources: resources,
				url: window.location.href // Include the current URL
			}
		});
	} catch (err) {
		console.error("Error in content script:", err);
	}
})();
