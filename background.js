chrome.runtime.onInstalled.addListener(() => {
	console.log("Extension installed.");
});

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
	const tabId = sender.tab.id;

	const zip = new JSZip();
	const domainFolder = zip.folder(domain);

	// Determine the HTML filename based on the URL
	let htmlFilename = "index.html";
	try {
		const parsedUrl = new URL(url);
		const pathname = parsedUrl.pathname;
		if (pathname.length > 1 && pathname.endsWith('.html')) {
			htmlFilename = pathname.split('/').pop();
		}
	} catch (error) {
		proxyConsole(tabId, 'warn', "Couldn't parse URL, using index.html as default");
	}

	// Modify the HTML before adding it to the zip
	const modifiedHtml = modifyHTML(html);
	domainFolder.file(htmlFilename, modifiedHtml);

	let processedCount = 0;
	const totalResources = resources.length;
	chrome.action.setBadgeText({ text: "0%" });
	chrome.action.setBadgeBackgroundColor({ color: "#4688F1" });

	// Load all settings (max sizes and resource type options)
	chrome.storage.sync.get({
		maxResourceSize: 30,
		maxTotalSize: 120,
		downloadCss: true,
		downloadJs: true,
		downloadImages: true,
		downloadFonts: true,
		downloadVideos: true
	}, function (settings) {
		const MAX_RESOURCE_SIZE_MB = settings.maxResourceSize;
		const MAX_TOTAL_SIZE_MB = settings.maxTotalSize;
		proxyConsole(tabId, 'log', `Settings loaded: Max Resource Size: ${MAX_RESOURCE_SIZE_MB}MB, Max Total Size: ${MAX_TOTAL_SIZE_MB}MB`);

		(async function processResources() {
			let totalSize = 0;
			// Notify content script that download has started
			chrome.tabs.sendMessage(tabId, { type: 'DOWNLOAD_STARTED' });

			for (const res of resources) {
				try {
					// Define resource types and their handling rules
					const resourceTypes = {
						css: { folder: "css", extension: ".css", sameDomainOnly: false },
						js: { folder: "js", extension: ".js", sameDomainOnly: true },
						image: { folder: "images", extension: null, sameDomainOnly: false },
						font: { folder: "fonts", extension: null, sameDomainOnly: false },
						video: { folder: "videos", extension: null, sameDomainOnly: true }
					};

					const type = resourceTypes[res.type];
					if (!type) continue; // Skip unsupported resource types

					// Check if the user disabled this resource type
					if (res.type === 'css' && !settings.downloadCss) {
						proxyConsole(tabId, 'warn', `User disabled CSS downloads: ${res.url}`);
						updateFileStatus(tabId, res.url, 'skipped', 'CSS disabled by user');
						continue;
					}
					if (res.type === 'js' && !settings.downloadJs) {
						proxyConsole(tabId, 'warn', `User disabled JS downloads: ${res.url}`);
						updateFileStatus(tabId, res.url, 'skipped', 'JS disabled by user');
						continue;
					}
					if (res.type === 'image' && !settings.downloadImages) {
						proxyConsole(tabId, 'warn', `User disabled Images downloads: ${res.url}`);
						updateFileStatus(tabId, res.url, 'skipped', 'Images disabled by user');
						continue;
					}
					if (res.type === 'font' && !settings.downloadFonts) {
						proxyConsole(tabId, 'warn', `User disabled Fonts downloads: ${res.url}`);
						updateFileStatus(tabId, res.url, 'skipped', 'Fonts disabled by user');
						continue;
					}
					if (res.type === 'video' && !settings.downloadVideos) {
						proxyConsole(tabId, 'warn', `User disabled Videos downloads: ${res.url}`);
						updateFileStatus(tabId, res.url, 'skipped', 'Videos disabled by user');
						continue;
					}

					// Check domain restriction for types that require same-domain only
					if (type.sameDomainOnly && res.url.startsWith("http") && new URL(res.url).hostname !== domain) {
						proxyConsole(tabId, 'warn', `Skipping cross-domain resource: ${res.url}`);
						updateFileStatus(tabId, res.url, 'skipped', 'Cross-domain resource');
						continue;
					}

					// Process filename
					let filename = res.filename || res.url.split('/').pop().split('?')[0];
					if (type.extension && !filename.endsWith(type.extension)) {
						if (type.extension === ".js" || type.extension === ".css") {
							if (type.extension === ".js") continue; // Skip non-JS files per rule
							filename += type.extension;
						}
					}

					// Adjust filename for images if necessary
					if (type.folder === "images" && (res.url.includes("/img/") || res.url.includes("/images/"))) {
						filename = res.url.split('/').pop().split('?')[0];
					}

					proxyConsole(tabId, 'log', `Fetching resource: ${res.url} → ${filename}`);

					// More robust fetch with timeout
					const controller = new AbortController();
					const timeoutId = setTimeout(() => controller.abort(), 30000);
					try {
						const response = await fetch(res.url, {
							signal: controller.signal,
							credentials: 'omit',
							cache: 'force-cache'
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
			try {
				const content = await zip.generateAsync({ type: "blob" });
				const dataUrl = await blobToDataURL(content);
				downloadURL(zipFilename, dataUrl);
				chrome.action.setBadgeText({ text: "" });
				chrome.tabs.sendMessage(tabId, {
					type: 'DOWNLOAD_COMPLETE',
					filename: zipFilename
				});
			} catch (err) {
				proxyConsole(tabId, 'error', `Error generating ZIP file: ${err.message}`);
			}
		})();
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
