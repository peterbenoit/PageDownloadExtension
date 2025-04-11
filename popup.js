document.addEventListener('DOMContentLoaded', function () {
	const maxResourceSizeInput = document.getElementById('maxResourceSize');
	const maxTotalSizeInput = document.getElementById('maxTotalSize');
	const saveButton = document.getElementById('saveButton');
	const resetButton = document.getElementById('resetButton');
	const statusMessage = document.getElementById('statusMessage');

	const DEFAULT_MAX_RESOURCE_SIZE = 30;
	const DEFAULT_MAX_TOTAL_SIZE = 120;

	// Load saved settings or defaults
	chrome.storage.sync.get({
		maxResourceSize: DEFAULT_MAX_RESOURCE_SIZE,
		maxTotalSize: DEFAULT_MAX_TOTAL_SIZE
	}, function (items) {
		maxResourceSizeInput.value = items.maxResourceSize;
		maxTotalSizeInput.value = items.maxTotalSize;
	});

	// Save settings
	saveButton.addEventListener('click', function () {
		const resourceSize = parseInt(maxResourceSizeInput.value, 10);
		const totalSize = parseInt(maxTotalSizeInput.value, 10);

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

		// Save settings
		chrome.storage.sync.set({
			maxResourceSize: resourceSize,
			maxTotalSize: totalSize
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

		chrome.storage.sync.set({
			maxResourceSize: DEFAULT_MAX_RESOURCE_SIZE,
			maxTotalSize: DEFAULT_MAX_TOTAL_SIZE
		}, function () {
			statusMessage.textContent = 'Reset to defaults';
			statusMessage.style.color = '#4CAF50';

			setTimeout(() => {
				statusMessage.textContent = '';
			}, 2000);
		});
	});
});
