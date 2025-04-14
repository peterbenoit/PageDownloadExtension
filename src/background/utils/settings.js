import { log } from './logger.js';

// Define default settings
const defaultSettings = {
	maxResourceSize: 10, // MB
	maxTotalSize: 100, // MB
	downloadCss: true,
	downloadJs: true,
	downloadImages: true,
	downloadFonts: true,
	downloadVideos: false, // Default to false for videos
	downloadAudio: false, // Default to false for audio
	removeAnalytics: true, // Default to true for removing known analytics scripts
	// Add other settings as needed
};

/**
 * Loads settings from chrome.storage.sync, applying defaults for missing values.
 * @returns {Promise<object>} A promise that resolves with the loaded settings object.
 */
export async function loadSettings() {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get(defaultSettings, (items) => {
			if (chrome.runtime.lastError) {
				log('error', `Error loading settings: ${chrome.runtime.lastError.message}`);
				// Resolve with defaults even if there's an error reading
				resolve({ ...defaultSettings });
			} else {
				log('info', 'Settings loaded successfully:', items);
				// Ensure all default keys are present, even if storage is empty initially
				const loadedSettings = { ...defaultSettings, ...items };
				resolve(loadedSettings);
			}
		});
	});
}

/**
 * Saves a specific setting or multiple settings to chrome.storage.sync.
 * @param {object} settingsToSave - An object containing the key-value pairs to save.
 * @returns {Promise<void>} A promise that resolves when saving is complete or rejects on error.
 */
export async function saveSettings(settingsToSave) {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.set(settingsToSave, () => {
			if (chrome.runtime.lastError) {
				log('error', `Error saving settings: ${chrome.runtime.lastError.message}`);
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				log('info', 'Settings saved successfully:', settingsToSave);
				resolve();
			}
		});
	});
}
