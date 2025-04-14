/**
 * Logger module for handling console logging and messaging
 */

/**
 * Log debug message if debugging is enabled
 * @param {string} message - The message to log
 * @param {any} [data] - Optional data to log
 */
export const logDebug = (message, data) => {
	chrome.storage.local.get(['debugMode'], (result) => {
		if (result.debugMode) {
			if (data) {
				console.log(`[PageDownloader] ${message}`, data);
			} else {
				console.log(`[PageDownloader] ${message}`);
			}
		}
	});
};

/**
 * Send a message to the active tab
 * @param {object} message - Message object to send
 */
export const sendMessageToActiveTab = async (message) => {
	try {
		const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
		if (activeTab?.id) {
			await chrome.tabs.sendMessage(activeTab.id, message);
			logDebug(`Sent message to tab ${activeTab.id}:`, message);
		}
	} catch (error) {
		logDebug('Error sending message to active tab:', error);
	}
};

/**
 * Set up message listeners for background script
 * @param {Object} handlers - Object with message handler functions
 */
export const setupMessageListeners = (handlers) => {
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		logDebug('Received message:', message);

		// Call the appropriate handler based on message type
		if (message.type && handlers[message.type]) {
			handlers[message.type](message, sender, sendResponse);
			return true; // Keep channel open for async response if needed
		}

		return false;
	});
};
