import JSZip from 'jszip';

export async function processPageData(data, sender) {
	const { domain, html, resources, url } = data;
	const tabId = sender.tab.id;

	const zip = new JSZip();
	const domainFolder = zip.folder(domain);

	// Add HTML file to the ZIP
	domainFolder.file('index.html', html);

	// Process resources (simplified for brevity)
	for (const resource of resources) {
		try {
			const response = await fetch(resource.url);
			const blob = await response.blob();
			domainFolder.file(resource.filename, blob);
		} catch (error) {
			console.error(`Failed to fetch resource: ${resource.url}`, error);
		}
	}

	// Generate ZIP file
	const zipBlob = await zip.generateAsync({ type: 'blob' });
	const urlObject = URL.createObjectURL(zipBlob);

	// Trigger download
	chrome.downloads.download({
		url: urlObject,
		filename: `${domain}.zip`,
		saveAs: true,
	});
}
