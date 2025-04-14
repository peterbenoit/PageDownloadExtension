/**
 * Background script entry point
 */
import { logDebug, setupMessageListeners } from './logger';
import { getStatusSummary } from './fileStatus';
import { startPageDownload } from './pageProcessor';

// Log that background script has loaded
logDebug('Background script initialized');

// Set up message handlers
const messageHandlers = {
	downloadPage: async (message, sender, sendResponse) => {
		logDebug('Received download request with options:', message.options);
		try {
			const result = await startPageDownload(message.options);
			sendResponse(result);
		} catch (error) {
			logDebug('Error in downloadPage handler:', error);
			sendResponse({ success: false, error: error.message });
		}
	},

	getStatus: (message, sender, sendResponse) => {
		const status = getStatusSummary();
		logDebug('Status requested, returning:', status);
		sendResponse(status);
	},

	cancelDownload: (message, sender, sendResponse) => {
		logDebug('Download cancellation requested');
		// Implement cancellation logic here
		sendResponse({ success: true });
	},

	PAGE_DATA: (message, sender, sendResponse) => {
		// Process page data
		console.log("Received PAGE_DATA message");
		logDebug('Received page data:', message.data);
		// Process the page data as needed
		sendResponse({ received: true });
	}
};

// Set up message listeners
setupMessageListeners(messageHandlers);

// Handle browser action click
chrome.action.onClicked.addListener((tab) => {
	logDebug('Browser action clicked');

	// Open popup or handle direct download based on extension configuration
	chrome.storage.local.get(['directDownload'], (result) => {
		if (result.directDownload) {
			// Trigger direct download with default options
			chrome.storage.local.get(['downloadOptions'], async (optionsResult) => {
				const options = optionsResult.downloadOptions || {
					downloadImages: true,
					downloadCSS: true,
					downloadScripts: false,
					removeTracking: true
				};
				await startPageDownload(options);
			});
		}
	});
});

// Set up initial extension state
chrome.runtime.onInstalled.addListener((details) => {
	if (details.reason === 'install') {
		// Set default settings on install
		chrome.storage.local.set({
			debugMode: false,
			directDownload: false,
			downloadOptions: {
				downloadImages: true,
				downloadCSS: true,
				downloadScripts: false,
				removeTracking: true,
				removeScripts: false
			}
		});
		logDebug('Extension installed, default settings applied');
	}
});
