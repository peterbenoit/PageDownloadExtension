import { Toast } from '../components/toast.js';
import { collectResources } from './resourceCollector.js';

// Function to remove extension elements before sending HTML
function cleanupExtensionElements(html) {
	// Create a DOM parser to work with the HTML string
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');

	// Remove extension toast notification
	const toast = doc.getElementById('page-download-toast');
	if (toast) {
		toast.remove();
	}

	// Remove any other extension elements by their IDs or classes
	const extensionElements = doc.querySelectorAll(
		'#page-download-progress-bar, ' +
		'#page-download-progress-fill, ' +
		'#page-download-status, ' +
		'#file-status-container, ' +
		'.page-download-extension-element' // Add a class to any other elements you inject
	);

	extensionElements.forEach(el => el.remove());

	// Return the cleaned HTML
	return doc.documentElement.outerHTML;
}

export class MessageHandler {
	constructor() {
		this.toast = new Toast();
		this.setupMessageListener();
		// Remove proactive call: this.sendPageData();
		console.log('MessageHandler initialized. Waiting for trigger...');
	}

	setupMessageListener() {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			console.log('Content script received message:', message); // Keep for debugging

			// Use message types from WORKING_VERSION
			switch (message.type) {
				// Add listener for the trigger message from popup/background action
				case 'TRIGGER_DOWNLOAD_PROCESS':
					console.log('TRIGGER_DOWNLOAD_PROCESS received. Starting data collection...');
					// Call sendPageData when triggered
					this.sendPageData()
						.then(() => {
							// Acknowledge the trigger message
							sendResponse({ success: true, message: 'Data collection initiated.' });
						})
						.catch(error => {
							console.error('Error during sendPageData triggered:', error);
							sendResponse({ success: false, error: `Failed to initiate data collection: ${error.message}` });
						});
					return true; // Indicate asynchronous response

				case 'DOWNLOAD_STARTED':
					this.toast.showToast(); // Show the prepared toast
					sendResponse({ success: true });
					break;

				case 'DOWNLOAD_PROGRESS':
					this.toast.updateToast(message.percentage);
					sendResponse({ success: true });
					break;

				case 'DOWNLOAD_COMPLETE':
					this.toast.completeToast(message.filename);
					sendResponse({ success: true });
					break;

				case 'FILE_STATUS':
					this.toast.addFileStatus(message.url, message.status, message.reason);
					sendResponse({ success: true });
					break;

				case 'LOG':
					// Log background messages in the page console
					if (message.level && console[message.level]) {
						console[message.level](`[Background] ${message.message}`);
					} else {
						console.log(`[Background] ${message.message}`);
					}
					sendResponse({ success: true });
					break;

				// Keep scanPage temporarily if background still uses it, but ideally remove
				// case 'scanPage':
				// 	this.handleScanPage(sendResponse); // If you need to keep compatibility
				// 	return true; // Keep the message channel open for async response

				default:
					// Handle unknown messages or ignore
					console.warn('Received unknown message type:', message.type);
					sendResponse({ success: false, error: 'Unknown message type' });
					break;
			}
			// Return true for async sendResponse calls if needed, otherwise false/undefined is fine
			return false;
		});
	}

	// Renamed from handleScanPage and made proactive
	async sendPageData() {
		try {
			// Assuming collectResources works similarly to the logic in WORKING_VERSION
			const resources = await collectResources();
			const domainRaw = window.location.hostname;
			const domain = domainRaw.replace(/^www\./, '');

			// Clean the HTML before sending
			const cleanedHtml = cleanupExtensionElements(document.documentElement.outerHTML);

			console.log("Sending PAGE_DATA with resources:", resources); // Debug log

			chrome.runtime.sendMessage({
				type: "PAGE_DATA", // Match WORKING_VERSION message type
				data: {
					domain: domain,
					html: cleanedHtml, // Send cleaned HTML
					resources: resources,
					url: window.location.href
					// title is not sent in WORKING_VERSION, removed for consistency
				}
			});
		} catch (error) {
			console.error('Error collecting or sending page data:', error);
			// Optionally notify the background or show an error toast
			// this.toast.showToast(`Error preparing page data: ${error.message}`, 5000);
		}
	}

	// Remove the old handleScanPage method
	// async handleScanPage(sendResponse) { ... }
}
