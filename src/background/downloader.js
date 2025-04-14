/**
 * Downloader module for handling file downloads
 */
import { markFileCompleted, markFileFailed } from './fileStatus';
import { log } from './utils/logger.js';

/**
 * Download a file from a string or blob
 * @param {string} filename - Name to save the file as
 * @param {string|Blob} content - Content to download
 * @param {string} [contentType='text/plain'] - MIME type for the content
 * @returns {Promise<string>} Path to the downloaded file
 */
export const downloadFile = async (filename, content, contentType = 'text/plain') => {
	try {
		log('debug', `Downloading file: ${filename}`);

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
						log('debug', `Downloaded file successfully: ${filename}`);
						resolve(filename);
					} else if (delta.state.current === 'interrupted') {
						chrome.downloads.onChanged.removeListener(downloadListener);
						URL.revokeObjectURL(url);
						const error = new Error(`Download interrupted: ${filename}`);
						log('debug', error.message);
						reject(error);
					}
				}
			};

			chrome.downloads.onChanged.addListener(downloadListener);
		});

	} catch (error) {
		log('debug', `Error downloading file ${filename}:`, error);
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
		log('debug', `Downloading resource: ${url} to ${localPath}`);

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
		log('debug', `Error downloading resource ${url}:`, error);
		markFileFailed(url, error);
		throw error;
	}
};

/**
 * Converts a Blob object to a data URL.
 * @param {Blob} blob - The Blob to convert.
 * @returns {Promise<string>} A promise that resolves with the data URL.
 */
function blobToDataURL(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => resolve(e.target.result);
		reader.onerror = (e) => reject(reader.error);
		reader.readAsDataURL(blob);
	});
}

/**
 * Generates a ZIP file from a JSZip instance and initiates download.
 * @param {JSZip} zip - The JSZip instance containing the files.
 * @param {string} filename - The desired filename for the downloaded zip file.
 */
export async function downloadZip(zip, filename) {
	try {
		log('info', `Generating zip blob for ${filename}...`);
		const blob = await zip.generateAsync({
			type: 'blob',
			compression: 'DEFLATE',
			compressionOptions: {
				level: 6 // Balance between speed and compression
			}
		});
		log('info', `Zip blob generated (${(blob.size / 1024).toFixed(1)} KB). Converting to data URL...`);

		const dataUrl = await blobToDataURL(blob);
		log('info', 'Data URL created. Initiating download...');

		// Use chrome.downloads API
		chrome.downloads.download({
			url: dataUrl,
			filename: filename,
			saveAs: true // Prompt user for save location
		}, (downloadId) => {
			if (chrome.runtime.lastError) {
				log('error', `Download initiation failed: ${chrome.runtime.lastError.message}`);
				// Optionally send an error message back to the content script
				// sendMessageToActiveTab({ type: 'DOWNLOAD_ERROR', message: `Download failed: ${chrome.runtime.lastError.message}` });
			} else {
				log('info', `Download started with ID: ${downloadId}`);
			}
		});

	} catch (error) {
		log('error', `Error generating or downloading zip file ${filename}: ${error.message}`, error);
		// Optionally send an error message back to the content script
		// sendMessageToActiveTab({ type: 'DOWNLOAD_ERROR', message: `Failed to create zip: ${error.message}` });
		throw error; // Re-throw to be caught by the caller in pageProcessor
	}
}
