/**
 * Load settings from storage and populate form fields
 */
function loadSettings(elements) {
	const {
		maxResourceSizeInput,
		maxTotalSizeInput,
		downloadCssCheckbox,
		downloadJsCheckbox,
		downloadImagesCheckbox,
		downloadFontsCheckbox,
		downloadVideosCheckbox
	} = elements;

	// Load saved settings from storage
	chrome.storage.sync.get({
		maxResourceSize: 30,
		maxTotalSize: 120,
		downloadCss: true,
		downloadJs: true,
		downloadImages: true,
		downloadFonts: true,
		downloadVideos: true
	}, function (items) {
		maxResourceSizeInput.value = items.maxResourceSize;
		maxTotalSizeInput.value = items.maxTotalSize;
		downloadCssCheckbox.checked = items.downloadCss;
		downloadJsCheckbox.checked = items.downloadJs;
		downloadImagesCheckbox.checked = items.downloadImages;
		downloadFontsCheckbox.checked = items.downloadFonts;
		downloadVideosCheckbox.checked = items.downloadVideos;
	});
}

/**
 * Save settings to storage
 */
function saveSettings(elements) {
	const {
		maxResourceSizeInput,
		maxTotalSizeInput,
		downloadCssCheckbox,
		downloadJsCheckbox,
		downloadImagesCheckbox,
		downloadFontsCheckbox,
		downloadVideosCheckbox,
		statusMessage
	} = elements;

	// Validate inputs
	const maxResourceSize = parseInt(maxResourceSizeInput.value);
	const maxTotalSize = parseInt(maxTotalSizeInput.value);

	if (isNaN(maxResourceSize) || maxResourceSize < 1) {
		statusMessage.textContent = "Please enter a valid resource size.";
		return;
	}

	if (isNaN(maxTotalSize) || maxTotalSize < maxResourceSize) {
		statusMessage.textContent = "Total size must be larger than resource size.";
		return;
	}

	// Save the settings
	chrome.storage.sync.set({
		maxResourceSize: maxResourceSize,
		maxTotalSize: maxTotalSize,
		downloadCss: downloadCssCheckbox.checked,
		downloadJs: downloadJsCheckbox.checked,
		downloadImages: downloadImagesCheckbox.checked,
		downloadFonts: downloadFontsCheckbox.checked,
		downloadVideos: downloadVideosCheckbox.checked
	}, function () {
		// Update status to let user know options were saved
		statusMessage.textContent = "Settings saved.";

		// Clear the status message after 1.5 seconds
		setTimeout(function () {
			statusMessage.textContent = "";
		}, 1500);
	});
}

module.exports = {
	loadSettings,
	saveSettings
};
