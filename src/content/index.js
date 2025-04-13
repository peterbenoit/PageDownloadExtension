const { createToastElement } = require('./toastUI');
const { showToast, hideToast, updateToast, completeToast, addFileStatus } = require('./toastHandlers');
const { cleanupExtensionElements, collectPageResources } = require('./resourceCollector');

// Set up message listener
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
	}
});

// Initialize toast
createToastElement();

// Collect and send resources
collectPageResources();
