/**
 * Collects resources (CSS, JS, images, fonts, videos) from the current page.
 */
export async function collectResources() {
	const resourceMap = new Map();

	function addResource(url, type) {
		try {
			if (!url) return;

			// Skip data URLs for non-image types
			if (url.startsWith('data:') && type !== "image") return;

			// Remove quotes from URL if present (e.g., in CSS url())
			const cleanUrl = url.replace(/^['"](.*)['"]$/, '$1').trim();
			if (!cleanUrl) return; // Skip empty URLs after cleaning

			const absoluteUrl = new URL(cleanUrl, window.location.href).href;

			if (!resourceMap.has(absoluteUrl)) {
				let filename = cleanUrl.startsWith('data:')
					? `data-${type}-${resourceMap.size}.${getExtensionForDataType(type)}` // Generate filename for data URLs
					: absoluteUrl.split('/').pop().split('?')[0] || `resource-${resourceMap.size}`; // Basic filename extraction

				// Ensure filename has an extension if possible
				if (!filename.includes('.') && !cleanUrl.startsWith('data:')) {
					const guessedExt = getExtensionForUrl(absoluteUrl, type);
					if (guessedExt) {
						filename += guessedExt;
					}
				}

				resourceMap.set(absoluteUrl, {
					url: absoluteUrl,
					type: type,
					filename: filename
				});
				// console.log(`Added resource: ${type} - ${absoluteUrl} -> ${filename}`);
			}
		} catch (e) {
			console.warn(`Skipping invalid URL: ${url}`, e);
		}
	}

	function getExtensionForDataType(type) {
		switch (type) {
			case 'image': return 'png'; // Default for data URLs, could be improved
			case 'css': return 'css';
			case 'js': return 'js';
			default: return 'bin';
		}
	}

	function getExtensionForUrl(url, type) {
		const extMatch = url.match(/\.([a-zA-Z0-9]+)(?:$|\?|#)/);
		if (extMatch && extMatch[1]) {
			return `.${extMatch[1].toLowerCase()}`;
		}
		// Fallback based on type
		switch (type) {
			case 'css': return '.css';
			case 'js': return '.js';
			// Add more specific fallbacks if needed (e.g., for fonts based on common paths)
		}
		return null; // No extension found or guessed
	}


	// Process img tags (including srcset)
	document.querySelectorAll("img").forEach((img) => {
		if (img.src) {
			addResource(img.getAttribute("src"), "image");
		}
		if (img.srcset) {
			img.getAttribute("srcset").split(',').forEach(source => {
				const url = source.trim().split(' ')[0];
				addResource(url, "image");
			});
		}
	});

	// Process picture sources
	document.querySelectorAll("picture source").forEach((source) => {
		if (source.srcset) {
			source.getAttribute("srcset").split(',').forEach(s => {
				const url = s.trim().split(' ')[0];
				addResource(url, "image");
			});
		}
	});


	// Process stylesheets
	document.querySelectorAll("link[rel='stylesheet'][href]").forEach((linkEl) => {
		addResource(linkEl.getAttribute("href"), "css");
	});

	// Process scripts
	document.querySelectorAll("script[src]").forEach((scriptEl) => {
		addResource(scriptEl.getAttribute("src"), "js");
	});

	// Process videos and their sources/tracks
	document.querySelectorAll("video").forEach((videoEl) => {
		if (videoEl.src) {
			addResource(videoEl.getAttribute("src"), "video");
		}
		if (videoEl.poster) {
			addResource(videoEl.getAttribute("poster"), "image");
		}
		videoEl.querySelectorAll("source[src]").forEach((sourceEl) => {
			addResource(sourceEl.getAttribute("src"), "video");
		});
		videoEl.querySelectorAll("track[src]").forEach((trackEl) => {
			addResource(trackEl.getAttribute("src"), "text"); // Assuming tracks are text-based (VTT, SRT)
		});
	});

	// Process audio and their sources/tracks
	document.querySelectorAll("audio").forEach((audioEl) => {
		if (audioEl.src) {
			addResource(audioEl.getAttribute("src"), "audio");
		}
		audioEl.querySelectorAll("source[src]").forEach((sourceEl) => {
			addResource(sourceEl.getAttribute("src"), "audio");
		});
		audioEl.querySelectorAll("track[src]").forEach((trackEl) => {
			addResource(trackEl.getAttribute("src"), "text");
		});
	});


	// Extract resources from inline styles (background, background-image, list-style-image, border-image)
	document.querySelectorAll("[style]").forEach((el) => {
		const styleAttr = el.getAttribute("style");
		const regex = /(?:background|background-image|list-style-image|border-image)\s*:\s*.*?url\s*\(\s*(['"]?)([^"')]+)\1\s*\)/gi;
		let match;
		while ((match = regex.exec(styleAttr)) !== null) {
			addResource(match[2], "image"); // Assume images for now, could refine
		}
	});

	// Extract resources from <style> elements
	document.querySelectorAll("style").forEach((styleEl) => {
		const cssText = styleEl.textContent;
		// Regex for url() in various CSS properties
		const urlRegex = /url\s*\(\s*(['"]?)([^"')]+)\1\s*\)/gi;
		let match;
		while ((match = urlRegex.exec(cssText)) !== null) {
			const url = match[2];
			// Basic check for common resource types based on extension
			if (/\.(woff2?|ttf|otf|eot)($|\?|#)/i.test(url)) {
				addResource(url, "font");
			} else if (/\.(png|jpg|jpeg|gif|svg|webp)($|\?|#)/i.test(url)) {
				addResource(url, "image");
			}
			// Could add more types here if needed
		}

		// Specifically look for @font-face src
		const fontFaceRegex = /@font-face\s*\{[^}]*src\s*:\s*([^;}]+)[;}]/gi;
		const fontUrlRegex = /url\s*\(\s*(['"]?)([^"')]+)\1\s*\)/g; // Reusable regex for url()
		let fontFaceMatch;
		while ((fontFaceMatch = fontFaceRegex.exec(cssText)) !== null) {
			const srcValue = fontFaceMatch[1];
			let fontUrlMatch;
			// Reset lastIndex for the reusable regex
			fontUrlRegex.lastIndex = 0;
			while ((fontUrlMatch = fontUrlRegex.exec(srcValue)) !== null) {
				addResource(fontUrlMatch[2], "font");
			}
		}
	});

	// Process fonts explicitly linked (preload, or by extension)
	document.querySelectorAll("link[href]").forEach((linkEl) => {
		const href = linkEl.getAttribute("href");
		const rel = linkEl.getAttribute("rel");
		const as = linkEl.getAttribute("as");

		if (href) {
			if (rel === 'preload' && as === 'font') {
				addResource(href, "font");
			} else if (/\.(woff2?|ttf|otf|eot)($|\?|#)/i.test(href)) {
				// Catch fonts linked directly without preload/as=font
				addResource(href, "font");
			}
		}
	});

	// Process iframes
	document.querySelectorAll("iframe[src]").forEach((iframeEl) => {
		addResource(iframeEl.getAttribute("src"), "document"); // Treat iframe src as a document
	});

	// Process embeds and objects
	document.querySelectorAll("embed[src]").forEach((embedEl) => {
		addResource(embedEl.getAttribute("src"), "embed"); // Generic embed type
	});
	document.querySelectorAll("object[data]").forEach((objectEl) => {
		addResource(objectEl.getAttribute("data"), "object"); // Generic object type
	});


	const resources = [...resourceMap.values()];
	console.log(`Resource collector found ${resources.length} unique resources.`);
	return resources;
}
