chrome.runtime.onInstalled.addListener(() => {
	console.log("Extension installed.");
});

// Include required scripts
importScripts('jszip.min.js', 'getImageType.js', 'adRemover.js');

// Store parsed selectors from EasyList
let adSelectors = null;

// Load EasyList at extension initialization
async function loadEasyList() {
	try {
		const response = await fetch('easylist.txt');
		const text = await response.text();
		adSelectors = AdRemover.parseEasyListForSelectors(text);
		console.log(`Loaded ${adSelectors.length} ad selectors from EasyList`);
	} catch (error) {
		console.error('Failed to load EasyList:', error);
		// Fallback to basic selectors if EasyList fails to load
		adSelectors = [
			'[class*="ad-container"]',
			'[class*="adsbygoogle"]',
			'[id*="div-gpt-ad"]',
			'.advertisement',
			'iframe[src*="doubleclick.net"]',
			'iframe[src*="googlesyndication.com"]'
		];
	}
}

// Load the selectors immediately
loadEasyList();

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

	// Get user settings
	const settings = await new Promise(resolve => {
		chrome.storage.sync.get({
			maxResourceSize: 30,
			maxTotalSize: 120,
			downloadCss: true,
			downloadJs: true,
			downloadImages: true,
			downloadFonts: true,
			downloadVideos: true,
			removeAds: false
		}, resolve);
	});

	proxyConsole(tabId, 'log', `Settings loaded: Max Resource: ${settings.maxResourceSize}MB, Remove Ads: ${settings.removeAds}`);

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

	// Process the HTML content
	let modifiedHtml = html;

	// Save original HTML for reference
	domainFolder.file("original.html", html);

	// Apply ad removing if enabled
	if (settings.removeAds && adSelectors) {
		proxyConsole(tabId, 'log', `Removing ads from HTML using ${adSelectors.length} EasyList selectors...`);
		try {
			const startTime = performance.now();
			// Pass the adSelectors to removeAdsFromHTML
			modifiedHtml = AdRemover.removeAdsFromHTML(modifiedHtml, adSelectors);
			const endTime = performance.now();
			proxyConsole(tabId, 'log', `Ads removed in ${(endTime - startTime).toFixed(2)}ms`);
		} catch (error) {
			proxyConsole(tabId, 'error', `Error removing ads: ${error.message}`);
		}
	}

	// Apply other HTML modifications
	modifiedHtml = modifyHTML(modifiedHtml);

	// Save the processed HTML
	domainFolder.file(htmlFilename, modifiedHtml);

	// Process resources
	let processedCount = 0;
	const totalResources = resources.length;
	chrome.action.setBadgeText({ text: "0%" });
	chrome.action.setBadgeBackgroundColor({ color: "#4688F1" });

	// Notify content script that download has started
	chrome.tabs.sendMessage(tabId, { type: 'DOWNLOAD_STARTED' });

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

					let type = resourceTypes[res.type];
					if (!type) continue; // Skip unsupported resource types

					// Check if the user disabled this resource type
					if (res.type === 'css' && !settings.downloadCss) {
						// proxyConsole(tabId, 'warn', `User disabled CSS downloads: ${res.url}`);
						updateFileStatus(tabId, res.url, 'skipped', 'CSS disabled by user');
						continue;
					}
					if (res.type === 'js' && !settings.downloadJs) {
						// proxyConsole(tabId, 'warn', `User disabled JS downloads: ${res.url}`);
						updateFileStatus(tabId, res.url, 'skipped', 'JS disabled by user');
						continue;
					}
					if (res.type === 'image' && !settings.downloadImages) {
						// proxyConsole(tabId, 'warn', `User disabled Images downloads: ${res.url}`);
						updateFileStatus(tabId, res.url, 'skipped', 'Images disabled by user');
						continue;
					}
					if (res.type === 'font' && !settings.downloadFonts) {
						// proxyConsole(tabId, 'warn', `User disabled Fonts downloads: ${res.url}`);
						updateFileStatus(tabId, res.url, 'skipped', 'Fonts disabled by user');
						continue;
					}
					if (res.type === 'video' && !settings.downloadVideos) {
						// proxyConsole(tabId, 'warn', `User disabled Videos downloads: ${res.url}`);
						updateFileStatus(tabId, res.url, 'skipped', 'Videos disabled by user');
						continue;
					}

					// Check domain restriction for types that require same-domain only
					if (type.sameDomainOnly && res.url.startsWith("http")) {
						// Normalize domains for comparison by removing www prefix
						const resourceHost = new URL(res.url).hostname.replace(/^www\./, '');
						const pageHost = domain.replace(/^www\./, '');

						// Use the proxyConsole function to make this visible in the content script
						proxyConsole(tabId, 'log', `Domain check: ${resourceHost} vs ${pageHost}`);

						if (resourceHost !== pageHost) {
							// proxyConsole(tabId, 'warn', `Skipping cross-domain resource: ${res.url}`);
							updateFileStatus(tabId, res.url, 'skipped', 'Cross-domain resource');
							continue;
						}
					}

					// Process filename
					let filename = res.filename || res.url.split('/').pop().split('?')[0];

					// Create a more unique filename to prevent collisions
					if (res.type === 'image') {
						// ...existing code for image files...
					}
					// Don't add folder prefix to JS files
					else if (res.type === 'js') {
						// Just use the filename as is, without the domain folder prefix
						filename = filename.split('?')[0];
					}

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

						// Get content type from response
						const contentType = response.headers.get('content-type');

						// Determine proper file extension based on content type and actual file content
						if (!filename.includes('.')) {
							// No extension in filename, need to add one
							if (res.type === 'image') {
								// For images, try to determine from content type first
								if (contentType) {
									const extensionMap = {
										'image/jpeg': '.jpg',
										'image/png': '.png',
										'image/gif': '.gif',
										'image/svg+xml': '.svg',
										'image/webp': '.webp',
										'image/avif': '.avif',
										'image/bmp': '.bmp',
										'image/x-icon': '.ico',
										'image/vnd.microsoft.icon': '.ico'
									};

									const extension = extensionMap[contentType.split(';')[0]];
									if (extension) {
										filename += extension;
									} else {
										// If content type doesn't help, try to examine the file header
										try {
											const fileType = await getImageType(blob);
											if (fileType === 'image/jpeg') filename += '.jpg';
											else if (fileType === 'image/png') filename += '.png';
											else if (fileType === 'image/gif') filename += '.gif';
											else if (fileType === 'image/bmp') filename += '.bmp';
											else filename += '.jpg'; // Default if all else fails
										} catch (e) {
											filename += '.jpg'; // Default if examination fails
										}
									}
								} else {
									// Try to examine the file header if no content type
									try {
										const fileType = await getImageType(blob);
										if (fileType === 'image/jpeg') filename += '.jpg';
										else if (fileType === 'image/png') filename += '.png';
										else if (fileType === 'image/gif') filename += '.gif';
										else if (fileType === 'image/bmp') filename += '.bmp';
										else filename += '.jpg'; // Default if all else fails
									} catch (e) {
										filename += '.jpg'; // Default if examination fails
									}
								}
							} else if (res.type === 'font') {
								// For fonts, add proper extension based on content type or URL pattern
								if (res.url.includes('.woff2')) {
									filename += '.woff2';
								} else if (res.url.includes('.woff')) {
									filename += '.woff';
								} else if (res.url.includes('.ttf')) {
									filename += '.ttf';
								} else if (res.url.includes('.otf')) {
									filename += '.otf';
								} else if (res.url.includes('.eot')) {
									filename += '.eot';
								} else {
									// Try content type as a fallback
									if (contentType && contentType.includes('font/woff2')) {
										filename += '.woff2';
									} else if (contentType && contentType.includes('font/woff')) {
										filename += '.woff';
									} else if (contentType && contentType.includes('font/ttf')) {
										filename += '.ttf';
									} else {
										filename += '.woff2'; // Default font extension
									}
								}
							} else if (res.type === 'css') {
								filename += '.css';
							} else if (res.type === 'js') {
								filename += '.js';
							} else if (res.type === 'video') {
								// For videos, try to determine from content type
								if (contentType) {
									if (contentType.includes('video/mp4')) {
										filename += '.mp4';
									} else if (contentType.includes('video/webm')) {
										filename += '.webm';
									} else {
										filename += '.mp4'; // Default video extension
									}
								} else {
									filename += '.mp4'; // Default if content type is missing
								}
							}
						}

						// Handle fonts specifically with proper file detection
						if (contentType && contentType.includes('font/')) {
							// Override the resource type to font regardless of original detection
							type = resourceTypes["font"];

							// Fix extension if needed
							if (!filename.match(/\.(woff2?|ttf|otf|eot)$/i)) {
								if (contentType.includes('font/woff2')) {
									filename = filename.replace(/\.[^.]+$/, '') + '.woff2';
								} else if (contentType.includes('font/woff')) {
									filename = filename.replace(/\.[^.]+$/, '') + '.woff';
								} else if (contentType.includes('font/ttf')) {
									filename = filename.replace(/\.[^.]+$/, '') + '.ttf';
								} else {
									filename = filename.replace(/\.[^.]+$/, '') + '.woff2';
								}
							}
						}

						proxyConsole(tabId, 'log', `File processed with correct extension: ${filename}`);

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
		// Skip data URLs or empty URLs
		if (url.startsWith('data:') || !url) return match;

		// Extract filename from URL
		const filename = url.split('/').pop().split('?')[0];

		// Handle absolute URLs
		if (url.startsWith('http')) {
			return match.replace(url, `css/${filename}`);
		}
		// Handle relative URLs starting with /
		else if (url.startsWith('/')) {
			return match.replace(url, `css/${filename}`);
		}
		// Handle relative URLs without leading slash
		else if (!url.startsWith('css/')) {
			return match.replace(url, `css/${url}`);
		}
		return match;
	});

	// Replace external JS references with local paths (self-closing script tags)
	html = html.replace(/<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi, function (match, url) {
		// Skip analytics scripts but don't remove the script tag
		if (url.includes('googletagmanager.com') || url.includes('clarity.ms')) {
			return match;
		}

		if (!url) return match;

		// Extract filename from URL
		const filename = url.split('/').pop().split('?')[0];

		// Handle absolute URLs
		if (url.startsWith('http')) {
			return match.replace(url, `js/${filename}`);
		}
		// Handle relative URLs starting with /
		else if (url.startsWith('/')) {
			return match.replace(url, `js/${filename}`);
		}
		// Handle relative URLs without leading slash
		else if (!url.startsWith('js/')) {
			return match.replace(url, `js/${url}`);
		}
		return match;
	});

	// Handle standalone script tags with src attribute directly
	html = html.replace(/<script[^>]*src=["']([^"']+)["'][^>]*>[\s\S]*?<\/script>/gi, function (match, url) {
		// Skip analytics scripts but don't remove the script tag
		if (url.includes('googletagmanager.com') || url.includes('clarity.ms')) {
			return match;
		}

		if (!url) return match;

		// Extract filename from URL
		const filename = url.split('/').pop().split('?')[0];

		// Handle absolute URLs
		if (url.startsWith('http')) {
			return match.replace(url, `js/${filename}`);
		}
		// Handle relative URLs starting with /
		else if (url.startsWith('/')) {
			return match.replace(url, `js/${filename}`);
		}
		// Handle relative URLs without leading slash
		else if (!url.startsWith('js/')) {
			return match.replace(url, `js/${url}`);
		}
		return match;
	});

	// Instead of removing inline scripts that contain certain patterns, just keep them
	// We only want to modify the resource references, not alter functionality

	// Update favicon links
	html = html.replace(/<link[^>]*rel=["'](icon|shortcut icon|apple-touch-icon|apple-touch-icon-precomposed)["'][^>]*href=["']([^"']+)["'][^>]*>/gi, function (match, rel, url) {
		if (!url) return match;

		// Extract filename
		const filename = url.split('/').pop().split('?')[0];

		// Handle absolute URLs
		if (url.startsWith('http')) {
			return match.replace(url, `images/${filename}`);
		}
		// Handle relative URLs starting with /
		else if (url.startsWith('/')) {
			return match.replace(url, `images/${filename}`);
		}
		// Handle relative URLs without leading slash
		else if (!url.startsWith('images/')) {
			return match.replace(url, `images/${url}`);
		}
		return match;
	});

	// Replace image src paths with the new naming convention
	html = html.replace(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi, function (match, url) {
		// Skip data URLs
		if (url.startsWith('data:')) return match;
		if (!url) return match;

		try {
			// Extract just the filename without parent directory prefixing
			const filename = url.split('/').pop().split('?')[0];

			// For assets that shouldn't be renamed with prefixes
			return match.replace(url, `images/${filename}`);
		} catch (e) {
			// If URL parsing fails, use a simple approach
			const filename = url.split('/').pop().split('?')[0];
			return match.replace(url, `images/${filename}`);
		}
	});

	// Update audio sources
	html = html.replace(/<source[^>]*src=["']([^"']+)["'][^>]*>/gi, function (match, url) {
		if (!url) return match;

		// Extract filename
		const filename = url.split('/').pop().split('?')[0];

		// Handle different types of media
		if (url.includes('.mp3') || url.includes('.wav') || url.includes('.ogg')) {
			// Audio files
			if (url.startsWith('http')) {
				return match.replace(url, `audio/${filename}`);
			} else if (url.startsWith('/')) {
				return match.replace(url, `audio/${filename}`);
			} else if (!url.startsWith('audio/')) {
				return match.replace(url, `audio/${url}`);
			}
		} else if (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogv')) {
			// Video files
			if (url.startsWith('http')) {
				return match.replace(url, `videos/${filename}`);
			} else if (url.startsWith('/')) {
				return match.replace(url, `videos/${filename}`);
			} else if (!url.startsWith('videos/')) {
				return match.replace(url, `videos/${url}`);
			}
		}
		return match;
	});

	// Handle video elements with src attribute directly
	html = html.replace(/<video[^>]*src=["']([^"']+)["'][^>]*>/gi, function (match, url) {
		if (!url) return match;

		// Extract filename
		const filename = url.split('/').pop().split('?')[0];

		// Video files
		if (url.startsWith('http')) {
			return match.replace(url, `videos/${filename}`);
		} else if (url.startsWith('/')) {
			return match.replace(url, `videos/${filename}`);
		} else if (!url.startsWith('videos/')) {
			return match.replace(url, `videos/${url}`);
		}
		return match;
	});

	// Update background image paths in inline styles to point to the local images folder
	html = html.replace(/url\(["']?([^"')]+)["']?\)/g, function (match, p1) {
		if (p1.startsWith("data:")) return match;
		if (!p1) return match;

		try {
			// Extract just the filename without parent directory prefixing
			const filename = p1.split('/').pop().split('?')[0];
			return `url('images/${filename}')`;
		} catch (e) {
			// If URL parsing fails, use the original approach
			const filename = p1.split("/").pop().split("?")[0];
			return `url('images/${filename}')`;
		}
	});

	// Handle any other link tags with href that might be for resources
	html = html.replace(/<link[^>]*href=["']([^"']+\.(woff2?|ttf|otf|eot|png|jpg|jpeg|gif|svg|webp))["'][^>]*>/gi, function (match, url) {
		if (!url) return match;

		// Extract filename
		const filename = url.split('/').pop().split('?')[0];

		// Determine appropriate folder based on file extension
		let folder = "images"; // Default
		if (/\.(woff2?|ttf|otf|eot)$/i.test(url)) {
			folder = "fonts";
		}

		if (url.startsWith('http') || url.startsWith('/')) {
			return match.replace(url, `${folder}/${filename}`);
		} else if (!url.startsWith(`${folder}/`)) {
			return match.replace(url, `${folder}/${filename}`);
		}
		return match;
	});

	return html;
}
