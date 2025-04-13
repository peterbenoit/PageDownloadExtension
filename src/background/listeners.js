const { processPageData } = require('./processPageData');

chrome.runtime.onInstalled.addListener(() => {
	console.log("Extension installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === 'PAGE_DATA') {
		processPageData(message.data, sender)
			.then(() => sendResponse({ success: true }))
			.catch(error => sendResponse({ success: false, error: error.message }));
		return true; // Indicates async response
	}
	return false;
});

module.exports = {}; // Export empty object for consistency
