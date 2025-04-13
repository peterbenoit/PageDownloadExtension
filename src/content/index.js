// Main content script entry point
import { createToastElement, showToast, hideToast, updateToast, completeToast, addFileStatus } from './ui.js';
import { cleanupExtensionElements } from './utils.js';
import { collectPageResources } from './resource-collector.js';

// IIFE to avoid polluting global namespace
(function () {
	// Initialize UI
	createToastElement();

	// Function to collect and send page data to background script
	function collectAndSendPageData() {
		try {
			const domainRaw = window.location.hostname;
			const domain = domainRaw.replace(/^www\./, '');

			// Clean the HTML before sending it
			const html = cleanupExtensionElements(document.documentElement.outerHTML);

			// Collect all resources from the page
			const resources = collectPageResources();

			console.log("Resources found:", resources);

			chrome.runtime.sendMessage({
				type: "PAGE_DATA",
				data: {
					domain: domain,
					html: html,
					resources: resources,
					url: window.location.href
				}
			});
		} catch (err) {
			console.error("Error in content script:", err);
		}
	}

	// Listen for messages from background script and popup
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.type === 'DOWNLOAD_PROGRESS') {
			updateToast(message.percentage);
		} else if (message.type === 'DOWNLOAD_COMPLETE') {
			completeToast(message.filename);
		} else if (message.type === 'DOWNLOAD_STARTED') {
			showToast();
		} else if (message.type === 'FILE_STATUS') {
			// New message type for file status
			addFileStatus(message.url, message.status, message.reason);
		} else if (message.type === 'LOG') {
			// Log background messages in the page console
			if (message.level && console[message.level]) {
				console[message.level](`[Background] ${message.message}`);
			} else {
				console.log(`[Background] ${message.message}`);
			}
		} else if (message.type === 'TRIGGER_DOWNLOAD') {
			// Handle the download trigger from popup
			collectAndSendPageData();
			// Send response back to popup
			if (sendResponse) {
				sendResponse({ success: true });
			}
		}

		return true; // Keep the message channel open for async responses
	});

	// On initial content script load, don't automatically trigger download
})();
