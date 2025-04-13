// Resource collector functions
import { addResource } from './utils.js';

// Collect all resources from the page
export function collectPageResources() {
	const resourceMap = new Map();

	// Process img tags
	document.querySelectorAll("img[src]").forEach((img) => {
		addResource(img.getAttribute("src"), "image", resourceMap);
	});

	// Process stylesheets
	document.querySelectorAll("link[rel='stylesheet'][href]").forEach((linkEl) => {
		addResource(linkEl.getAttribute("href"), "css", resourceMap);
	});

	// Process scripts
	document.querySelectorAll("script[src]").forEach((scriptEl) => {
		addResource(scriptEl.getAttribute("src"), "js", resourceMap);
	});

	// Process fonts
	document.querySelectorAll("link[rel='preload'][as='font'][href]").forEach((fontEl) => {
		addResource(fontEl.getAttribute("href"), "font", resourceMap);
	});

	// Process videos
	document.querySelectorAll("video source[src]").forEach((sourceEl) => {
		addResource(sourceEl.getAttribute("src"), "video", resourceMap);
	});

	// Extract background images from inline styles
	document.querySelectorAll("[style]").forEach((el) => {
		const styleAttr = el.getAttribute("style");
		// More flexible regex that handles spaces and various quoting styles
		const regex = /url\s*\(\s*(['"]?)([^"')]+)\1\s*\)/gi;
		let match;
		while ((match = regex.exec(styleAttr)) !== null) {
			addResource(match[2], "image", resourceMap);
		}
	});

	// Extract background images from style elements
	document.querySelectorAll("style").forEach((styleEl) => {
		const cssText = styleEl.textContent; // Using textContent instead of innerText
		const regex = /url\s*\(\s*(['"]?)([^"')]+)\1\s*\)/gi;
		let match;
		while ((match = regex.exec(cssText)) !== null) {
			addResource(match[2], "image", resourceMap);
		}
	});

	// Process fonts - expanded methods
	// 1. Standard preloaded fonts
	document.querySelectorAll("link[rel='preload'][as='font'][href]").forEach((fontEl) => {
		addResource(fontEl.getAttribute("href"), "font", resourceMap);
	});

	// 2. Font files by extension
	document.querySelectorAll("link[href]").forEach((linkEl) => {
		const href = linkEl.getAttribute("href");
		if (href && /\.(woff2?|ttf|otf|eot)($|\?)/.test(href)) {
			addResource(href, "font", resourceMap);
		}
	});

	// 3. Check for font URLs in stylesheets
	document.querySelectorAll("style").forEach((styleEl) => {
		const cssText = styleEl.textContent;
		const fontRegex = /url\s*\(\s*['"]?([^'")]+\.(woff2?|ttf|otf|eot))['"]?\s*\)/gi;
		let match;
		while ((match = fontRegex.exec(cssText)) !== null) {
			addResource(match[1], "font", resourceMap);
		}
	});

	return [...resourceMap.values()];
}
