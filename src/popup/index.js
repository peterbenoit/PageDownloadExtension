require('./popup.css');
const { loadSettings, saveSettings } = require('./settings');

document.addEventListener('DOMContentLoaded', function () {
	// DOM References
	const downloadButton = document.getElementById('downloadButton');
	const saveButton = document.getElementById('saveButton');
	const resetButton = document.getElementById('resetButton');
	const statusMessage = document.getElementById('statusMessage');
	const maxResourceSizeInput = document.getElementById('maxResourceSize');
	const maxTotalSizeInput = document.getElementById('maxTotalSize');
	const downloadCssCheckbox = document.getElementById('downloadCss');
	const downloadJsCheckbox = document.getElementById('downloadJs');
	const downloadImagesCheckbox = document.getElementById('downloadImages');
	const downloadFontsCheckbox = document.getElementById('downloadFonts');
	const downloadVideosCheckbox = document.getElementById('downloadVideos');

	// Load saved settings
	loadSettings({
		maxResourceSizeInput,
		maxTotalSizeInput,
		downloadCssCheckbox,
		downloadJsCheckbox,
		downloadImagesCheckbox,
		downloadFontsCheckbox,
		downloadVideosCheckbox
	});

	// Download button click handler
	downloadButton.addEventListener('click', function () {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { action: "getPageContent" });
			window.close();
		});
	});

	// Save button click handler
	saveButton.addEventListener('click', function () {
		saveSettings({
			maxResourceSizeInput,
			maxTotalSizeInput,
			downloadCssCheckbox,
			downloadJsCheckbox,
			downloadImagesCheckbox,
			downloadFontsCheckbox,
			downloadVideosCheckbox,
			statusMessage
		});
	});

	// Reset button click handler
	resetButton.addEventListener('click', function () {
		// Reset to default values
		maxResourceSizeInput.value = 30;
		maxTotalSizeInput.value = 120;
		downloadCssCheckbox.checked = true;
		downloadJsCheckbox.checked = true;
		downloadImagesCheckbox.checked = true;
		downloadFontsCheckbox.checked = true;
		downloadVideosCheckbox.checked = true;

		// Save the reset values
		saveSettings({
			maxResourceSizeInput,
			maxTotalSizeInput,
			downloadCssCheckbox,
			downloadJsCheckbox,
			downloadImagesCheckbox,
			downloadFontsCheckbox,
			downloadVideosCheckbox,
			statusMessage
		});
	});
});
