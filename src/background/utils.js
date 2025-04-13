// Helper to proxy logs to content.js
export function proxyConsole(tabId, method, message) {
	console[method](message);
	chrome.tabs.sendMessage(tabId, { type: 'LOG', level: method, message: message });
}

// Send file status updates to the content script
export function updateFileStatus(tabId, url, status, reason = null) {
	chrome.tabs.sendMessage(tabId, {
		type: 'FILE_STATUS',
		url: url,
		status: status, // 'success', 'skipped', or 'failed'
		reason: reason  // Optional explanation message
	});
}

// Convert blob to data URL using FileReader
export function blobToDataURL(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

// Use chrome.downloads.download API to trigger the download
export function downloadURL(filename, url) {
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

// Helper function to generate a descriptive ZIP filename
export function getZipFilename(domain, url) {
	try {
		const parsedUrl = new URL(url);
		const pathname = parsedUrl.pathname;

		// If it's the homepage or just a slash
		if (pathname === "/" || pathname === "") {
			return `${domain}.zip`;
		}

		// Remove extensions and clean up the pathname
		let pageName = pathname.split('/').pop().split('.')[0];

		// If we have a page name, add it to the filename
		if (pageName && pageName.length > 0) {
			return `${domain}-${pageName}.zip`;
		} else {
			return `${domain}.zip`;
		}
	} catch (error) {
		console.warn("Couldn't parse URL for ZIP filename, using domain only", error);
		return `${domain}.zip`;
	}
}
