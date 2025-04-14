// Main entry point for popup script

document.addEventListener('DOMContentLoaded', function () {
	// Get references to DOM elements
	const maxResourceSizeInput = document.getElementById('maxResourceSize');
	const maxTotalSizeInput = document.getElementById('maxTotalSize');
	const downloadCssInput = document.getElementById('downloadCss');
	const downloadJsInput = document.getElementById('downloadJs');
	const downloadImagesInput = document.getElementById('downloadImages');
	const downloadFontsInput = document.getElementById('downloadFonts');
	const downloadVideosInput = document.getElementById('downloadVideos');
	const downloadAudioInput = document.getElementById('downloadAudio'); // Added Audio
	const removeAnalyticsInput = document.getElementById('removeAnalytics'); // Added Analytics removal
	const saveButton = document.getElementById('saveButton');
	const resetButton = document.getElementById('resetButton');
	const statusMessage = document.getElementById('statusMessage');
	const downloadButton = document.getElementById('downloadButton');

	// Define default settings (should match defaults in background/utils/settings.js)
	const defaultSettings = {
		maxResourceSize: 10,
		maxTotalSize: 100,
		downloadCss: true,
		downloadJs: true,
		downloadImages: true,
		downloadFonts: true,
		downloadVideos: false,
		downloadAudio: false,
		removeAnalytics: true,
	};

	// --- Settings Loading ---
	chrome.storage.sync.get(defaultSettings, function (items) {
		if (chrome.runtime.lastError) {
			console.error("Error loading settings:", chrome.runtime.lastError);
			statusMessage.textContent = 'Error loading settings.';
			statusMessage.style.color = '#F44336';
			// Populate with defaults even on error
			items = defaultSettings;
		}
		maxResourceSizeInput.value = items.maxResourceSize;
		maxTotalSizeInput.value = items.maxTotalSize;
		downloadCssInput.checked = items.downloadCss;
		downloadJsInput.checked = items.downloadJs;
		downloadImagesInput.checked = items.downloadImages;
		downloadFontsInput.checked = items.downloadFonts;
		downloadVideosInput.checked = items.downloadVideos;
		// Check if new elements exist before setting them
		if (downloadAudioInput) downloadAudioInput.checked = items.downloadAudio;
		if (removeAnalyticsInput) removeAnalyticsInput.checked = items.removeAnalytics;
	});

	// --- Download Button ---
	downloadButton.addEventListener('click', function () {
		statusMessage.textContent = 'Initiating download...';
		statusMessage.style.color = '#2196F3'; // Blue for initiating

		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			if (tabs && tabs[0] && tabs[0].id) {
				const tabId = tabs[0].id;

				// Send message to content script to trigger data collection/sending
				// This assumes the content script is already injected via manifest
				// and listening for this message type.
				chrome.tabs.sendMessage(tabId, { type: 'TRIGGER_DOWNLOAD_PROCESS' })
					.then(response => {
						console.log("Response from content script trigger:", response);
						// Optionally update status based on response
						if (response && response.success) {
							// Status message might be quickly replaced by toast from content script
							statusMessage.textContent = 'Processing started...';
							statusMessage.style.color = '#4CAF50';
						} else {
							statusMessage.textContent = 'Failed to start process. Is the page supported?';
							statusMessage.style.color = '#F44336';
						}
						// Close popup after attempting to trigger
						setTimeout(() => window.close(), 500);
					})
					.catch(error => {
						console.error("Error sending trigger message:", error);
						statusMessage.textContent = 'Error: Could not communicate with page. Try reloading the page.';
						statusMessage.style.color = '#F44336';
						// Don't close popup immediately on error
					});

			} else {
				statusMessage.textContent = 'Error: Could not find active tab.';
				statusMessage.style.color = '#F44336';
			}
		});
	});

	// --- Save Settings Button ---
	saveButton.addEventListener('click', function () {
		const resourceSize = parseInt(maxResourceSizeInput.value, 10);
		const totalSize = parseInt(maxTotalSizeInput.value, 10);
		const downloadCss = downloadCssInput.checked;
		const downloadJs = downloadJsInput.checked;
		const downloadImages = downloadImagesInput.checked;
		const downloadFonts = downloadFontsInput.checked;
		const downloadVideos = downloadVideosInput.checked;
		// Read new values if elements exist
		const downloadAudio = downloadAudioInput ? downloadAudioInput.checked : defaultSettings.downloadAudio;
		const removeAnalytics = removeAnalyticsInput ? removeAnalyticsInput.checked : defaultSettings.removeAnalytics;


		// Validation
		if (isNaN(resourceSize) || resourceSize < 1) {
			statusMessage.textContent = 'Resource size must be at least 1 MB';
			statusMessage.style.color = '#F44336';
			return;
		}
		if (isNaN(totalSize) || totalSize < 5) {
			statusMessage.textContent = 'Total size must be at least 5 MB';
			statusMessage.style.color = '#F44336';
			return;
		}
		if (resourceSize > totalSize) {
			statusMessage.textContent = 'Resource size cannot exceed total size';
			statusMessage.style.color = '#F44336';
			return;
		}

		const settingsToSave = {
			maxResourceSize: resourceSize,
			maxTotalSize: totalSize,
			downloadCss: downloadCss,
			downloadJs: downloadJs,
			downloadImages: downloadImages,
			downloadFonts: downloadFonts,
			downloadVideos: downloadVideos,
			downloadAudio: downloadAudio,
			removeAnalytics: removeAnalytics,
		};

		// Save using chrome.storage.sync
		chrome.storage.sync.set(settingsToSave, function () {
			if (chrome.runtime.lastError) {
				console.error("Error saving settings:", chrome.runtime.lastError);
				statusMessage.textContent = 'Error saving settings.';
				statusMessage.style.color = '#F44336';
			} else {
				statusMessage.textContent = 'Settings saved!';
				statusMessage.style.color = '#4CAF50';
				setTimeout(() => { statusMessage.textContent = ''; }, 2000);
			}
		});
	});

	// --- Reset Settings Button ---
	resetButton.addEventListener('click', function () {
		// Reset form fields to defaults
		maxResourceSizeInput.value = defaultSettings.maxResourceSize;
		maxTotalSizeInput.value = defaultSettings.maxTotalSize;
		downloadCssInput.checked = defaultSettings.downloadCss;
		downloadJsInput.checked = defaultSettings.downloadJs;
		downloadImagesInput.checked = defaultSettings.downloadImages;
		downloadFontsInput.checked = defaultSettings.downloadFonts;
		downloadVideosInput.checked = defaultSettings.downloadVideos;
		if (downloadAudioInput) downloadAudioInput.checked = defaultSettings.downloadAudio;
		if (removeAnalyticsInput) removeAnalyticsInput.checked = defaultSettings.removeAnalytics;

		// Save defaults to storage
		chrome.storage.sync.set(defaultSettings, function () {
			if (chrome.runtime.lastError) {
				console.error("Error resetting settings:", chrome.runtime.lastError);
				statusMessage.textContent = 'Error resetting settings.';
				statusMessage.style.color = '#F44336';
			} else {
				statusMessage.textContent = 'Reset to defaults';
				statusMessage.style.color = '#4CAF50';
				setTimeout(() => { statusMessage.textContent = ''; }, 2000);
			}
		});
	});
});
