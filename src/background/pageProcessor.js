/**
 * Page processing module for handling overall page download operations
 */
import { logDebug, sendMessageToActiveTab } from './logger';
import { resetFileTracking, getStatusSummary } from './fileStatus';
import { processHtml } from './htmlProcessor';
import { downloadFile } from './downloader';

// Track active downloads
let isProcessing = false;

/**
 * Initialize a new page download process
 * @param {Object} options - Download options
 */
export const startPageDownload = async (options) => {
	if (isProcessing) {
		logDebug('Already processing a page. Aborting new request.');
		return { success: false, error: 'A download is already in progress' };
	}

	try {
		isProcessing = true;
		resetFileTracking();

		// Notify UI that we're starting
		sendMessageToActiveTab({ type: 'downloadStarted' });

		logDebug('Starting page download with options:', options);

		// Get the active tab's HTML content
		const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
		if (!activeTab?.id) {
			throw new Error('No active tab found');
		}

		// Get page HTML
		const pageContent = await chrome.scripting.executeScript({
			target: { tabId: activeTab.id },
			function: () => document.documentElement.outerHTML
		});

		const htmlContent = pageContent[0]?.result;
		if (!htmlContent) {
			throw new Error('Failed to get page HTML');
		}

		// Process the HTML content
		const pageUrl = activeTab.url;
		const { processedHtml, resources } = await processHtml(htmlContent, pageUrl, options);

		// Download the HTML file
		const filename = activeTab.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.html';
		await downloadFile(filename, processedHtml, 'text/html');

		// Start downloading resources if requested
		if (options.downloadResources) {
			await downloadResources(resources, options);
		}

		const summary = getStatusSummary();
		sendMessageToActiveTab({
			type: 'downloadComplete',
			summary
		});

		logDebug('Download completed', summary);
		return { success: true, summary };

	} catch (error) {
		logDebug('Error processing page:', error);
		sendMessageToActiveTab({
			type: 'downloadError',
			error: error.message
		});
		return { success: false, error: error.message };
	} finally {
		isProcessing = false;
	}
};

/**
 * Download resources associated with a page
 * @param {Array} resources - Array of resource objects
 * @param {Object} options - Download options
 */
const downloadResources = async (resources, options) => {
	logDebug(`Starting download of ${resources.length} resources`);

	// Implement resource downloading based on options
	// This would involve calling the downloader module for each resource
	// and updating status through fileStatus module
};
