(function () {
	try {
		// Get domain (without "www." if exists)
		const domainRaw = window.location.hostname;
		const domain = domainRaw.replace(/^www\./, '');

		// Get the raw HTML of the page
		const html = document.documentElement.outerHTML;

		// Collect resource URLs from the page
		const resources = [];

		// Images from <img> elements
		document.querySelectorAll("img[src]").forEach((img) => {
			const src = img.getAttribute("src");
			const absoluteUrl = new URL(src, window.location.href).href;
			resources.push({
				url: absoluteUrl,
				type: "image",
				filename: absoluteUrl.split('/').pop().split('?')[0]
			});
		});

		// CSS files from <link rel="stylesheet"> elements
		document.querySelectorAll("link[rel='stylesheet'][href]").forEach((linkEl) => {
			const href = linkEl.getAttribute("href");
			const absoluteUrl = new URL(href, window.location.href).href;
			resources.push({
				url: absoluteUrl,
				type: "css",
				filename: absoluteUrl.split('/').pop().split('?')[0]
			});
		});

		// JavaScript files from <script src=""> elements
		document.querySelectorAll("script[src]").forEach((scriptEl) => {
			const src = scriptEl.getAttribute("src");
			const absoluteUrl = new URL(src, window.location.href).href;
			resources.push({
				url: absoluteUrl,
				type: "js",
				filename: absoluteUrl.split('/').pop().split('?')[0]
			});
		});

		// Scan inline style attributes for url(...) references
		document.querySelectorAll("[style]").forEach((el) => {
			const styleAttr = el.getAttribute("style");
			const regex = /url\(["']?([^"')]+)["']?\)/g;
			let match;
			while ((match = regex.exec(styleAttr)) !== null) {
				// Convert relative URL to absolute
				const absoluteUrl = new URL(match[1], window.location.href).href;
				resources.push({
					url: absoluteUrl,
					type: "image",
					filename: absoluteUrl.split('/').pop().split('?')[0]
				});
			}
		});

		// Scan <style> tags for url(...) references
		document.querySelectorAll("style").forEach((styleEl) => {
			const cssText = styleEl.innerText;
			const regex = /url\(["']?([^"')]+)["']?\)/g;
			let match;
			while ((match = regex.exec(cssText)) !== null) {
				const absoluteUrl = new URL(match[1], window.location.href).href;
				resources.push({
					url: absoluteUrl,
					type: "image",
					filename: absoluteUrl.split('/').pop().split('?')[0]
				});
			}
		});

		// Send the collected data to the background script for processing
		chrome.runtime.sendMessage({
			type: "PAGE_DATA",
			data: {
				domain: domain,
				html: html,
				resources: resources
			}
		});
	} catch (err) {
		console.error("Error in content script:", err);
	}
})();
