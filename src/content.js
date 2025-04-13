// Modularized content.js

import { createToastElement, showToast, hideToast, updateToast, completeToast, addFileStatus } from './modules/toast.js';
import { extractResources, cleanupExtensionElements } from './modules/resourceExtractor.js';

// Initialize toast UI
createToastElement();

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === 'DOWNLOAD_PROGRESS') {
		updateToast(message.percentage);
	} else if (message.type === 'DOWNLOAD_COMPLETE') {
		completeToast(message.filename);
	} else if (message.type === 'DOWNLOAD_STARTED') {
		showToast();
	} else if (message.type === 'FILE_STATUS') {
		addFileStatus(message.url, message.status, message.reason);
	} else if (message.type === 'LOG') {
		console[message.level || 'log'](`[Background] ${message.message}`);
	}
});

// Extract resources and send them to the background script
try {
	const domain = window.location.hostname.replace(/^www\./, '');
	const html = cleanupExtensionElements(document.documentElement.outerHTML);
	const resources = extractResources();

	chrome.runtime.sendMessage({
		type: 'PAGE_DATA',
		data: { domain, html, resources, url: window.location.href }
	});
} catch (err) {
	console.error('Error in content script:', err);
}
