const { getToastElements } = require('./toastUI');

/**
 * Show the toast notification
 */
function showToast() {
	const { toast, progressFill, statusElement } = getToastElements();
	if (toast) {
		// Reset file status data when starting a new download
		document.getElementById('success-list').innerHTML = '';
		document.getElementById('skipped-list').innerHTML = '';
		document.getElementById('failed-list').innerHTML = '';

		document.getElementById('success-files').style.display = 'none';
		document.getElementById('skipped-files').style.display = 'none';
		document.getElementById('failed-files').style.display = 'none';
		document.getElementById('file-status-container').style.display = 'none';

		statusElement.textContent = 'Downloading page: 0%';
		progressFill.style.width = '0%';
		progressFill.style.backgroundColor = '#4688F1';

		toast.style.display = 'flex';
		toast.style.opacity = '1';
	}
}

/**
 * Hide the toast notification
 */
function hideToast() {
	const { toast } = getToastElements();
	if (toast) {
		toast.style.opacity = '0';
		setTimeout(() => {
			toast.style.display = 'none';
		}, 300);
	}
}

/**
 * Update the toast progress
 */
function updateToast(percentage) {
	const { toast, progressFill, statusElement } = getToastElements();
	if (toast) {
		statusElement.textContent = `Downloading page: ${percentage}%`;
		progressFill.style.width = `${percentage}%`;
	}
}

/**
 * Mark the download as complete
 */
function completeToast(filename) {
	const { toast, progressFill, statusElement } = getToastElements();
	if (toast) {
		statusElement.textContent = `Download complete: ${filename}`;
		progressFill.style.width = '100%';
		progressFill.style.backgroundColor = '#4CAF50';

		// Show file status section if we have any file statuses
		const fileContainer = document.getElementById('file-status-container');
		if (fileContainer && (
			document.getElementById('success-list').children.length > 0 ||
			document.getElementById('skipped-list').children.length > 0 ||
			document.getElementById('failed-list').children.length > 0
		)) {
			fileContainer.style.display = 'block';
		}

		// Don't auto-hide toast anymore - user must close manually
	}
}

/**
 * Add file status to the toast
 */
function addFileStatus(url, status, reason) {
	const toast = document.getElementById('page-download-toast');
	if (!toast) return;

	const listId = `${status}-list`;
	const list = document.getElementById(listId);
	if (!list) return;

	// Make sure the category container is visible
	document.getElementById(`${status}-files`).style.display = 'block';
	document.getElementById('file-status-container').style.display = 'block';

	// Create list item for the file
	const item = document.createElement('li');
	item.style.cssText = `
    margin-bottom: 3px;
    display: flex;
    align-items: flex-start;
  `;

	// Status icon
	const icon = document.createElement('span');
	icon.style.cssText = `
    margin-right: 5px;
    font-weight: bold;
  `;

	// Get filename from URL first
	const filename = url.split('/').pop().split('?')[0];
	let displayName = filename.length > 30 ? filename.substring(0, 27) + '...' : filename;

	// Create fileInfo element
	const fileInfo = document.createElement('div');
	fileInfo.style.wordBreak = 'break-word';

	if (status === 'success') {
		icon.innerHTML = '✓';
		icon.setAttribute('aria-hidden', 'true');
		icon.style.color = '#4CAF50';

		const srSpan = document.createElement('span');
		srSpan.textContent = 'Success: ';
		srSpan.className = 'sr-only';

		const titleSpan = document.createElement('span');
		titleSpan.setAttribute('title', url);
		titleSpan.textContent = displayName;

		fileInfo.appendChild(srSpan);
		fileInfo.appendChild(titleSpan);
	} else if (status === 'skipped') {
		icon.innerHTML = '⚠️';
		icon.setAttribute('aria-hidden', 'true');
		icon.style.color = '#FFC107';

		const srSpan = document.createElement('span');
		srSpan.textContent = 'Skipped: ';
		srSpan.className = 'sr-only';

		const titleSpan = document.createElement('span');
		titleSpan.setAttribute('title', url);
		titleSpan.textContent = displayName;

		fileInfo.appendChild(srSpan);
		fileInfo.appendChild(titleSpan);
	} else {
		icon.innerHTML = '✗';
		icon.setAttribute('aria-hidden', 'true');
		icon.style.color = '#F44336';

		const srSpan = document.createElement('span');
		srSpan.textContent = 'Failed: ';
		srSpan.className = 'sr-only';

		const titleSpan = document.createElement('span');
		titleSpan.setAttribute('title', url);
		titleSpan.textContent = displayName;

		fileInfo.appendChild(srSpan);
		fileInfo.appendChild(titleSpan);
	}

	// Add reason if provided
	if (reason) {
		fileInfo.appendChild(document.createElement('br'));
		const small = document.createElement('small');
		small.textContent = reason;
		fileInfo.appendChild(small);
	}

	item.appendChild(icon);
	item.appendChild(fileInfo);
	list.appendChild(item);
}

module.exports = {
	showToast,
	hideToast,
	updateToast,
	completeToast,
	addFileStatus
};
