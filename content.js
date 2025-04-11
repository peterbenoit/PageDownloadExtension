(function () {
	function createToastElement() {
		const toast = document.createElement('div');
		toast.id = 'page-download-toast';
		toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            display: none;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            transition: opacity 0.3s ease-in-out;
        `;

		const progressBar = document.createElement('div');
		progressBar.id = 'page-download-progress-bar';
		progressBar.style.cssText = `
            width: 100%;
            background-color: #444;
            height: 5px;
            margin-top: 8px;
            border-radius: 5px;
            overflow: hidden;
        `;

		const progressFill = document.createElement('div');
		progressFill.id = 'page-download-progress-fill';
		progressFill.style.cssText = `
            height: 100%;
            background-color: #4688F1;
            width: 0%;
            transition: width 0.3s ease;
        `;

		progressBar.appendChild(progressFill);
		toast.appendChild(document.createTextNode('Downloading page: 0%'));
		toast.appendChild(progressBar);

		document.body.appendChild(toast);
		return toast;
	}

	createToastElement();

	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.type === 'DOWNLOAD_PROGRESS') {
			updateToast(message.percentage);
		} else if (message.type === 'DOWNLOAD_COMPLETE') {
			completeToast(message.filename);
		} else if (message.type === 'DOWNLOAD_STARTED') {
			showToast();
		}
	});

	function showToast() {
		const toast = document.getElementById('page-download-toast');
		if (toast) {
			toast.style.display = 'block';
			toast.style.opacity = '1';
		}
	}

	function updateToast(percentage) {
		const toast = document.getElementById('page-download-toast');
		if (toast) {
			toast.firstChild.nodeValue = `Downloading page: ${percentage}%`;
			const progressFill = document.getElementById('page-download-progress-fill');
			if (progressFill) {
				progressFill.style.width = `${percentage}%`;
			}
		}
	}

	function completeToast(filename) {
		const toast = document.getElementById('page-download-toast');
		if (toast) {
			toast.firstChild.nodeValue = `Download complete: ${filename}`;
			const progressFill = document.getElementById('page-download-progress-fill');
			if (progressFill) {
				progressFill.style.width = '100%';
				progressFill.style.backgroundColor = '#4CAF50';
			}

			setTimeout(() => {
				toast.style.opacity = '0';
				setTimeout(() => {
					toast.style.display = 'none';
				}, 300);
			}, 3000);
		}
	}

	try {
		const domainRaw = window.location.hostname;
		const domain = domainRaw.replace(/^www\./, '');

		const html = document.documentElement.outerHTML;

		const resourceMap = new Map();

		function addResource(url, type) {
			try {
				if (!url) return;

				if (url.startsWith('data:') && type !== "image") return;

				// Remove quotes from URL if present
				const cleanUrl = url.replace(/^['"](.*)['"]$/, '$1');

				const absoluteUrl = new URL(cleanUrl, window.location.href).href;

				if (!resourceMap.has(absoluteUrl)) {
					resourceMap.set(absoluteUrl, {
						url: absoluteUrl,
						type: type,
						filename: cleanUrl.startsWith('data:')
							? `data-image-${resourceMap.size}.png`
							: absoluteUrl.split('/').pop().split('?')[0]
					});
				}
			} catch (e) {
				console.warn(`Skipping invalid URL: ${url}`, e);
			}
		}

		// Process img tags
		document.querySelectorAll("img[src]").forEach((img) => {
			addResource(img.getAttribute("src"), "image");
		});

		// Process stylesheets
		document.querySelectorAll("link[rel='stylesheet'][href]").forEach((linkEl) => {
			addResource(linkEl.getAttribute("href"), "css");
		});

		// Process scripts
		document.querySelectorAll("script[src]").forEach((scriptEl) => {
			addResource(scriptEl.getAttribute("src"), "js");
		});

		// Process fonts
		document.querySelectorAll("link[rel='preload'][as='font'][href]").forEach((fontEl) => {
			addResource(fontEl.getAttribute("href"), "font");
		});

		// Process videos
		document.querySelectorAll("video source[src]").forEach((sourceEl) => {
			addResource(sourceEl.getAttribute("src"), "video");
		});

		// IMPROVED: Extract background images from inline styles with more robust regex
		document.querySelectorAll("[style]").forEach((el) => {
			const styleAttr = el.getAttribute("style");
			// More flexible regex that handles spaces and various quoting styles
			const regex = /url\s*\(\s*(['"]?)([^"')]+)\1\s*\)/gi;
			let match;
			while ((match = regex.exec(styleAttr)) !== null) {
				addResource(match[2], "image");
			}
		});

		// IMPROVED: Extract background images from style elements
		document.querySelectorAll("style").forEach((styleEl) => {
			const cssText = styleEl.textContent; // Using textContent instead of innerText
			const regex = /url\s*\(\s*(['"]?)([^"')]+)\1\s*\)/gi;
			let match;
			while ((match = regex.exec(cssText)) !== null) {
				addResource(match[2], "image");
			}
		});

		const resources = [...resourceMap.values()];

		console.log("Resources found:", resources);
		console.log("HTML content:", html);
		console.log("Domain:", domain);
		console.log("Page URL:", window.location.href);
		console.log("Sending data to background script...");

		chrome.runtime.sendMessage({
			type: "PAGE_DATA",
			data: {
				domain: domain,
				html: html,
				resources: resources,
				url: window.location.href
			}
		});
	} catch (err) {
		console.error("Error in content script:", err);
	}
})();
