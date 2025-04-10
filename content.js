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
			resources.push({
				url: img.src,
				type: "image",
				filename: img.src.split('/').pop().split('?')[0]
			});
		});

		// CSS files from <link rel="stylesheet"> elements
		document.querySelectorAll("link[rel='stylesheet'][href]").forEach((linkEl) => {
			resources.push({
				url: linkEl.href,
				type: "css",
				filename: linkEl.href.split('/').pop().split('?')[0]
			});
		});

		// JavaScript files from <script src=""> elements
		document.querySelectorAll("script[src]").forEach((scriptEl) => {
			resources.push({
				url: scriptEl.src,
				type: "js",
				filename: scriptEl.src.split('/').pop().split('?')[0]
			});
		});

		// Scan inline style attributes for url(...) references
		document.querySelectorAll("[style]").forEach((el) => {
			const styleAttr = el.getAttribute("style");
			const regex = /url\(["']?([^"')]+)["']?\)/g;
			let match;
			while ((match = regex.exec(styleAttr)) !== null) {
				resources.push({
					url: match[1],
					type: "image",
					filename: match[1].split('/').pop().split('?')[0]
				});
			}
		});

		// Scan <style> tags for url(...) references
		document.querySelectorAll("style").forEach((styleEl) => {
			const cssText = styleEl.innerText;
			const regex = /url\(["']?([^"')]+)["']?\)/g;
			let match;
			while ((match = regex.exec(cssText)) !== null) {
				resources.push({
					url: match[1],
					type: "image",
					filename: match[1].split('/').pop().split('?')[0]
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
