const { proxyConsole, updateFileStatus, blobToDataURL, downloadURL, getZipFilename } = require('../utils/backgroundUtils');
const { modifyHTML } = require('../utils/htmlModifier');

/**
 * Processes page data and downloads as ZIP
 */
async function processPageData(data, sender) {
	const { domain, html, resources, url } = data;
	const tabId = sender.tab.id;

	// JSZip is loaded globally via importScripts in background-wrapper.js
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

	// Load user settings
	return new Promise((resolve, reject) => {
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
				try {
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

							let type = resourceTypes[res.type];
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

							// Special handling for Next.js images
							if (res.url.includes('/_next/image') && res.url.includes('url=')) {
								try {
									// Extract the encoded URL parameter
									const urlMatch = res.url.match(/url=([^&]+)/);
									if (urlMatch && urlMatch[1]) {
										// Decode the URL
										const decodedUrl = decodeURIComponent(urlMatch[1]);
										// Extract filename from the decoded URL
										const nextjsFilename = decodedUrl.split('/').pop().split('?')[0];
										if (nextjsFilename) {
											filename = nextjsFilename;
										}
									}
								} catch (e) {
									proxyConsole(tabId, 'warn', `Error extracting Next.js image name: ${e.message}`);
								}
							}

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

							// Check for font files by extension or path
							if (type.folder === "fonts" ||
								/\.(woff2?|ttf|otf|eot)($|\?)/.test(filename.toLowerCase()) ||
								res.url.includes("/fonts/")) {
								// Ensure this is processed as a font
								type = resourceTypes["font"];
							}

							proxyConsole(tabId, 'log', `Fetching resource: ${res.url} → ${filename}`);

							// Fetch with timeout
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

								const contentType = response.headers.get('content-type');
								if (contentType && contentType.includes('font/')) {
									// Override the resource type to font regardless of original detection
									type = resourceTypes["font"];
								}

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
						resolve();
					} catch (err) {
						proxyConsole(tabId, 'error', `Error generating ZIP file: ${err.message}`);
						reject(err);
					}
				} catch (err) {
					reject(err);
				}
			})();
		});
	});
}

module.exports = {
	processPageData
};
