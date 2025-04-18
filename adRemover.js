/**
 * Ad Remover for Page Download Extension
 * Removes ad elements from downloaded HTML based on common patterns
 */

// Simple EasyList parser focused only on element hiding rules
function parseEasyListForSelectors(easyListContent) {
	const lines = easyListContent.split('\n');
	const selectors = [];

	for (const line of lines) {
		try {
			// Skip comments and non-selector rules
			if (line.startsWith('!') || line.startsWith('[') || line.trim() === '') {
				continue;
			}

			// Handle standard element hiding rules (##)
			if (line.includes('##')) {
				const parts = line.split('##');
				if (parts.length === 2) {
					// Add generic rules (no domain specified)
					if (parts[0] === '') {
						selectors.push(parts[1]);
					}
				}
			}
		} catch (error) {
			// Skip problematic rules
			console.log('Error parsing rule:', error);
		}
	}

	return selectors;
}

// Remove ads from HTML content by adding a style tag
// Now accepts EasyList selectors parameter
function removeAdsFromHTML(html, easyListSelectors = []) {
	try {
		// Common ad selectors to hide
		const commonAdSelectors = [
			// Ad containers
			'[class*="ad-container"]',
			'[class*="ad-wrapper"]',
			'[class*="adunit"]',
			'[class*="adsbox"]',
			'[id*="ad-container"]',
			// Ad networks
			'[class*="adsbygoogle"]',
			'[id*="div-gpt-ad"]',
			'[id*="google_ads"]',
			// Common patterns
			'.advertisement',
			'.sponsored-content',
			'.dfp-tag',
			'.banner-ads',
			'.ad-placement',
			// Iframes
			'iframe[src*="doubleclick.net"]',
			'iframe[src*="googlesyndication.com"]',
			'iframe[src*="ad-delivery"]'
		];

		// Combine EasyList selectors with our common selectors
		// Filter out any invalid selectors that might cause issues
		const allSelectors = [...new Set([...easyListSelectors, ...commonAdSelectors])];

		// Create a style tag to hide ads instead of removing them
		const adBlockingStyle = `
      <style>
      /* Hide ad elements - combined from EasyList and common patterns */
      ${allSelectors.join(',\n')} {
        display: none !important;
      }
      </style>
    `;

		// Insert our style tag before the closing head tag
		let modifiedHtml = html;
		if (html.includes('</head>')) {
			modifiedHtml = html.replace('</head>', `${adBlockingStyle}</head>`);
		}

		return modifiedHtml;
	} catch (error) {
		console.error('Error removing ads from HTML:', error);
		return html; // Return original HTML on error
	}
}

// Export functionality
self.AdRemover = {
	parseEasyListForSelectors,
	removeAdsFromHTML
};
