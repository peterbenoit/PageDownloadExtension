// Include JSZip (ensure jszip.min.js is added to your extension folder)
importScripts('jszip.min.js');

// Listen for a click on the extension action
chrome.action.onClicked.addListener((tab) => {
	if (!tab.id) return;

	// Execute content script in the active tab
	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		files: ['content.js']
	}, () => {
		if (chrome.runtime.lastError) {
			console.error(chrome.runtime.lastError);
		}
	});
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener(async (message, sender) => {
	if (message.type === 'PAGE_DATA') {
		const { domain, html, resources } = message.data;

		const zip = new JSZip();
		// Create a folder for the domain in the zip archive
		const domainFolder = zip.folder(domain);

		// Modify the HTML before adding it to the zip
		const modifiedHtml = modifyHTML(html);
		domainFolder.file("index.html", modifiedHtml);

		// Process and add each resource
		for (const res of resources) {
			try {
				// For CSS: allow regardless of domain.
				if (res.type === "css") {
					// Proceed with remote CSS as well.
					let filename = res.filename || res.url.split('/').pop().split('?')[0];
					if (!filename.endsWith(".css")) {
						filename += ".css";
					}
					const response = await fetch(res.url);
					const blob = await response.blob();
					const subFolder = domainFolder.folder("css");
					subFolder.file(filename, blob);
				} else if (res.type === "js") {
					// Only allow JS files that are from the same domain
					// and whose filename ends with ".js".
					if (res.url.startsWith("http") && new URL(res.url).hostname !== domain) {
						continue;
					}
					let filename = res.filename || res.url.split('/').pop().split('?')[0];
					if (!filename.endsWith(".js")) {
						// Skip any JS file that doesn't have a proper ".js" extension.
						continue;
					}
					const response = await fetch(res.url);
					const blob = await response.blob();
					const subFolder = domainFolder.folder("js");
					subFolder.file(filename, blob);
				} else if (res.type === "image") {
					// For images and any other resource, allow only if from same domain.
					if (res.url.startsWith("http") && new URL(res.url).hostname !== domain) {
						continue;
					}
					let filename = res.filename || res.url.split('/').pop().split('?')[0];
					const response = await fetch(res.url);
					const blob = await response.blob();
					const subFolder = domainFolder.folder("images");
					subFolder.file(filename, blob);
				}
				// Add additional resource types here if needed.
			} catch (err) {
				console.error(`Error downloading resource ${res.url}:`, err);
			}
		}

		// Generate zip blob and trigger a single download prompt
		zip.generateAsync({ type: "blob" })
			.then(async (content) => {
				const zipDataUrl = await blobToDataURL(content);
				downloadURL(`${domain}.zip`, zipDataUrl);
			})
			.catch((err) => {
				console.error("Error generating zip file:", err);
			});
	}
	return true;
});

// Convert blob to data URL using FileReader
function blobToDataURL(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

// Use chrome.downloads.download API to trigger the download
function downloadURL(filename, url) {
	chrome.downloads.download({
		url: url,
		filename: filename,
		saveAs: false
	}, (downloadId) => {
		if (chrome.runtime.lastError) {
			console.error(chrome.runtime.lastError);
		}
	});
}

// Modifies the HTML string to update local references and strip analytics scripts
function modifyHTML(html) {
	// Replace remote Font Awesome stylesheet with local css/all.min.css
	html = html.replace(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/6\.4\.0\/css\/all\.min\.css/g, "css/all.min.css");

	// Remove Clarity script tags
	html = html.replace(/<script[^>]*src=["']https:\/\/www\.clarity\.ms\/[^<]+<\/script>/g, "");

	// Remove gtag/Google Tag Manager script tags
	html = html.replace(/<script[^>]*src=["']https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^<]+<\/script>/g, "");

	// Remove inline scripts that contain "gtag(" or "clarity("
	html = html.replace(/<script[^>]*>[\s\S]*?(gtag\(|clarity\()[\s\S]*?<\/script>/g, "");

	// Update background image paths in inline styles to point to the local images folder.
	html = html.replace(/url\(["']?([^"')]+)["']?\)/g, function (match, p1) {
		// For relative URLs (not starting with http), extract the filename
		if (!p1.startsWith("http")) {
			let filename = p1.split("/").pop();
			return "url('images/" + filename + "')";
		}
		return match;
	});
	return html;
}
