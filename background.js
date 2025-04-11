// Include JSZip (ensure jszip.min.js is added to your extension folder)
importScripts('jszip.min.js');

// Update the message listener to capture sender
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === 'PAGE_DATA') {
		// Pass sender to processPageData
		processPageData(message.data, sender)
			.then(() => sendResponse({ success: true }))
			.catch(error => sendResponse({ success: false, error: error.message }));
		return true; // Indicates async response
	}
	return false;
});

// Helper to proxy logs to content.js
function proxyConsole(tabId, method, message) {
	console[method](message);
	chrome.tabs.sendMessage(tabId, { type: 'LOG', level: method, message: message });
}

// Add this function to send file status updates to the content script
function updateFileStatus(tabId, url, status, reason = null) {
	chrome.tabs.sendMessage(tabId, {
		type: 'FILE_STATUS',
		url: url,
		status: status, // 'success', 'skipped', or 'failed'
		reason: reason  // Optional explanation message
	});
}

// Update function signature to accept sender
async function processPageData(data, sender) {
	const { domain, html, resources, url } = data;
	// Keep track of the tab ID to send messages back to it
	const tabId = sender.tab.id;

	const zip = new JSZip();
	// Create a folder for the domain in the zip archive
	const domainFolder = zip.folder(domain);

	// Determine the HTML filename based on the URL
	let htmlFilename = "index.html";
	try {
		const parsedUrl = new URL(url);
		const pathname = parsedUrl.pathname;

		// If pathname is more than just "/" and ends with .html, use that filename
		if (pathname.length > 1 && pathname.endsWith('.html')) {
			htmlFilename = pathname.split('/').pop();
		}
	} catch (error) {
		proxyConsole(tabId, 'warn', "Couldn't parse URL, using index.html as default");
	}

	// Modify the HTML before adding it to the zip
	const modifiedHtml = modifyHTML(html);
	domainFolder.file(htmlFilename, modifiedHtml);

	// Before processing resources
	let processedCount = 0;
	const totalResources = resources.length;

	chrome.action.setBadgeText({ text: "0%" });
	chrome.action.setBadgeBackgroundColor({ color: "#4688F1" });

	let MAX_RESOURCE_SIZE_MB = 30;
	let MAX_TOTAL_SIZE_MB = 120;

	// Load settings at startup
	function loadSettings() {
		chrome.storage.sync.get({
			maxResourceSize: 30,
			maxTotalSize: 120
		}, function (items) {
			MAX_RESOURCE_SIZE_MB = items.maxResourceSize;
			MAX_TOTAL_SIZE_MB = items.maxTotalSize;
			console.log(`Settings loaded: Max Resource Size: ${MAX_RESOURCE_SIZE_MB}MB, Max Total Size: ${MAX_TOTAL_SIZE_MB}MB`);
		});
	}

	// Listen for settings changes
	chrome.storage.onChanged.addListener(function (changes) {
		if (changes.maxResourceSize) {
			MAX_RESOURCE_SIZE_MB = changes.maxResourceSize.newValue;
		}
		if (changes.maxTotalSize) {
			MAX_TOTAL_SIZE_MB = changes.maxTotalSize.newValue;
		}
		console.log(`Settings updated: Max Resource Size: ${MAX_RESOURCE_SIZE_MB}MB, Max Total Size: ${MAX_TOTAL_SIZE_MB}MB`);
	});

	// Load settings at startup
	loadSettings();

	let totalSize = 0;

	// Notify content script that download has started
	chrome.tabs.sendMessage(tabId, { type: 'DOWNLOAD_STARTED' });

	// Process and add each resource
	for (const res of resources) {
		try {
			// Define resource types and their handling rules
			const resourceTypes = {
				css: { folder: "css", extension: ".css", sameDomainOnly: false },
				js: { folder: "js", extension: ".js", sameDomainOnly: true },
				image: { folder: "images", extension: null, sameDomainOnly: true },
				font: { folder: "fonts", extension: null, sameDomainOnly: false },
				video: { folder: "videos", extension: null, sameDomainOnly: true }
			};

			const type = resourceTypes[res.type];
			if (!type) continue; // Skip unsupported resource types

			// Check domain restriction
			if (type.sameDomainOnly && res.url.startsWith("http") && new URL(res.url).hostname !== domain) {
				proxyConsole(tabId, 'warn', `Skipping cross-domain resource: ${res.url}`);
				updateFileStatus(tabId, res.url, 'skipped', 'Cross-domain resource');
				continue;
			}

			// Process filename
			let filename = res.filename || res.url.split('/').pop().split('?')[0];
			if (type.extension && !filename.endsWith(type.extension)) {
				if (type.extension === ".js" || type.extension === ".css") {
					if (type.extension === ".js") continue; // Skip non-JS files
					filename += type.extension;
				}
			}

			// Handle img folder references to map to images folder
			if (type.folder === "images" && (res.url.includes("/img/") || res.url.includes("/images/"))) {
				filename = res.url.split('/').pop().split('?')[0];
			}

			proxyConsole(tabId, 'log', `Fetching resource: ${res.url} → ${filename}`);

			// IMPROVED: More robust fetch with timeout and error handling
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

			try {
				const response = await fetch(res.url, {
					signal: controller.signal,
					credentials: 'omit', // Don't send cookies
					cache: 'force-cache' // Try to use cache when possible
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
				}

				const blob = await response.blob();

				// Check individual resource size
				if (blob.size > MAX_RESOURCE_SIZE_MB * 1024 * 1024) {
					proxyConsole(tabId, 'warn', `Skipping ${res.url}: exceeds maximum resource size`);
					updateFileStatus(tabId, res.url, 'skipped', `Exceeds max size limit (${MAX_RESOURCE_SIZE_MB}MB)`);
					continue;
				}

				// Track total size
				totalSize += blob.size;
				if (totalSize > MAX_TOTAL_SIZE_MB * 1024 * 1024) {
					proxyConsole(tabId, 'warn', `Total size exceeds limit of ${MAX_TOTAL_SIZE_MB}MB`);
				}

				const subFolder = domainFolder.folder(type.folder);
				subFolder.file(filename, blob);
				proxyConsole(tabId, 'log', `Successfully added to ZIP: ${filename}`);
				updateFileStatus(tabId, res.url, 'success');

			} catch (fetchError) {
				clearTimeout(timeoutId);
				proxyConsole(tabId, 'error', `Failed to fetch ${res.url}: ${fetchError.message}`);
				updateFileStatus(tabId, res.url, 'failed', fetchError.message);
				continue;
			}

			// Update progress after each resource
			processedCount++;
			const percentage = Math.round((processedCount / totalResources) * 100);
			chrome.action.setBadgeText({ text: `${percentage}%` });

			// Send progress to content script
			chrome.tabs.sendMessage(tabId, {
				type: 'DOWNLOAD_PROGRESS',
				percentage: percentage
			});

		} catch (err) {
			proxyConsole(tabId, 'error', `Error processing resource ${res.url}: ${err.message}`);
		}
	}

	// Generate a descriptive filename for the ZIP
	const zipFilename = getZipFilename(domain, url);

	// Generate zip blob and trigger a single download prompt
	zip.generateAsync({ type: "blob" })
		.then(async (content) => {
			try {
				const dataUrl = await blobToDataURL(content);
				downloadURL(zipFilename, dataUrl);

				// After ZIP generation is complete
				chrome.action.setBadgeText({ text: "" });

				// Notify content script that download is complete
				chrome.tabs.sendMessage(tabId, {
					type: 'DOWNLOAD_COMPLETE',
					filename: zipFilename
				});
			} catch (err) {
				proxyConsole(tabId, 'error', "Error creating data URL:", err);
			}
		})
		.catch((err) => {
			proxyConsole(tabId, 'error', "Error generating zip file:", err);
		});
}

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

// Helper function to generate a descriptive ZIP filename
function getZipFilename(domain, url) {
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

// Modifies the HTML string to update local references and strip analytics scripts
function modifyHTML(html) {
	// Replace external CSS references with local paths
	html = html.replace(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi, function (match, url) {
		if (url.startsWith('http')) {
			// Extract filename from URL
			const filename = url.split('/').pop().split('?')[0];
			return match.replace(url, `css/${filename}`);
		}
		return match;
	});

	// Replace external JS references with local paths
	html = html.replace(/<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi, function (match, url) {
		// Skip analytics scripts
		if (url.includes('googletagmanager.com') || url.includes('clarity.ms')) {
			return '';
		}

		if (url.startsWith('http')) {
			// Extract filename from URL
			const filename = url.split('/').pop().split('?')[0];
			return match.replace(url, `js/${filename}`);
		}
		return match;
	});

	// Remove inline scripts that contain "gtag(" or "clarity("
	html = html.replace(/<script[^>]*>[\s\S]*?(gtag\(|clarity\()[\s\S]*?<\/script>/g, "");

	// Update background image paths in inline styles to point to the local images folder
	html = html.replace(/url\(["']?([^"')]+)["']?\)/g, function (match, p1) {
		// For relative URLs (not starting with http), extract the filename
		if (!p1.startsWith("http")) {
			let filename = p1.split("/").pop();
			return `url('images/${filename}')`;
		} else {
			// For absolute URLs, also extract filename and make reference local
			let filename = p1.split("/").pop().split("?")[0];
			return `url('images/${filename}')`;
		}
	});

	// Replace image src paths
	html = html.replace(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi, function (match, url) {
		// Skip data URLs
		if (url.startsWith('data:')) return match;

		// Extract filename from URL
		const filename = url.split('/').pop().split('?')[0];
		return match.replace(url, `images/${filename}`);
	});

	return html;
}
