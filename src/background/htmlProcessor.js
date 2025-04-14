/**
 * HTML processing module for modifying HTML content
 */
import { logDebug } from './logger';
import { addPendingFile } from './fileStatus';
import { log } from './utils/logger.js';

// Function to generate a safe filename for the HTML file (from WORKING_VERSION)
function getHtmlFilename(pageUrl, domain) {
	try {
		const urlObj = new URL(pageUrl);
		let path = urlObj.pathname;

		// If path is just '/' or empty, use 'index.html'
		if (path === '/' || path === '') {
			return 'index.html';
		}

		// Get the last part of the path
		let filename = path.substring(path.lastIndexOf('/') + 1);

		// If filename is empty (e.g., URL ends with /), use 'index.html'
		if (!filename) {
			return 'index.html';
		}

		// Ensure it ends with .html or add it
		if (!/\.html?$/i.test(filename)) {
			// If it has another extension, replace it
			if (filename.includes('.')) {
				filename = filename.substring(0, filename.lastIndexOf('.')) + '.html';
			} else {
				filename += '.html';
			}
		}

		// Basic sanitization (though less critical for HTML filename within zip)
		filename = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');

		return filename;
	} catch (e) {
		log('error', 'Error generating HTML filename:', e);
		// Fallback
		return 'index.html';
	}
}

/**
 * Process HTML content to prepare for download
 * @param {string} htmlContent - Original HTML content
 * @param {string} pageUrl - URL of the page
 * @param {Object} options - Processing options
 * @returns {Object} Object containing processed HTML and resources
 */
export const processHtml = async (htmlContent, pageUrl, options) => {
	logDebug('Processing HTML content for', pageUrl);

	const resourcesMap = {};
	const resources = [];

	// Create a DOM parser to work with the HTML
	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlContent, 'text/html');

	// Base URL for resolving relative URLs
	const baseUrl = new URL(pageUrl);

	// Process based on options
	if (options.downloadImages) {
		await processImages(doc, baseUrl, resources, resourcesMap);
	}

	if (options.downloadCSS) {
		await processStylesheets(doc, baseUrl, resources, resourcesMap);
	}

	if (options.downloadScripts) {
		await processScripts(doc, baseUrl, resources, resourcesMap);
	}

	// Additional processing based on options
	if (options.removeScripts) {
		removeElements(doc, 'script');
	}

	if (options.removeTracking) {
		removeTrackingElements(doc);
	}

	// Convert back to string
	const processedHtml = new XMLSerializer().serializeToString(doc);

	logDebug(`HTML processing complete. Found ${resources.length} resources`);
	return { processedHtml, resources };
};

/**
 * Process images in the HTML
 */
const processImages = async (doc, baseUrl, resources, resourcesMap) => {
	const images = doc.querySelectorAll('img');
	images.forEach(img => {
		if (img.src) {
			const absoluteUrl = new URL(img.src, baseUrl.href).href;

			// Skip if already processed or data URL
			if (resourcesMap[absoluteUrl] || absoluteUrl.startsWith('data:')) {
				return;
			}

			// Create a relative path for the resource
			const resourcePath = `images/${getResourceFilename(absoluteUrl)}`;
			img.src = resourcePath;

			// Track this resource
			const resource = { url: absoluteUrl, type: 'image', path: resourcePath };
			resources.push(resource);
			resourcesMap[absoluteUrl] = resource;

			// Mark as pending in the file status tracker
			addPendingFile(absoluteUrl, 'image');
		}
	});
};

/**
 * Process stylesheets in the HTML
 */
const processStylesheets = async (doc, baseUrl, resources, resourcesMap) => {
	const links = doc.querySelectorAll('link[rel="stylesheet"]');
	links.forEach(link => {
		if (link.href) {
			const absoluteUrl = new URL(link.href, baseUrl.href).href;

			// Skip if already processed
			if (resourcesMap[absoluteUrl]) {
				return;
			}

			// Create a relative path for the resource
			const resourcePath = `css/${getResourceFilename(absoluteUrl)}`;
			link.href = resourcePath;

			// Track this resource
			const resource = { url: absoluteUrl, type: 'css', path: resourcePath };
			resources.push(resource);
			resourcesMap[absoluteUrl] = resource;

			// Mark as pending in the file status tracker
			addPendingFile(absoluteUrl, 'css');
		}
	});
};

/**
 * Process scripts in the HTML
 */
const processScripts = async (doc, baseUrl, resources, resourcesMap) => {
	const scripts = doc.querySelectorAll('script[src]');
	scripts.forEach(script => {
		if (script.src) {
			const absoluteUrl = new URL(script.src, baseUrl.href).href;

			// Skip if already processed
			if (resourcesMap[absoluteUrl]) {
				return;
			}

			// Create a relative path for the resource
			const resourcePath = `js/${getResourceFilename(absoluteUrl)}`;
			script.src = resourcePath;

			// Track this resource
			const resource = { url: absoluteUrl, type: 'javascript', path: resourcePath };
			resources.push(resource);
			resourcesMap[absoluteUrl] = resource;

			// Mark as pending in the file status tracker
			addPendingFile(absoluteUrl, 'javascript');
		}
	});
};

/**
 * Remove specified elements from the document
 */
const removeElements = (doc, selector) => {
	const elements = doc.querySelectorAll(selector);
	elements.forEach(el => el.parentNode.removeChild(el));
};

/**
 * Remove common tracking elements
 */
const removeTrackingElements = (doc) => {
	// Remove Google Analytics, Facebook Pixel, etc.
	const trackingSelectors = [
		'script[src*="google-analytics.com"]',
		'script[src*="googletagmanager.com"]',
		'script[src*="connect.facebook.net"]',
		'script[src*="platform.twitter.com"]',
		'script[src*="ads."]',
		'script[src*="tracking."]'
	];

	trackingSelectors.forEach(selector => {
		removeElements(doc, selector);
	});
};

/**
 * Get a filename from a URL
 */
const getResourceFilename = (url) => {
	try {
		const urlObj = new URL(url);
		const pathname = urlObj.pathname;
		let filename = pathname.split('/').pop() || 'index';

		// Add extension if missing
		if (!filename.includes('.')) {
			const contentType = getContentTypeFromUrl(url);
			if (contentType.includes('image/')) {
				filename += '.jpg';
			} else if (contentType.includes('javascript')) {
				filename += '.js';
			} else if (contentType.includes('css')) {
				filename += '.css';
			}
		}

		// Replace invalid characters
		filename = filename.replace(/[^a-z0-9_.]/gi, '_');
		return filename;
	} catch (error) {
		return `resource_${Math.floor(Math.random() * 10000)}`;
	}
};

/**
 * Attempt to guess content type from URL
 */
const getContentTypeFromUrl = (url) => {
	if (url.match(/\.(jpg|jpeg)$/i)) return 'image/jpeg';
	if (url.match(/\.png$/i)) return 'image/png';
	if (url.match(/\.gif$/i)) return 'image/gif';
	if (url.match(/\.css$/i)) return 'text/css';
	if (url.match(/\.js$/i)) return 'application/javascript';
	return 'application/octet-stream';
};

export async function modifyHtml(htmlString, resourceMap, pageUrl, domain, settings) {
	log('info', 'Starting HTML modification...');
	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlString, 'text/html');
	const base = doc.createElement('base');
	base.href = pageUrl; // Set base href for resolving relative paths if needed during processing
	doc.head.insertBefore(base, doc.head.firstChild); // Add base temporarily

	// Helper to update attributes
	const updateAttribute = (element, attr, originalUrl) => {
		const resourceInfo = resourceMap.get(originalUrl);
		if (resourceInfo && resourceInfo.status === 'success' && resourceInfo.localPath) {
			element.setAttribute(attr, resourceInfo.localPath);
			log('debug', `Updated ${attr} for ${originalUrl} to ${resourceInfo.localPath}`);
		} else if (resourceInfo && (resourceInfo.status === 'skipped' || resourceInfo.status === 'failed')) {
			// Optionally remove the attribute or element, or leave it as is
			// element.removeAttribute(attr); // Example: remove attribute if download failed/skipped
			log('debug', `Skipped/failed resource attribute ${attr} for ${originalUrl}`);
		} else if (originalUrl && !originalUrl.startsWith('data:')) {
			// Resource wasn't found in the map (maybe missed by collector or filtered out early)
			log('warn', `Resource URL not found in map for attribute ${attr}: ${originalUrl}`);
			// Optionally remove attribute or leave original URL
		}
	};

	// Update common elements using DOMParser
	doc.querySelectorAll('link[rel="stylesheet"][href]').forEach(el => {
		const originalUrl = new URL(el.getAttribute('href'), pageUrl).href;
		updateAttribute(el, 'href', originalUrl);
	});

	doc.querySelectorAll('script[src]').forEach(el => {
		const originalUrl = new URL(el.getAttribute('src'), pageUrl).href;
		updateAttribute(el, 'src', originalUrl);
	});

	doc.querySelectorAll('img[src]').forEach(el => {
		const originalUrl = new URL(el.getAttribute('src'), pageUrl).href;
		updateAttribute(el, 'src', originalUrl);
	});

	doc.querySelectorAll('img[srcset]').forEach(el => {
		const newSrcset = el.getAttribute('srcset').split(',')
			.map(part => {
				const item = part.trim().split(/\s+/);
				const originalUrl = new URL(item[0], pageUrl).href;
				const resourceInfo = resourceMap.get(originalUrl);
				if (resourceInfo && resourceInfo.status === 'success' && resourceInfo.localPath) {
					return `${resourceInfo.localPath}${item[1] ? ' ' + item[1] : ''}`;
				}
				return null; // Remove this source if failed/skipped
			})
			.filter(part => part !== null) // Filter out nulls
			.join(', ');
		if (newSrcset) {
			el.setAttribute('srcset', newSrcset);
		} else {
			el.removeAttribute('srcset'); // Remove srcset if all sources failed
		}
	});

	doc.querySelectorAll('video[src]').forEach(el => {
		const originalUrl = new URL(el.getAttribute('src'), pageUrl).href;
		updateAttribute(el, 'src', originalUrl);
	});
	doc.querySelectorAll('video[poster]').forEach(el => {
		const originalUrl = new URL(el.getAttribute('poster'), pageUrl).href;
		updateAttribute(el, 'poster', originalUrl);
	});
	doc.querySelectorAll('audio[src]').forEach(el => {
		const originalUrl = new URL(el.getAttribute('src'), pageUrl).href;
		updateAttribute(el, 'src', originalUrl);
	});
	doc.querySelectorAll('source[src]').forEach(el => { // For video/audio sources
		const originalUrl = new URL(el.getAttribute('src'), pageUrl).href;
		updateAttribute(el, 'src', originalUrl);
	});
	doc.querySelectorAll('track[src]').forEach(el => {
		const originalUrl = new URL(el.getAttribute('src'), pageUrl).href;
		updateAttribute(el, 'src', originalUrl);
	});
	doc.querySelectorAll('iframe[src]').forEach(el => {
		const originalUrl = new URL(el.getAttribute('src'), pageUrl).href;
		updateAttribute(el, 'src', originalUrl);
	});
	// Add more selectors as needed (e.g., object[data], embed[src])

	// Remove the temporary base tag
	doc.head.removeChild(base);

	// Serialize the modified DOM back to string
	let finalHtml = doc.documentElement.outerHTML;

	// --- String Replacements (Post-DOM Manipulation) ---
	// This section handles cases harder to do reliably with DOMParser, like URLs in style attributes/tags

	// 1. Replace URLs in inline style attributes
	// Regex to find url(...) patterns within style="..." attributes
	const styleAttrRegex = /style\s*=\s*(['"])(.*?)\1/gi;
	const urlInStyleRegex = /url\s*\(\s*(['"]?)([^"')]+)\1\s*\)/g;

	finalHtml = finalHtml.replace(styleAttrRegex, (match, quote, styleValue) => {
		const modifiedStyleValue = styleValue.replace(urlInStyleRegex, (urlMatch, urlQuote, originalUrl) => {
			try {
				const absoluteUrl = new URL(originalUrl, pageUrl).href;
				const resourceInfo = resourceMap.get(absoluteUrl);
				if (resourceInfo && resourceInfo.status === 'success' && resourceInfo.localPath) {
					log('debug', `Replaced inline style URL ${originalUrl} with ${resourceInfo.localPath}`);
					return `url(${urlQuote}${resourceInfo.localPath}${urlQuote})`;
				} else {
					log('debug', `Keeping original inline style URL ${originalUrl} (status: ${resourceInfo?.status})`);
					return urlMatch; // Keep original if not downloaded successfully
				}
			} catch (e) {
				log('warn', `Invalid URL in inline style: ${originalUrl}`, e);
				return urlMatch; // Keep original if URL is invalid
			}
		});
		return `style=${quote}${modifiedStyleValue}${quote}`;
	});


	// 2. Replace URLs in <style> tags
	const styleTagRegex = /<style([^>]*)>(.*?)<\/style>/gis;
	finalHtml = finalHtml.replace(styleTagRegex, (match, styleAttrs, styleContent) => {
		const modifiedStyleContent = styleContent.replace(urlInStyleRegex, (urlMatch, urlQuote, originalUrl) => {
			try {
				const absoluteUrl = new URL(originalUrl, pageUrl).href;
				const resourceInfo = resourceMap.get(absoluteUrl);
				if (resourceInfo && resourceInfo.status === 'success' && resourceInfo.localPath) {
					log('debug', `Replaced <style> tag URL ${originalUrl} with ${resourceInfo.localPath}`);
					return `url(${urlQuote}${resourceInfo.localPath}${urlQuote})`;
				} else {
					log('debug', `Keeping original <style> tag URL ${originalUrl} (status: ${resourceInfo?.status})`);
					return urlMatch; // Keep original if not downloaded successfully
				}
			} catch (e) {
				log('warn', `Invalid URL in <style> tag: ${originalUrl}`, e);
				return urlMatch; // Keep original if URL is invalid
			}
		});
		return `<style${styleAttrs}>${modifiedStyleContent}</style>`;
	});


	// 3. Remove specific inline scripts (e.g., analytics) if setting is enabled
	if (settings.removeAnalytics !== false) { // Check setting
		const scriptTagRegex = /<script([^>]*)>(.*?)<\/script>/gis;
		finalHtml = finalHtml.replace(scriptTagRegex, (match, scriptAttrs, scriptContent) => {
			// Avoid removing scripts with src attribute (already handled) unless specifically targeted
			if (/src\s*=/i.test(scriptAttrs)) {
				return match; // Keep external scripts unless logic changes
			}
			// Check content for specific patterns (like in WORKING_VERSION)
			if (scriptContent.includes('gtag(') || scriptContent.includes('clarity(')) {
				log('info', 'Removing inline analytics script.');
				return '<!-- Removed inline analytics script -->'; // Replace with comment or empty string
			}
			return match; // Keep other inline scripts
		});
	}

	// Generate HTML filename
	const htmlFilename = getHtmlFilename(pageUrl, domain);

	log('info', 'HTML modification finished.');
	return { modifiedHtml: finalHtml, htmlFilename };
}
