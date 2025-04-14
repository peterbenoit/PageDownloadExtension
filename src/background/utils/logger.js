/**
 * Utility functions for logging and sending messages to the content script.
 */

// Basic logging function
export function log(level, ...args) {
	const prefix = '[PageDL]';
	switch (level) {
		case 'error':
			console.error(prefix, ...args);
			break;
		case 'warn':
			console.warn(prefix, ...args);
			break;
		case 'info':
			console.info(prefix, ...args);
			break;
		case 'debug':
			// Only log debug messages if a flag is set (e.g., during development)
			// For now, let's log them always, but this could be refined.
			console.debug(prefix, ...args);
			break;
		default:
			console.log(prefix, level, ...args); // Log level if not recognized
	}
}

/**
 * Sends a message to the active tab's content script.
 * @param {object} message - The message object to send.
 * @returns {Promise<any>} A promise that resolves with the response from the content script or rejects on error.
 */
export async function sendMessageToActiveTab(message) {
	return new Promise(async (resolve, reject) => {
		try {
			const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
			if (tab && tab.id) {
				log('debug', `Sending message to tab ${tab.id}:`, message);
				chrome.tabs.sendMessage(tab.id, message, (response) => {
					if (chrome.runtime.lastError) {
						log('warn', `Error sending message to tab ${tab.id}: ${chrome.runtime.lastError.message}`);
						// Don't reject here, as the content script might just not be loaded yet
						resolve(null); // Resolve with null if no response/error
					} else {
						log('debug', `Received response from tab ${tab.id}:`, response);
						resolve(response);
					}
				});
			} else {
				log('warn', 'No active tab found to send message.');
				resolve(null); // Resolve with null if no active tab
			}
		} catch (error) {
			log('error', 'Error querying active tab:', error);
			reject(error);
		}
	});
}
