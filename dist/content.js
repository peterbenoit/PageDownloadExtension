/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 2190:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const {
  createToastElement
} = __webpack_require__(2783);
const {
  showToast,
  hideToast,
  updateToast,
  completeToast,
  addFileStatus
} = __webpack_require__(6596);
const {
  cleanupExtensionElements,
  collectPageResources
} = __webpack_require__(4761);

// Set up message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DOWNLOAD_PROGRESS') {
    updateToast(message.percentage);
  } else if (message.type === 'DOWNLOAD_COMPLETE') {
    completeToast(message.filename);
  } else if (message.type === 'DOWNLOAD_STARTED') {
    showToast();
  } else if (message.type === 'FILE_STATUS') {
    // New message type for file status
    addFileStatus(message.url, message.status, message.reason);
  } else if (message.type === 'LOG') {
    // Log background messages in the page console
    if (message.level && console[message.level]) {
      console[message.level](`[Background] ${message.message}`);
    } else {
      console.log(`[Background] ${message.message}`);
    }
  }
});

// Initialize toast
createToastElement();

// Collect and send resources
collectPageResources();

/***/ }),

/***/ 2783:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// DOM elements for the toast
let toast, progressBar, progressFill, fileStatusContainer, statusElement;

/**
 * Creates the toast notification UI
 */
function createToastElement() {
  // Remove any existing toasts first
  const existingToast = document.getElementById('page-download-toast');
  if (existingToast) {
    existingToast.remove();
  }
  toast = document.createElement('div');
  toast.id = 'page-download-toast';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('data-extension-ui', 'page-download-extension');

  // Style the toast
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: rgba(42, 42, 46, 0.97);
    color: #f8f8f8;
    padding: 16px;
    border-radius: 8px;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    display: none;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    transition: all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
    max-width: 400px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(255, 255, 255, 0.1);
  `;

  // sr-only class for screen readers
  const sronly = document.createElement('style');
  sronly.textContent = `
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
  `;
  document.head.appendChild(sronly);

  // Create header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    padding-bottom: 12px;
  `;

  // Title
  const title = document.createElement('div');
  title.textContent = 'Page Download';
  title.style.cssText = `
    font-weight: 600;
    font-size: 15px;
    letter-spacing: 0.3px;
  `;

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = `
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    font-size: 28px;
    font-weight: 300;
    cursor: pointer;
    padding: 0 8px;
    line-height: 0.8;
    margin-right: -6px;
    margin-top: -6px;
    transition: color 0.2s ease;
  `;

  // Add hover effects to close button
  closeBtn.onmouseover = () => {
    closeBtn.style.color = 'white';
  };
  closeBtn.onmouseout = () => {
    closeBtn.style.color = 'rgba(255, 255, 255, 0.8)';
  };

  // Import here to avoid circular dependency
  const {
    hideToast
  } = __webpack_require__(6596);
  closeBtn.onclick = hideToast;
  header.appendChild(title);
  header.appendChild(closeBtn);
  toast.appendChild(header);

  // Status message
  statusElement = document.createElement('div');
  statusElement.id = 'page-download-status';
  statusElement.textContent = 'Downloading page: 0%';
  statusElement.style.cssText = `
    font-size: 11px;
  `;
  toast.appendChild(statusElement);

  // Progress bar
  progressBar = document.createElement('div');
  progressBar.id = 'page-download-progress-bar';
  progressBar.style.cssText = `
    width: 100%;
    background-color: rgba(255, 255, 255, 0.1);
    height: 6px;
    margin-top: 10px;
    margin-bottom: 14px;
    border-radius: 6px;
    overflow: hidden;
  `;

  // Progress fill
  progressFill = document.createElement('div');
  progressFill.id = 'page-download-progress-fill';
  progressFill.style.cssText = `
    height: 100%;
    background-color: #4688F1;
    width: 0%;
    transition: width 0.3s ease;
  `;
  progressBar.appendChild(progressFill);
  toast.appendChild(progressBar);

  // File status container with scrolling
  fileStatusContainer = document.createElement('div');
  fileStatusContainer.id = 'file-status-container';
  fileStatusContainer.style.cssText = `
    max-height: 250px;
    overflow-y: auto;
    margin-top: 12px;
    font-size: 11px;
    display: none;
    padding-right: 5px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  `;

  // Create sections for each file status category
  const categories = ['success', 'skipped', 'failed'];
  categories.forEach(category => {
    const section = document.createElement('div');
    section.id = `${category}-files`;
    section.style.cssText = `
      margin-bottom: 10px;
      display: none;
    `;
    const heading = document.createElement('div');
    heading.style.cssText = `
      font-weight: bold;
      margin-bottom: 5px;
      color: ${category === 'success' ? '#4CAF50' : category === 'skipped' ? '#FFC107' : '#F44336'};
    `;
    heading.textContent = category === 'success' ? 'Downloaded Files:' : category === 'skipped' ? 'Skipped Files:' : 'Failed Files:';
    const list = document.createElement('ul');
    list.id = `${category}-list`;
    list.style.cssText = `
      list-style-type: none;
      padding-left: 0;
      margin: 0;
    `;
    section.appendChild(heading);
    section.appendChild(list);
    fileStatusContainer.appendChild(section);
  });
  toast.appendChild(fileStatusContainer);
  document.body.appendChild(toast);

  // Keyboard navigation and accessibility
  const focusableElements = toast.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  // Trap focus in modal
  toast.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    } else if (e.key === 'Escape') {
      const {
        hideToast
      } = __webpack_require__(6596);
      hideToast();
    }
  });
  return toast;
}

/**
 * Get the toast DOM elements
 */
function getToastElements() {
  return {
    toast: document.getElementById('page-download-toast'),
    progressBar: document.getElementById('page-download-progress-bar'),
    progressFill: document.getElementById('page-download-progress-fill'),
    fileStatusContainer: document.getElementById('file-status-container'),
    statusElement: document.getElementById('page-download-status')
  };
}

/**
 * Hide the toast notification
 */
function hideToast() {
  const {
    toast
  } = getToastElements();
  if (toast) {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
}

// Export as CommonJS module
module.exports = {
  createToastElement,
  getToastElements,
  hideToast
};

/***/ }),

/***/ 4761:
/***/ ((module) => {

// Collected resources to be sent to background script
const collectedResources = [];

/**
 * Remove extension UI elements from the HTML being downloaded
 */
function cleanupExtensionElements(html) {
  // Create a DOM parser to work with the HTML string
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove extension toast notification
  const toast = doc.getElementById('page-download-toast');
  if (toast) {
    toast.remove();
  }

  // Remove any other extension elements by their IDs or classes
  const extensionElements = doc.querySelectorAll('#page-download-progress-bar, ' + '#page-download-progress-fill, ' + '#page-download-status, ' + '#file-status-container, ' + '[data-extension-ui="page-download-extension"]');
  extensionElements.forEach(el => el.remove());

  // Return the cleaned HTML
  return doc.documentElement.outerHTML;
}

/**
 * Add a resource to the collection
 */
function addResource(url, type) {
  try {
    if (!url) return;
    if (url.startsWith('data:') && type !== "image") return;

    // Remove quotes from URL if present
    const cleanUrl = url.replace(/^['"](.*)['"]$/, '$1');

    // Convert to absolute URL
    const absoluteUrl = new URL(cleanUrl, window.location.href).href;

    // Check if this resource is already in the collection
    const exists = collectedResources.some(res => res.url === absoluteUrl);
    if (!exists) {
      collectedResources.push({
        url: absoluteUrl,
        type: type,
        filename: cleanUrl.startsWith('data:') ? `data-image-${collectedResources.length}.png` : absoluteUrl.split('/').pop().split('?')[0]
      });
    }
  } catch (e) {
    console.warn(`Skipping invalid URL: ${url}`, e);
  }
}

/**
 * Collect all resources from the page
 */
function collectAllResources() {
  // Process img tags
  document.querySelectorAll("img[src]").forEach(img => {
    addResource(img.getAttribute("src"), "image");
  });

  // Process stylesheets
  document.querySelectorAll("link[rel='stylesheet'][href]").forEach(linkEl => {
    addResource(linkEl.getAttribute("href"), "css");
  });

  // Process scripts
  document.querySelectorAll("script[src]").forEach(scriptEl => {
    addResource(scriptEl.getAttribute("src"), "js");
  });

  // Process fonts
  document.querySelectorAll("link[rel='preload'][as='font'][href]").forEach(fontEl => {
    addResource(fontEl.getAttribute("href"), "font");
  });

  // Process videos
  document.querySelectorAll("video source[src]").forEach(sourceEl => {
    addResource(sourceEl.getAttribute("src"), "video");
  });

  // Extract background images from inline styles
  document.querySelectorAll("[style]").forEach(el => {
    const styleAttr = el.getAttribute("style");
    // More flexible regex that handles spaces and various quoting styles
    const regex = /url\s*\(\s*(['"]?)([^"')]+)\1\s*\)/gi;
    let match;
    while ((match = regex.exec(styleAttr)) !== null) {
      addResource(match[2], "image");
    }
  });

  // Extract background images from style elements
  document.querySelectorAll("style").forEach(styleEl => {
    const cssText = styleEl.textContent;
    const regex = /url\s*\(\s*(['"]?)([^"')]+)\1\s*\)/gi;
    let match;
    while ((match = regex.exec(cssText)) !== null) {
      addResource(match[2], "image");
    }
  });

  // Process fonts - expanded methods
  // 1. Standard preloaded fonts
  document.querySelectorAll("link[rel='preload'][as='font'][href]").forEach(fontEl => {
    addResource(fontEl.getAttribute("href"), "font");
  });

  // 2. Font files by extension
  document.querySelectorAll("link[href]").forEach(linkEl => {
    const href = linkEl.getAttribute("href");
    if (href && /\.(woff2?|ttf|otf|eot)($|\?)/.test(href)) {
      addResource(href, "font");
    }
  });

  // 3. Check for font URLs in stylesheets
  document.querySelectorAll("style").forEach(styleEl => {
    const cssText = styleEl.textContent;
    const fontRegex = /url\s*\(\s*['"]?([^'")]+\.(woff2?|ttf|otf|eot))['"]?\s*\)/gi;
    let match;
    while ((match = fontRegex.exec(cssText)) !== null) {
      addResource(match[1], "font");
    }
  });
  return collectedResources;
}

/**
 * Collect resources and send them to the background script
 */
function collectPageResources() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getPageContent") {
      try {
        const domainRaw = window.location.hostname;
        const domain = domainRaw.replace(/^www\./, '');

        // Clean the HTML before sending it
        const html = cleanupExtensionElements(document.documentElement.outerHTML);

        // Process resources
        collectAllResources();

        // Log for debugging
        console.log("Resources found:", collectedResources);
        chrome.runtime.sendMessage({
          type: "PAGE_DATA",
          data: {
            domain: domain,
            html: html,
            resources: collectedResources,
            url: window.location.href
          }
        });
      } catch (err) {
        console.error("Error in content script:", err);
      }
    }
  });

  // Execute immediately for popup-based triggers
  chrome.runtime.sendMessage({
    type: "PAGE_READY"
  });
}
module.exports = {
  cleanupExtensionElements,
  collectPageResources,
  addResource
};

/***/ }),

/***/ 6596:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const {
  getToastElements
} = __webpack_require__(2783);

/**
 * Show the toast notification
 */
function showToast() {
  const {
    toast,
    progressFill,
    statusElement
  } = getToastElements();
  if (toast) {
    // Reset file status data when starting a new download
    document.getElementById('success-list').innerHTML = '';
    document.getElementById('skipped-list').innerHTML = '';
    document.getElementById('failed-list').innerHTML = '';
    document.getElementById('success-files').style.display = 'none';
    document.getElementById('skipped-files').style.display = 'none';
    document.getElementById('failed-files').style.display = 'none';
    document.getElementById('file-status-container').style.display = 'none';
    statusElement.textContent = 'Downloading page: 0%';
    progressFill.style.width = '0%';
    progressFill.style.backgroundColor = '#4688F1';
    toast.style.display = 'flex';
    toast.style.opacity = '1';
  }
}

/**
 * Hide the toast notification
 */
function hideToast() {
  const {
    toast
  } = getToastElements();
  if (toast) {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 300);
  }
}

/**
 * Update the toast progress
 */
function updateToast(percentage) {
  const {
    toast,
    progressFill,
    statusElement
  } = getToastElements();
  if (toast) {
    statusElement.textContent = `Downloading page: ${percentage}%`;
    progressFill.style.width = `${percentage}%`;
  }
}

/**
 * Mark the download as complete
 */
function completeToast(filename) {
  const {
    toast,
    progressFill,
    statusElement
  } = getToastElements();
  if (toast) {
    statusElement.textContent = `Download complete: ${filename}`;
    progressFill.style.width = '100%';
    progressFill.style.backgroundColor = '#4CAF50';

    // Show file status section if we have any file statuses
    const fileContainer = document.getElementById('file-status-container');
    if (fileContainer && (document.getElementById('success-list').children.length > 0 || document.getElementById('skipped-list').children.length > 0 || document.getElementById('failed-list').children.length > 0)) {
      fileContainer.style.display = 'block';
    }

    // Don't auto-hide toast anymore - user must close manually
  }
}

/**
 * Add file status to the toast
 */
function addFileStatus(url, status, reason) {
  const toast = document.getElementById('page-download-toast');
  if (!toast) return;
  const listId = `${status}-list`;
  const list = document.getElementById(listId);
  if (!list) return;

  // Make sure the category container is visible
  document.getElementById(`${status}-files`).style.display = 'block';
  document.getElementById('file-status-container').style.display = 'block';

  // Create list item for the file
  const item = document.createElement('li');
  item.style.cssText = `
    margin-bottom: 3px;
    display: flex;
    align-items: flex-start;
  `;

  // Status icon
  const icon = document.createElement('span');
  icon.style.cssText = `
    margin-right: 5px;
    font-weight: bold;
  `;

  // Get filename from URL first
  const filename = url.split('/').pop().split('?')[0];
  let displayName = filename.length > 30 ? filename.substring(0, 27) + '...' : filename;

  // Create fileInfo element
  const fileInfo = document.createElement('div');
  fileInfo.style.wordBreak = 'break-word';
  if (status === 'success') {
    icon.innerHTML = '✓';
    icon.setAttribute('aria-hidden', 'true');
    icon.style.color = '#4CAF50';
    const srSpan = document.createElement('span');
    srSpan.textContent = 'Success: ';
    srSpan.className = 'sr-only';
    const titleSpan = document.createElement('span');
    titleSpan.setAttribute('title', url);
    titleSpan.textContent = displayName;
    fileInfo.appendChild(srSpan);
    fileInfo.appendChild(titleSpan);
  } else if (status === 'skipped') {
    icon.innerHTML = '⚠️';
    icon.setAttribute('aria-hidden', 'true');
    icon.style.color = '#FFC107';
    const srSpan = document.createElement('span');
    srSpan.textContent = 'Skipped: ';
    srSpan.className = 'sr-only';
    const titleSpan = document.createElement('span');
    titleSpan.setAttribute('title', url);
    titleSpan.textContent = displayName;
    fileInfo.appendChild(srSpan);
    fileInfo.appendChild(titleSpan);
  } else {
    icon.innerHTML = '✗';
    icon.setAttribute('aria-hidden', 'true');
    icon.style.color = '#F44336';
    const srSpan = document.createElement('span');
    srSpan.textContent = 'Failed: ';
    srSpan.className = 'sr-only';
    const titleSpan = document.createElement('span');
    titleSpan.setAttribute('title', url);
    titleSpan.textContent = displayName;
    fileInfo.appendChild(srSpan);
    fileInfo.appendChild(titleSpan);
  }

  // Add reason if provided
  if (reason) {
    fileInfo.appendChild(document.createElement('br'));
    const small = document.createElement('small');
    small.textContent = reason;
    fileInfo.appendChild(small);
  }
  item.appendChild(icon);
  item.appendChild(fileInfo);
  list.appendChild(item);
}
module.exports = {
  showToast,
  hideToast,
  updateToast,
  completeToast,
  addFileStatus
};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
// This is a wrapper file for the content script
// It serves as an entry point for webpack without using ES modules syntax

(function () {
  // Require all needed modules
  __webpack_require__(2190);
})();
/******/ })()
;
//# sourceMappingURL=content.js.map