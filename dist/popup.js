/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 540:
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ 1113:
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ }),

/***/ 1354:
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ 1440:
/***/ ((module) => {

/**
 * Load settings from storage and populate form fields
 */
function loadSettings(elements) {
  const {
    maxResourceSizeInput,
    maxTotalSizeInput,
    downloadCssCheckbox,
    downloadJsCheckbox,
    downloadImagesCheckbox,
    downloadFontsCheckbox,
    downloadVideosCheckbox
  } = elements;

  // Load saved settings from storage
  chrome.storage.sync.get({
    maxResourceSize: 30,
    maxTotalSize: 120,
    downloadCss: true,
    downloadJs: true,
    downloadImages: true,
    downloadFonts: true,
    downloadVideos: true
  }, function (items) {
    maxResourceSizeInput.value = items.maxResourceSize;
    maxTotalSizeInput.value = items.maxTotalSize;
    downloadCssCheckbox.checked = items.downloadCss;
    downloadJsCheckbox.checked = items.downloadJs;
    downloadImagesCheckbox.checked = items.downloadImages;
    downloadFontsCheckbox.checked = items.downloadFonts;
    downloadVideosCheckbox.checked = items.downloadVideos;
  });
}

/**
 * Save settings to storage
 */
function saveSettings(elements) {
  const {
    maxResourceSizeInput,
    maxTotalSizeInput,
    downloadCssCheckbox,
    downloadJsCheckbox,
    downloadImagesCheckbox,
    downloadFontsCheckbox,
    downloadVideosCheckbox,
    statusMessage
  } = elements;

  // Validate inputs
  const maxResourceSize = parseInt(maxResourceSizeInput.value);
  const maxTotalSize = parseInt(maxTotalSizeInput.value);
  if (isNaN(maxResourceSize) || maxResourceSize < 1) {
    statusMessage.textContent = "Please enter a valid resource size.";
    return;
  }
  if (isNaN(maxTotalSize) || maxTotalSize < maxResourceSize) {
    statusMessage.textContent = "Total size must be larger than resource size.";
    return;
  }

  // Save the settings
  chrome.storage.sync.set({
    maxResourceSize: maxResourceSize,
    maxTotalSize: maxTotalSize,
    downloadCss: downloadCssCheckbox.checked,
    downloadJs: downloadJsCheckbox.checked,
    downloadImages: downloadImagesCheckbox.checked,
    downloadFonts: downloadFontsCheckbox.checked,
    downloadVideos: downloadVideosCheckbox.checked
  }, function () {
    // Update status to let user know options were saved
    statusMessage.textContent = "Settings saved.";

    // Clear the status message after 1.5 seconds
    setTimeout(function () {
      statusMessage.textContent = "";
    }, 1500);
  });
}
module.exports = {
  loadSettings,
  saveSettings
};

/***/ }),

/***/ 2157:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(8661);
const {
  loadSettings,
  saveSettings
} = __webpack_require__(1440);
document.addEventListener('DOMContentLoaded', function () {
  // DOM References
  const downloadButton = document.getElementById('downloadButton');
  const saveButton = document.getElementById('saveButton');
  const resetButton = document.getElementById('resetButton');
  const statusMessage = document.getElementById('statusMessage');
  const maxResourceSizeInput = document.getElementById('maxResourceSize');
  const maxTotalSizeInput = document.getElementById('maxTotalSize');
  const downloadCssCheckbox = document.getElementById('downloadCss');
  const downloadJsCheckbox = document.getElementById('downloadJs');
  const downloadImagesCheckbox = document.getElementById('downloadImages');
  const downloadFontsCheckbox = document.getElementById('downloadFonts');
  const downloadVideosCheckbox = document.getElementById('downloadVideos');

  // Load saved settings
  loadSettings({
    maxResourceSizeInput,
    maxTotalSizeInput,
    downloadCssCheckbox,
    downloadJsCheckbox,
    downloadImagesCheckbox,
    downloadFontsCheckbox,
    downloadVideosCheckbox
  });

  // Download button click handler
  downloadButton.addEventListener('click', function () {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "getPageContent"
      });
      window.close();
    });
  });

  // Save button click handler
  saveButton.addEventListener('click', function () {
    saveSettings({
      maxResourceSizeInput,
      maxTotalSizeInput,
      downloadCssCheckbox,
      downloadJsCheckbox,
      downloadImagesCheckbox,
      downloadFontsCheckbox,
      downloadVideosCheckbox,
      statusMessage
    });
  });

  // Reset button click handler
  resetButton.addEventListener('click', function () {
    // Reset to default values
    maxResourceSizeInput.value = 30;
    maxTotalSizeInput.value = 120;
    downloadCssCheckbox.checked = true;
    downloadJsCheckbox.checked = true;
    downloadImagesCheckbox.checked = true;
    downloadFontsCheckbox.checked = true;
    downloadVideosCheckbox.checked = true;

    // Save the reset values
    saveSettings({
      maxResourceSizeInput,
      maxTotalSizeInput,
      downloadCssCheckbox,
      downloadJsCheckbox,
      downloadImagesCheckbox,
      downloadFontsCheckbox,
      downloadVideosCheckbox,
      statusMessage
    });
  });
});

/***/ }),

/***/ 5056:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ 5072:
/***/ ((module) => {

"use strict";


var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ 6314:
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ 7659:
/***/ ((module) => {

"use strict";


var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ 7825:
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ 8661:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5072);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7825);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7659);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5056);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(540);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(1113);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_popup_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(9022);

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_popup_css__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A, options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_popup_css__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A && _node_modules_css_loader_dist_cjs_js_popup_css__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A.locals ? _node_modules_css_loader_dist_cjs_js_popup_css__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A.locals : undefined);


/***/ }),

/***/ 9022:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1354);
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `:root {
	--bg-primary: #2d3647;
	/* Darker variant of #697e9b */
	--bg-secondary: #3a455a;
	/* Slightly lighter background */
	--text-primary: #f8f9fa;
	/* White text for contrast */
	--text-secondary: #d0d6e0;
	/* Light blue-gray for secondary text */
	--accent-green: #75b87e;
	/* Darker, higher-contrast green */
	--accent-light: #dcf0e6;
	/* Light green from icon */
	--accent-blue: #4d6384;
	/* Darker blue for better contrast */
	--accent-hover: #8fc196;
	/* Darker version of accent green */
	--border-radius: 6px;
}

body {
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans,
		Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
	padding: 0;
	margin: 0;
	width: 340px;
	background-color: var(--bg-primary);
	color: var(--text-primary);
}

.container {
	padding: 20px;
}

.header {
	background-color: var(--accent-green);
	padding: 16px 20px;
	border-radius: 0 0 var(--border-radius) var(--border-radius);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	margin-bottom: 20px;
	position: relative;
	overflow: hidden;
}

.download-btn {
	background-color: var(--bg-primary);
	color: var(--accent-green);
	font-weight: 600;
	font-size: 16px;
	border: none;
	border-radius: var(--border-radius);
	padding: 12px 20px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	transition: all 0.2s;
}

.download-btn:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	background-color: #232c3c;
}

.download-btn:active {
	transform: translateY(0);
}

.download-btn svg {
	margin-right: 10px;
	width: 20px;
	height: 20px;
}

h2 {
	margin: 0 0 20px 0;
	font-size: 18px;
	font-weight: 500;
	color: var(--text-primary);
}

.setting-group {
	margin-bottom: 20px;
	background-color: var(--bg-secondary);
	padding: 16px;
	border-radius: var(--border-radius);
	border-left: 3px solid var(--accent-green);
}

label {
	display: block;
	margin-bottom: 8px;
	font-weight: 500;
}

.description {
	color: var(--text-secondary);
	font-size: 13px;
	margin-bottom: 10px;
	line-height: 1.4;
}

input {
	width: 90px;
	padding: 8px 10px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 4px;
	background-color: rgba(0, 0, 0, 0.2);
	color: var(--text-primary);
	font-family: inherit;
	font-size: 14px;
}

input:focus {
	outline: none;
	border-color: var(--accent-green);
}

.buttons {
	margin-top: 20px;
	display: flex;
	justify-content: flex-end;
}

.btn-secondary {
	background-color: rgba(255, 255, 255, 0.1);
	color: var(--text-primary);
	border: none;
	border-radius: var(--border-radius);
	padding: 10px 16px;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s;
	font-weight: 500;
}

.btn-secondary:hover {
	background-color: rgba(255, 255, 255, 0.15);
}

.btn-primary {
	background-color: var(--accent-blue);
	color: var(--text-primary);
	border: none;
	border-radius: var(--border-radius);
	padding: 10px 16px;
	margin-left: 8px;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s;
	font-weight: 500;
}

.btn-primary:hover {
	background-color: #778ca8;
}

.status {
	color: var(--accent-green);
	font-size: 13px;
	height: 15px;
	margin-top: 12px;
	text-align: center;
}

button:focus,
input:focus {
	outline: 2px solid #ffffff;
	outline-offset: 2px;
	box-shadow: 0 0 0 2px var(--accent-blue);
}
`, "",{"version":3,"sources":["webpack://./src/popup/popup.css"],"names":[],"mappings":"AAAA;CACC,qBAAqB;CACrB,8BAA8B;CAC9B,uBAAuB;CACvB,gCAAgC;CAChC,uBAAuB;CACvB,4BAA4B;CAC5B,yBAAyB;CACzB,uCAAuC;CACvC,uBAAuB;CACvB,kCAAkC;CAClC,uBAAuB;CACvB,0BAA0B;CAC1B,sBAAsB;CACtB,oCAAoC;CACpC,uBAAuB;CACvB,mCAAmC;CACnC,oBAAoB;AACrB;;AAEA;CACC;iDACgD;CAChD,UAAU;CACV,SAAS;CACT,YAAY;CACZ,mCAAmC;CACnC,0BAA0B;AAC3B;;AAEA;CACC,aAAa;AACd;;AAEA;CACC,qCAAqC;CACrC,kBAAkB;CAClB,4DAA4D;CAC5D,yCAAyC;CACzC,mBAAmB;CACnB,kBAAkB;CAClB,gBAAgB;AACjB;;AAEA;CACC,mCAAmC;CACnC,0BAA0B;CAC1B,gBAAgB;CAChB,eAAe;CACf,YAAY;CACZ,mCAAmC;CACnC,kBAAkB;CAClB,eAAe;CACf,aAAa;CACb,mBAAmB;CACnB,uBAAuB;CACvB,WAAW;CACX,yCAAyC;CACzC,oBAAoB;AACrB;;AAEA;CACC,2BAA2B;CAC3B,yCAAyC;CACzC,yBAAyB;AAC1B;;AAEA;CACC,wBAAwB;AACzB;;AAEA;CACC,kBAAkB;CAClB,WAAW;CACX,YAAY;AACb;;AAEA;CACC,kBAAkB;CAClB,eAAe;CACf,gBAAgB;CAChB,0BAA0B;AAC3B;;AAEA;CACC,mBAAmB;CACnB,qCAAqC;CACrC,aAAa;CACb,mCAAmC;CACnC,0CAA0C;AAC3C;;AAEA;CACC,cAAc;CACd,kBAAkB;CAClB,gBAAgB;AACjB;;AAEA;CACC,4BAA4B;CAC5B,eAAe;CACf,mBAAmB;CACnB,gBAAgB;AACjB;;AAEA;CACC,WAAW;CACX,iBAAiB;CACjB,0CAA0C;CAC1C,kBAAkB;CAClB,oCAAoC;CACpC,0BAA0B;CAC1B,oBAAoB;CACpB,eAAe;AAChB;;AAEA;CACC,aAAa;CACb,iCAAiC;AAClC;;AAEA;CACC,gBAAgB;CAChB,aAAa;CACb,yBAAyB;AAC1B;;AAEA;CACC,0CAA0C;CAC1C,0BAA0B;CAC1B,YAAY;CACZ,mCAAmC;CACnC,kBAAkB;CAClB,eAAe;CACf,eAAe;CACf,oBAAoB;CACpB,gBAAgB;AACjB;;AAEA;CACC,2CAA2C;AAC5C;;AAEA;CACC,oCAAoC;CACpC,0BAA0B;CAC1B,YAAY;CACZ,mCAAmC;CACnC,kBAAkB;CAClB,gBAAgB;CAChB,eAAe;CACf,eAAe;CACf,oBAAoB;CACpB,gBAAgB;AACjB;;AAEA;CACC,yBAAyB;AAC1B;;AAEA;CACC,0BAA0B;CAC1B,eAAe;CACf,YAAY;CACZ,gBAAgB;CAChB,kBAAkB;AACnB;;AAEA;;CAEC,0BAA0B;CAC1B,mBAAmB;CACnB,wCAAwC;AACzC","sourcesContent":[":root {\n\t--bg-primary: #2d3647;\n\t/* Darker variant of #697e9b */\n\t--bg-secondary: #3a455a;\n\t/* Slightly lighter background */\n\t--text-primary: #f8f9fa;\n\t/* White text for contrast */\n\t--text-secondary: #d0d6e0;\n\t/* Light blue-gray for secondary text */\n\t--accent-green: #75b87e;\n\t/* Darker, higher-contrast green */\n\t--accent-light: #dcf0e6;\n\t/* Light green from icon */\n\t--accent-blue: #4d6384;\n\t/* Darker blue for better contrast */\n\t--accent-hover: #8fc196;\n\t/* Darker version of accent green */\n\t--border-radius: 6px;\n}\n\nbody {\n\tfont-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans,\n\t\tUbuntu, Cantarell, 'Helvetica Neue', sans-serif;\n\tpadding: 0;\n\tmargin: 0;\n\twidth: 340px;\n\tbackground-color: var(--bg-primary);\n\tcolor: var(--text-primary);\n}\n\n.container {\n\tpadding: 20px;\n}\n\n.header {\n\tbackground-color: var(--accent-green);\n\tpadding: 16px 20px;\n\tborder-radius: 0 0 var(--border-radius) var(--border-radius);\n\tbox-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);\n\tmargin-bottom: 20px;\n\tposition: relative;\n\toverflow: hidden;\n}\n\n.download-btn {\n\tbackground-color: var(--bg-primary);\n\tcolor: var(--accent-green);\n\tfont-weight: 600;\n\tfont-size: 16px;\n\tborder: none;\n\tborder-radius: var(--border-radius);\n\tpadding: 12px 20px;\n\tcursor: pointer;\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: center;\n\twidth: 100%;\n\tbox-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);\n\ttransition: all 0.2s;\n}\n\n.download-btn:hover {\n\ttransform: translateY(-2px);\n\tbox-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n\tbackground-color: #232c3c;\n}\n\n.download-btn:active {\n\ttransform: translateY(0);\n}\n\n.download-btn svg {\n\tmargin-right: 10px;\n\twidth: 20px;\n\theight: 20px;\n}\n\nh2 {\n\tmargin: 0 0 20px 0;\n\tfont-size: 18px;\n\tfont-weight: 500;\n\tcolor: var(--text-primary);\n}\n\n.setting-group {\n\tmargin-bottom: 20px;\n\tbackground-color: var(--bg-secondary);\n\tpadding: 16px;\n\tborder-radius: var(--border-radius);\n\tborder-left: 3px solid var(--accent-green);\n}\n\nlabel {\n\tdisplay: block;\n\tmargin-bottom: 8px;\n\tfont-weight: 500;\n}\n\n.description {\n\tcolor: var(--text-secondary);\n\tfont-size: 13px;\n\tmargin-bottom: 10px;\n\tline-height: 1.4;\n}\n\ninput {\n\twidth: 90px;\n\tpadding: 8px 10px;\n\tborder: 1px solid rgba(255, 255, 255, 0.1);\n\tborder-radius: 4px;\n\tbackground-color: rgba(0, 0, 0, 0.2);\n\tcolor: var(--text-primary);\n\tfont-family: inherit;\n\tfont-size: 14px;\n}\n\ninput:focus {\n\toutline: none;\n\tborder-color: var(--accent-green);\n}\n\n.buttons {\n\tmargin-top: 20px;\n\tdisplay: flex;\n\tjustify-content: flex-end;\n}\n\n.btn-secondary {\n\tbackground-color: rgba(255, 255, 255, 0.1);\n\tcolor: var(--text-primary);\n\tborder: none;\n\tborder-radius: var(--border-radius);\n\tpadding: 10px 16px;\n\tfont-size: 14px;\n\tcursor: pointer;\n\ttransition: all 0.2s;\n\tfont-weight: 500;\n}\n\n.btn-secondary:hover {\n\tbackground-color: rgba(255, 255, 255, 0.15);\n}\n\n.btn-primary {\n\tbackground-color: var(--accent-blue);\n\tcolor: var(--text-primary);\n\tborder: none;\n\tborder-radius: var(--border-radius);\n\tpadding: 10px 16px;\n\tmargin-left: 8px;\n\tfont-size: 14px;\n\tcursor: pointer;\n\ttransition: all 0.2s;\n\tfont-weight: 500;\n}\n\n.btn-primary:hover {\n\tbackground-color: #778ca8;\n}\n\n.status {\n\tcolor: var(--accent-green);\n\tfont-size: 13px;\n\theight: 15px;\n\tmargin-top: 12px;\n\ttext-align: center;\n}\n\nbutton:focus,\ninput:focus {\n\toutline: 2px solid #ffffff;\n\toutline-offset: 2px;\n\tbox-shadow: 0 0 0 2px var(--accent-blue);\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


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
/******/ 			id: moduleId,
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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This is a wrapper file for the popup script
// It serves as an entry point for webpack without using ES modules syntax

(function () {
  // Require all needed modules
  __webpack_require__(2157);
})();
/******/ })()
;
//# sourceMappingURL=popup.js.map