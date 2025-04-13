import { processPageData } from './processor.js';

// Event listeners for background script
chrome.runtime.onInstalled.addListener(() => {
	console.log("Extension installed.");
});

// Message listener to handle PAGE_DATA requests
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
