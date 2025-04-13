/**
 * Modifies HTML to update resource paths and remove analytics
 */
function modifyHTML(html) {
	// Replace external CSS references with local paths
	html = html.replace(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi, function (match, url) {
		if (url.startsWith('http')) {
			// Extract filename from URL
			const filename = url.split('/').pop().split('?')[0];
			return match.replace(url, `css/${filename}`);
		}
		return match;
	});

	// Replace external JS references with local paths
	html = html.replace(/<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi, function (match, url) {
		// Skip analytics scripts
		if (url.includes('googletagmanager.com') || url.includes('clarity.ms')) {
			return '';
		}

		if (url.startsWith('http')) {
			// Extract filename from URL
			const filename = url.split('/').pop().split('?')[0];
			return match.replace(url, `js/${filename}`);
		}
		return match;
	});

	// Remove inline scripts that contain "gtag(" or "clarity("
	html = html.replace(/<script[^>]*>[\s\S]*?(gtag\(|clarity\()[\s\S]*?<\/script>/g, "");

	// Update background image paths in inline styles to point to the local images folder
	html = html.replace(/url\(["']?([^"')]+)["']?\)/g, function (match, p1) {
		// For relative URLs (not starting with http), extract the filename
		if (!p1.startsWith("http")) {
			let filename = p1.split("/").pop();
			return `url('images/${filename}')`;
		} else {
			// For absolute URLs, also extract filename and make reference local
			let filename = p1.split("/").pop().split("?")[0];
			return `url('images/${filename}')`;
		}
	});

	// Replace image src paths
	html = html.replace(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi, function (match, url) {
		// Skip data URLs
		if (url.startsWith('data:')) return match;

		// Extract filename from URL
		const filename = url.split('/').pop().split('?')[0];
		return match.replace(url, `images/${filename}`);
	});

	return html;
}

module.exports = {
	modifyHTML
};
