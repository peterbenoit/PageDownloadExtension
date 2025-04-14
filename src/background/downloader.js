/**
 * Downloader module for handling file downloads
 */
import { logDebug } from './logger';
import { markFileCompleted, markFileFailed } from './fileStatus';

/**
 * Download a file from a string or blob
 * @param {string} filename - Name to save the file as
 * @param {string|Blob} content - Content to download
 * @param {string} [contentType='text/plain'] - MIME type for the content
 * @returns {Promise<string>} Path to the downloaded file
 */
export const downloadFile = async (filename, content, contentType = 'text/plain') => {
	try {
		logDebug(`Downloading file: ${filename}`);

		let blob;
		if (content instanceof Blob) {
			blob = content;
		} else {
			blob = new Blob([content], { type: contentType });
		}

		const url = URL.createObjectURL(blob);

		const downloadId = await chrome.downloads.download({
			url,
			filename,
			saveAs: false
		});

		// Track download completion
		return new Promise((resolve, reject) => {
			const downloadListener = (delta) => {
				if (delta.id === downloadId && delta.state) {
					if (delta.state.current === 'complete') {
						chrome.downloads.onChanged.removeListener(downloadListener);
						URL.revokeObjectURL(url);
						logDebug(`Downloaded file successfully: ${filename}`);
						resolve(filename);
					} else if (delta.state.current === 'interrupted') {
						chrome.downloads.onChanged.removeListener(downloadListener);
						URL.revokeObjectURL(url);
						const error = new Error(`Download interrupted: ${filename}`);
						logDebug(error.message);
						reject(error);
					}
				}
			};

			chrome.downloads.onChanged.addListener(downloadListener);
		});

	} catch (error) {
		logDebug(`Error downloading file ${filename}:`, error);
		throw error;
	}
};

/**
 * Download a resource from a URL
 * @param {string} url - URL of the resource
 * @param {string} localPath - Local path to save the resource
 * @returns {Promise<string>} Path to the downloaded file
 */
export const downloadResource = async (url, localPath) => {
	try {
		logDebug(`Downloading resource: ${url} to ${localPath}`);

		const response = await fetch(url, {
			method: 'GET',
			credentials: 'include'
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch resource: ${response.status} ${response.statusText}`);
		}

		const blob = await response.blob();
		const downloadedPath = await downloadFile(localPath, blob, blob.type);

		markFileCompleted(url, localPath);
		return downloadedPath;

	} catch (error) {
		logDebug(`Error downloading resource ${url}:`, error);
		markFileFailed(url, error);
		throw error;
	}
};
