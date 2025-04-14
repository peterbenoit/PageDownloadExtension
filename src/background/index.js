/**
 * Background script entry point
 */
import { logDebug, setupMessageListeners } from './logger';
import { getStatusSummary } from './fileStatus';
import './pageProcessor.js'; // Ensure pageProcessor runs and sets up its listener

// Log that background script has loaded
logDebug('Background script initialized');

// Set up message handlers
const messageHandlers = {
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

	// Example: Send a message to content script to initiate scan/data collection
	// This might need adjustment based on final workflow.
	// If content script sends PAGE_DATA proactively, this might just trigger UI feedback.
	chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_DOWNLOAD_PROCESS' }) // Or a more appropriate message
		.then(response => {
			logDebug('Response from trigger message:', response);
		})
		.catch(error => {
			logDebug(`Could not send trigger message to tab ${tab.id}: ${error.message}. Content script might not be ready.`);
			// Optionally, try injecting the content script here if necessary
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
