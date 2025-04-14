/**
 * Manages the status of file downloads during the page saving process.
 */

let fileStatuses = {
	success: [],
	skipped: [],
	failed: [],
	totalSize: 0,
};

/**
 * Resets the file status tracking for a new download operation.
 */
export function initializeFileStatus() {
	fileStatuses = {
		success: [],
		skipped: [],
		failed: [],
		totalSize: 0,
	};
}

/**
 * Updates the status of a specific file.
 * @param {string} url - The original URL of the resource.
 * @param {'success' | 'skipped' | 'failed'} status - The download status.
 * @param {string | null} reason - The reason for skipped or failed status.
 * @param {number | null} size - The size of the file in bytes if successful.
 */
export function updateFileStatus(url, status, reason = null, size = null) {
	// Remove from other lists if it exists (e.g., if it was initially skipped then failed)
	['success', 'skipped', 'failed'].forEach(list => {
		const index = fileStatuses[list].findIndex(item => item.url === url);
		if (index > -1) {
			// Adjust total size if removing from success
			if (list === 'success' && fileStatuses[list][index].size) {
				fileStatuses.totalSize -= fileStatuses[list][index].size;
			}
			fileStatuses[list].splice(index, 1);
		}
	});

	const statusEntry = { url, reason, size };

	if (status === 'success') {
		fileStatuses.success.push(statusEntry);
		if (size) {
			fileStatuses.totalSize += size;
		}
	} else if (status === 'skipped') {
		fileStatuses.skipped.push(statusEntry);
	} else if (status === 'failed') {
		fileStatuses.failed.push(statusEntry);
	}
}

/**
 * Retrieves a summary of the current file download statuses.
 * @returns {{success: number, skipped: number, failed: number, totalSize: number}} Summary object.
 */
export function getFileStatusSummary() {
	return {
		success: fileStatuses.success.length,
		skipped: fileStatuses.skipped.length,
		failed: fileStatuses.failed.length,
		totalSize: fileStatuses.totalSize,
	};
}

/**
 * Retrieves the detailed list for a specific status.
 * @param {'success' | 'skipped' | 'failed'} statusType - The type of status list to retrieve.
 * @returns {Array<{url: string, reason: string|null, size: number|null}>} Array of status entries.
 */
export function getDetailedStatus(statusType) {
	return fileStatuses[statusType] || [];
}

// --- Compatibility functions (if needed by older code like downloader.js) ---
// These might be redundant if pageProcessor handles all status updates via updateFileStatus

export function addPendingFile(url, type) {
	// This function seems less relevant now as pageProcessor drives the status updates.
	// We could potentially use it to initialize entries, but updateFileStatus handles adding.
	// console.log(`[FileStatus] Pending: ${url} (${type})`);
}

export function markFileCompleted(url, localPath, size) {
	// Prefer updateFileStatus for consistency
	updateFileStatus(url, 'success', `Saved as ${localPath}`, size);
}

export function markFileFailed(url, error) {
	// Prefer updateFileStatus for consistency
	const reason = error instanceof Error ? error.message : String(error);
	updateFileStatus(url, 'failed', reason);
}
// --- End Compatibility functions ---
