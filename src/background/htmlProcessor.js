/**
 * HTML processing module for modifying HTML content
 */
import { logDebug } from './logger';
import { addPendingFile } from './fileStatus';

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
