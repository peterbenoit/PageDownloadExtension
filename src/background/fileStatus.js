/**
 * File status module for tracking download statuses
 */
import { logDebug } from './logger';

// Track files that are currently being processed
let pendingFiles = {};
let completedFiles = {};
let failedFiles = {};

/**
 * Reset the file tracking state
 */
export const resetFileTracking = () => {
	pendingFiles = {};
	completedFiles = {};
	failedFiles = {};
	logDebug('File tracking reset');
};

/**
 * Add a file to the pending list
 * @param {string} url - URL of the file
 * @param {string} type - Type of resource
 */
export const addPendingFile = (url, type) => {
	pendingFiles[url] = { url, type, timestamp: Date.now() };
	logDebug(`Added pending file: ${url} (${type})`);
};

/**
 * Mark a file as completed
 * @param {string} url - URL of the file
 * @param {string} localPath - Local path where file was saved
 */
export const markFileCompleted = (url, localPath) => {
	if (pendingFiles[url]) {
		const fileInfo = {
			...pendingFiles[url],
			localPath,
			completedAt: Date.now()
		};
		completedFiles[url] = fileInfo;
		delete pendingFiles[url];
		logDebug(`Marked file as completed: ${url}`);
	}
};

/**
 * Mark a file as failed
 * @param {string} url - URL of the file
 * @param {Error} error - Error that occurred
 */
export const markFileFailed = (url, error) => {
	if (pendingFiles[url]) {
		const fileInfo = {
			...pendingFiles[url],
			error: error?.message || 'Unknown error',
			failedAt: Date.now()
		};
		failedFiles[url] = fileInfo;
		delete pendingFiles[url];
		logDebug(`Marked file as failed: ${url}`, error);
	}
};

/**
 * Get the current status summary
 * @returns {Object} Status object with counts of pending, completed and failed files
 */
export const getStatusSummary = () => {
	return {
		pending: Object.keys(pendingFiles).length,
		completed: Object.keys(completedFiles).length,
		failed: Object.keys(failedFiles).length,
		pendingFiles,
		completedFiles,
		failedFiles
	};
};
