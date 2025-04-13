import { processPageData } from './processPageData.js';

export function messageListener(message, sender, sendResponse) {
	if (message.type === 'PAGE_DATA') {
		processPageData(message.data, sender)
			.then(() => sendResponse({ success: true }))
			.catch(error => sendResponse({ success: false, error: error.message }));
		return true; // Indicates async response
	}
	return false;
}
