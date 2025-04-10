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

		// Add the starting page HTML
		domainFolder.file("index.html", html);

		// Process and add each resource
		for (const res of resources) {
			// Allow CSS files regardless of domain; others only if hosted on the same domain
			if (
				res.type === "css" ||
				(!res.url.startsWith("http") || new URL(res.url).hostname === domain)
			) {
				try {
					const response = await fetch(res.url);
					const blob = await response.blob();

					let folderName;
					if (res.type === "image") folderName = "images";
					else if (res.type === "css") folderName = "css";
					else if (res.type === "js") folderName = "js";
					else folderName = "";

					let filename = res.filename || res.url.split('/').pop().split('?')[0];

					// For CSS files, ensure the filename ends with ".css"
					if (res.type === "css" && !filename.endsWith(".css")) {
						filename += ".css";
					}

					if (folderName) {
						// Create subfolder if it doesn't exist and add file
						const subFolder = domainFolder.folder(folderName);
						subFolder.file(filename, blob);
					} else {
						domainFolder.file(filename, blob);
					}
				} catch (err) {
					console.error(`Error downloading resource ${res.url}:`, err);
				}
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
