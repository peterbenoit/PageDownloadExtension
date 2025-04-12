document.addEventListener('DOMContentLoaded', function () {
	const maxResourceSizeInput = document.getElementById('maxResourceSize');
	const maxTotalSizeInput = document.getElementById('maxTotalSize');
	const downloadCssInput = document.getElementById('downloadCss');
	const downloadJsInput = document.getElementById('downloadJs');
	const downloadImagesInput = document.getElementById('downloadImages');
	const downloadFontsInput = document.getElementById('downloadFonts');
	const downloadVideosInput = document.getElementById('downloadVideos');
	const saveButton = document.getElementById('saveButton');
	const resetButton = document.getElementById('resetButton');
	const statusMessage = document.getElementById('statusMessage');
	const downloadButton = document.getElementById('downloadButton');

	const DEFAULT_MAX_RESOURCE_SIZE = 30;
	const DEFAULT_MAX_TOTAL_SIZE = 120;

	// Load saved settings or defaults
	chrome.storage.sync.get({
		maxResourceSize: DEFAULT_MAX_RESOURCE_SIZE,
		maxTotalSize: DEFAULT_MAX_TOTAL_SIZE,
		downloadCss: true,
		downloadJs: true,
		downloadImages: true,
		downloadFonts: true,
		downloadVideos: true
	}, function (items) {
		maxResourceSizeInput.value = items.maxResourceSize;
		maxTotalSizeInput.value = items.maxTotalSize;
		downloadCssInput.checked = items.downloadCss;
		downloadJsInput.checked = items.downloadJs;
		downloadImagesInput.checked = items.downloadImages;
		downloadFontsInput.checked = items.downloadFonts;
		downloadVideosInput.checked = items.downloadVideos;
	});

	// Handle the download button click
	downloadButton.addEventListener('click', function () {
		// Get the active tab and trigger the download process
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			if (tabs && tabs[0] && tabs[0].id) {
				const tabId = tabs[0].id;

				// Execute the content script to start the download
				chrome.scripting.executeScript({
					target: { tabId: tabId },
					files: ['content.js']
				}, () => {
					if (chrome.runtime.lastError) {
						console.error(chrome.runtime.lastError);
						statusMessage.textContent = 'Error: ' + chrome.runtime.lastError.message;
						statusMessage.style.color = '#F44336';
					} else {
						// Close the popup after triggering download
						window.close();
					}
				});
			}
		});
	});

	// Save settings
	saveButton.addEventListener('click', function () {
		const resourceSize = parseInt(maxResourceSizeInput.value, 10);
		const totalSize = parseInt(maxTotalSizeInput.value, 10);
		const downloadCss = downloadCssInput.checked;
		const downloadJs = downloadJsInput.checked;
		const downloadImages = downloadImagesInput.checked;
		const downloadFonts = downloadFontsInput.checked;
		const downloadVideos = downloadVideosInput.checked;

		// Validate inputs
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

		// Save settings including new resource type options
		chrome.storage.sync.set({
			maxResourceSize: resourceSize,
			maxTotalSize: totalSize,
			downloadCss: downloadCss,
			downloadJs: downloadJs,
			downloadImages: downloadImages,
			downloadFonts: downloadFonts,
			downloadVideos: downloadVideos
		}, function () {
			statusMessage.textContent = 'Settings saved!';
			statusMessage.style.color = '#4CAF50';

			// Clear status message after 2 seconds
			setTimeout(() => {
				statusMessage.textContent = '';
			}, 2000);
		});
	});

	// Reset to defaults
	resetButton.addEventListener('click', function () {
		maxResourceSizeInput.value = DEFAULT_MAX_RESOURCE_SIZE;
		maxTotalSizeInput.value = DEFAULT_MAX_TOTAL_SIZE;
		downloadCssInput.checked = true;
		downloadJsInput.checked = true;
		downloadImagesInput.checked = true;
		downloadFontsInput.checked = true;
		downloadVideosInput.checked = true;

		chrome.storage.sync.set({
			maxResourceSize: DEFAULT_MAX_RESOURCE_SIZE,
			maxTotalSize: DEFAULT_MAX_TOTAL_SIZE,
			downloadCss: true,
			downloadJs: true,
			downloadImages: true,
			downloadFonts: true,
			downloadVideos: true
		}, function () {
			statusMessage.textContent = 'Reset to defaults';
			statusMessage.style.color = '#4CAF50';

			setTimeout(() => {
				statusMessage.textContent = '';
			}, 2000);
		});
	});
});
