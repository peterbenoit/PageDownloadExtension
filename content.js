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

				const absoluteUrl = new URL(url, window.location.href).href;

				if (!resourceMap.has(absoluteUrl)) {
					resourceMap.set(absoluteUrl, {
						url: absoluteUrl,
						type: type,
						filename: url.startsWith('data:')
							? `data-image-${resourceMap.size}.png`
							: absoluteUrl.split('/').pop().split('?')[0]
					});
				}
			} catch (e) {
				console.warn(`Skipping invalid URL: ${url}`, e);
			}
		}

		document.querySelectorAll("img[src]").forEach((img) => {
			addResource(img.getAttribute("src"), "image");
		});

		document.querySelectorAll("link[rel='stylesheet'][href]").forEach((linkEl) => {
			addResource(linkEl.getAttribute("href"), "css");
		});

		document.querySelectorAll("script[src]").forEach((scriptEl) => {
			addResource(scriptEl.getAttribute("src"), "js");
		});

		document.querySelectorAll("link[rel='preload'][as='font'][href]").forEach((fontEl) => {
			addResource(fontEl.getAttribute("href"), "font");
		});

		document.querySelectorAll("video source[src]").forEach((sourceEl) => {
			addResource(sourceEl.getAttribute("src"), "video");
		});

		document.querySelectorAll("[style]").forEach((el) => {
			const styleAttr = el.getAttribute("style");
			const regex = /url\(["']?([^"')]+)["']?\)/g;
			let match;
			while ((match = regex.exec(styleAttr)) !== null) {
				addResource(match[1], "image");
			}
		});

		document.querySelectorAll("style").forEach((styleEl) => {
			const cssText = styleEl.innerText;
			const regex = /url\(["']?([^"')]+)["']?\)/g;
			let match;
			while ((match = regex.exec(cssText)) !== null) {
				addResource(match[1], "image");
			}
		});

		const resources = [...resourceMap.values()];

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
