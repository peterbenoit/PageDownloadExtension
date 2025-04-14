import { modifyHtml } from './htmlProcessor.js';
// Correct imports for the utility modules we created
import { sendMessageToActiveTab, log } from './utils/logger.js';
import { initializeFileStatus, updateFileStatus, getFileStatusSummary } from './utils/fileStatus.js';
import { downloadZip } from './downloader.js';
import { loadSettings } from './utils/settings.js'; // Correct path
import JSZip from 'jszip';

// Constants
const FETCH_TIMEOUT_MS = 15000; // 15 seconds

// Main function to handle page data and orchestrate download
async function processPageData(pageData) {
	const { domain, html, resources, url } = pageData;
	log('info', `Received page data for ${url}. Processing ${resources.length} potential resources.`);

	try {
		// 1. Load Settings
		const settings = await loadSettings();
		const MAX_RESOURCE_SIZE_BYTES = (settings.maxResourceSize || 10) * 1024 * 1024;
		const MAX_TOTAL_SIZE_BYTES = (settings.maxTotalSize || 100) * 1024 * 1024;
		log('info', 'Settings loaded:', settings);

		// 2. Initialize Status & Notify Start
		initializeFileStatus();
		await sendMessageToActiveTab({ type: 'DOWNLOAD_STARTED' });

		const zip = new JSZip();
		let currentTotalSize = 0; // Track size during download

		// 3. Download Resources (and update progress)
		log('info', `Starting resource download phase.`);
		const resourceMap = await downloadResources(
			resources,
			zip,
			currentTotalSize, // Pass initial size
			MAX_RESOURCE_SIZE_BYTES,
			MAX_TOTAL_SIZE_BYTES,
			settings,
			(processed, total, currentSize) => { // Update progress callback signature
				currentTotalSize = currentSize; // Update current size from callback
				const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;
				sendMessageToActiveTab({ type: 'DOWNLOAD_PROGRESS', percentage });
			}
		);
		const summary = getFileStatusSummary();
		log('info', `Resource download phase complete. Status: ${summary.success} success, ${summary.skipped} skipped, ${summary.failed} failed. Total size: ${(summary.totalSize / (1024 * 1024)).toFixed(2)} MB`);

		// 4. Modify HTML
		log('info', 'Starting HTML modification phase...');
		// Pass necessary arguments to modifyHtml
		const { modifiedHtml, htmlFilename } = await modifyHtml(html, resourceMap, url, domain, settings);
		log('info', `HTML modification complete. Filename: ${htmlFilename}`);

		// Add HTML to zip
		zip.file(htmlFilename, modifiedHtml);

		// 5. Generate and Download Zip
		log('info', 'Starting ZIP generation and download phase...');
		const zipFilename = getZipFilename(url, domain);
		await downloadZip(zip, zipFilename); // Call the function from downloader.js

		// 6. Notify Completion
		await sendMessageToActiveTab({ type: 'DOWNLOAD_COMPLETE', filename: zipFilename });
		log('info', `Download process complete for ${url}. Saved as ${zipFilename}`);

	} catch (error) {
		log('error', `Error during page processing for ${url}: ${error.message}`, error.stack);
		// Send a generic error message and log details
		await sendMessageToActiveTab({ type: 'DOWNLOAD_ERROR', message: `Processing failed: ${error.message}` });
		// Optionally send detailed file status on error
		const errorSummary = getFileStatusSummary();
		log('warn', `Status at time of error: ${errorSummary.success} success, ${errorSummary.skipped} skipped, ${errorSummary.failed} failed.`);
		// Consider sending individual FILE_STATUS messages again if needed for the UI
	}
}

// Function to download resources, adapted from WORKING_VERSION
async function downloadResources(resources, zip, initialTotalSize, maxResourceSize, maxTotalSize, settings, progressCallback) {
	const resourceMap = new Map(); // Maps original URL to { status, localPath?, reason?, size? }
	let processedCount = 0;
	let currentTotalSize = initialTotalSize; // Use local variable for tracking size

	// Filter resources based on settings BEFORE fetching
	const resourcesToDownload = resources.filter(resource => {
		// Skip data URLs immediately, they aren't downloaded
		if (resource.url.startsWith('data:')) {
			updateFileStatus(resource.url, 'skipped', 'Data URL');
			resourceMap.set(resource.url, { status: 'skipped', reason: 'Data URL', localPath: null });
			sendMessageToActiveTab({ type: 'FILE_STATUS', url: resource.url, status: 'skipped', reason: 'Data URL' });
			return false; // Exclude from download list
		}

		switch (resource.type) {
			case 'css': return settings.downloadCss !== false;
			case 'js': return settings.downloadJs !== false;
			case 'image': return settings.downloadImages !== false;
			case 'font': return settings.downloadFonts !== false;
			case 'video': return settings.downloadVideos !== false;
			case 'audio': return settings.downloadAudio !== false;
			// Add cases for 'document', 'embed', 'object', 'text' if settings exist
			default: return true; // Download unknown types by default unless a setting says otherwise
		}
	});

	const totalToProcess = resourcesToDownload.length;
	const skippedBySettingsCount = resources.length - totalToProcess - fileStatuses.skipped.length; // Account for data URLs already skipped
	log('info', `Resource filtering: ${totalToProcess} items to download, ${skippedBySettingsCount} skipped by settings.`);

	// Inform content script about resources skipped by settings
	resources.forEach(resource => {
		// Check if it was in the original list but not in the filtered list AND not already skipped (like data URLs)
		if (!resourcesToDownload.includes(resource) && !resourceMap.has(resource.url)) {
			const reason = `Skipped by settings (type: ${resource.type})`;
			updateFileStatus(resource.url, 'skipped', reason);
			resourceMap.set(resource.url, { status: 'skipped', reason: reason });
			sendMessageToActiveTab({ type: 'FILE_STATUS', url: resource.url, status: 'skipped', reason: reason });
		}
	});

	// Process the filtered list
	for (const resource of resourcesToDownload) {
		const { url, type, filename } = resource;
		// Generate local path consistently (consider moving this to a utility if complex)
		let folder = 'assets'; // Default folder
		switch (type) {
			case 'css': folder = 'css'; break;
			case 'js': folder = 'js'; break;
			case 'image': folder = 'images'; break;
			case 'font': folder = 'fonts'; break;
			case 'video': case 'audio': folder = 'media'; break;
			// Add more cases if needed
		}
		// Sanitize filename just in case (basic example)
		const safeFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/__+/g, '_');
		const localPath = `${folder}/${safeFilename}`;

		try {
			// Fetch resource with timeout
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

			log('debug', `Fetching: ${url}`);
			const response = await fetch(url, { signal: controller.signal, mode: 'cors', credentials: 'omit' }); // Consider CORS and credentials
			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`HTTP error ${response.status}`);
			}

			const blob = await response.blob();
			const resourceSize = blob.size;

			// Check individual resource size
			if (resourceSize > maxResourceSize) {
				throw new Error(`Resource size (${(resourceSize / (1024 * 1024)).toFixed(1)}MB) exceeds limit (${(maxResourceSize / (1024 * 1024)).toFixed(1)}MB)`);
			}

			// Check total size limit
			if (currentTotalSize + resourceSize > maxTotalSize) {
				throw new Error(`Adding resource would exceed total size limit (${(maxTotalSize / (1024 * 1024)).toFixed(1)}MB)`);
			}

			// Add to zip and update status
			zip.file(localPath, blob);
			currentTotalSize += resourceSize; // Update running total
			updateFileStatus(url, 'success', null, resourceSize);
			resourceMap.set(url, { status: 'success', localPath: localPath, size: resourceSize });
			sendMessageToActiveTab({ type: 'FILE_STATUS', url: url, status: 'success', reason: null });
			log('debug', `Success: ${url} -> ${localPath} (${resourceSize} bytes)`);

		} catch (error) {
			const reason = error.name === 'AbortError' ? 'Timeout fetching resource' : `Failed: ${error.message}`;
			log('warn', `Failed to download ${url}: ${reason}`);
			updateFileStatus(url, 'failed', reason);
			resourceMap.set(url, { status: 'failed', reason: reason, localPath: null });
			sendMessageToActiveTab({ type: 'FILE_STATUS', url: url, status: 'failed', reason: reason });
		} finally {
			processedCount++;
			// Pass current total size back in progress callback
			progressCallback(processedCount, totalToProcess, currentTotalSize);
		}
	}
	return resourceMap;
}

// Helper function to generate ZIP filename (from WORKING_VERSION)
function getZipFilename(pageUrl, domain) {
	try {
		const urlObj = new URL(pageUrl);
		let path = urlObj.pathname;

		// Remove leading/trailing slashes and replace slashes with underscores
		path = path.replace(/^\/|\/$/g, '').replace(/\//g, '_');

		// Get filename from path or use domain if path is empty
		let namePart = path.split('_').pop() || domain;
		// Remove file extension if present
		namePart = namePart.replace(/\.[^.]+$/, '');

		// Sanitize the name part
		namePart = namePart.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/__+/g, '_');

		// Limit length
		namePart = namePart.substring(0, 50); // Limit length to avoid issues

		// Fallback if namePart is empty after sanitization
		if (!namePart) {
			namePart = domain.replace(/[^a-zA-Z0-9_-]/g, '_');
		}
		if (!namePart) {
			namePart = 'downloaded_page'; // Absolute fallback
		}


		return `${namePart}.zip`;
	} catch (e) {
		log('error', 'Error generating zip filename:', e);
		// Basic fallback using domain
		let safeDomain = domain.replace(/[^a-zA-Z0-9_-]/g, '_');
		return `${safeDomain || 'downloaded_page'}.zip`;
	}
}


// Listener for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === 'PAGE_DATA') {
		log('info', 'Received PAGE_DATA message, starting processing...');
		// Start processing asynchronously
		processPageData(message.data)
			.then(() => {
				log('info', 'processPageData finished successfully.');
				// Optional: sendResponse({ success: true }) - may not be needed if content script doesn't wait
			})
			.catch(error => {
				log('error', 'Unhandled error during page processing pipeline:', error);
				// Optional: sendResponse({ success: false, error: error.message })
			});
		// Indicate that the response will be sent asynchronously (or not at all)
		// Return false if not sending a response back to the original sender.
		// Return true only if you intend to use sendResponse later.
		return false; // Content script doesn't seem to need a response here
	}
	// Handle other message types if needed (e.g., from popup)
	log('debug', `Received unhandled message type: ${message.type}`);
	return false; // No async response planned
});
