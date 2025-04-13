/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 2:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var IS_PURE = __webpack_require__(6926);
var store = __webpack_require__(9310);

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.8.3',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2021 Denis Pushkarev (zloirock.ru)'
});


/***/ }),

/***/ 200:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports =
  // eslint-disable-next-line no-undef
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  check(typeof self == 'object' && self) ||
  check(typeof __webpack_require__.g == 'object' && __webpack_require__.g) ||
  // eslint-disable-next-line no-new-func
  (function () { return this; })() || Function('return this')();


/***/ }),

/***/ 290:
/***/ ((module) => {

// IE8- don't enum bug keys
module.exports = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/***/ }),

/***/ 298:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var wellKnownSymbol = __webpack_require__(1602);
var create = __webpack_require__(3105);
var definePropertyModule = __webpack_require__(3610);

var UNSCOPABLES = wellKnownSymbol('unscopables');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] == undefined) {
  definePropertyModule.f(ArrayPrototype, UNSCOPABLES, {
    configurable: true,
    value: create(null)
  });
}

// add a key to Array.prototype[@@unscopables]
module.exports = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};


/***/ }),

/***/ 665:
/***/ ((module) => {

var id = 0;
var postfix = Math.random();

module.exports = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
};


/***/ }),

/***/ 874:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isObject = __webpack_require__(5335);

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (input, PREFERRED_STRING) {
  if (!isObject(input)) return input;
  var fn, val;
  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),

/***/ 1229:
/***/ ((module) => {

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};


/***/ }),

/***/ 1602:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(200);
var shared = __webpack_require__(2);
var has = __webpack_require__(1883);
var uid = __webpack_require__(665);
var NATIVE_SYMBOL = __webpack_require__(1849);
var USE_SYMBOL_AS_UID = __webpack_require__(5225);

var WellKnownSymbolsStore = shared('wks');
var Symbol = global.Symbol;
var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol : Symbol && Symbol.withoutSetter || uid;

module.exports = function (name) {
  if (!has(WellKnownSymbolsStore, name)) {
    if (NATIVE_SYMBOL && has(Symbol, name)) WellKnownSymbolsStore[name] = Symbol[name];
    else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore[name];
};


/***/ }),

/***/ 1605:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(200);
var getOwnPropertyDescriptor = (__webpack_require__(7632).f);
var createNonEnumerableProperty = __webpack_require__(7712);
var redefine = __webpack_require__(7485);
var setGlobal = __webpack_require__(5975);
var copyConstructorProperties = __webpack_require__(4361);
var isForced = __webpack_require__(4977);

/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global;
  } else if (STATIC) {
    target = global[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    // extend global
    redefine(target, key, sourceProperty, options);
  }
};


/***/ }),

/***/ 1641:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var internalObjectKeys = __webpack_require__(6347);
var enumBugKeys = __webpack_require__(290);

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
module.exports = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys);
};


/***/ }),

/***/ 1849:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var fails = __webpack_require__(2074);

module.exports = !!Object.getOwnPropertySymbols && !fails(function () {
  // Chrome 38 Symbol has incorrect toString conversion
  // eslint-disable-next-line no-undef
  return !String(Symbol());
});


/***/ }),

/***/ 1883:
/***/ ((module) => {

var hasOwnProperty = {}.hasOwnProperty;

module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),

/***/ 2074:
/***/ ((module) => {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};


/***/ }),

/***/ 2886:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(200);
var inspectSource = __webpack_require__(9965);

var WeakMap = global.WeakMap;

module.exports = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));


/***/ }),

/***/ 3105:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var anObject = __webpack_require__(3938);
var defineProperties = __webpack_require__(5318);
var enumBugKeys = __webpack_require__(290);
var hiddenKeys = __webpack_require__(7708);
var html = __webpack_require__(8890);
var documentCreateElement = __webpack_require__(3262);
var sharedKey = __webpack_require__(5904);

var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO = sharedKey('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    /* global ActiveXObject */
    activeXDocument = document.domain && new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys[IE_PROTO] = true;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : defineProperties(result, Properties);
};


/***/ }),

/***/ 3262:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(200);
var isObject = __webpack_require__(5335);

var document = global.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return EXISTS ? document.createElement(it) : {};
};


/***/ }),

/***/ 3610:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var DESCRIPTORS = __webpack_require__(5077);
var IE8_DOM_DEFINE = __webpack_require__(7694);
var anObject = __webpack_require__(3938);
var toPrimitive = __webpack_require__(874);

var nativeDefineProperty = Object.defineProperty;

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
exports.f = DESCRIPTORS ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return nativeDefineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),

/***/ 3638:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var DESCRIPTORS = __webpack_require__(5077);
var fails = __webpack_require__(2074);
var has = __webpack_require__(1883);

var defineProperty = Object.defineProperty;
var cache = {};

var thrower = function (it) { throw it; };

module.exports = function (METHOD_NAME, options) {
  if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
  if (!options) options = {};
  var method = [][METHOD_NAME];
  var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
  var argument0 = has(options, 0) ? options[0] : thrower;
  var argument1 = has(options, 1) ? options[1] : undefined;

  return cache[METHOD_NAME] = !!method && !fails(function () {
    if (ACCESSORS && !DESCRIPTORS) return true;
    var O = { length: -1 };

    if (ACCESSORS) defineProperty(O, 1, { enumerable: true, get: thrower });
    else O[1] = 1;

    method.call(O, argument0, argument1);
  });
};


/***/ }),

/***/ 3747:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toInteger = __webpack_require__(7317);

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
module.exports = function (argument) {
  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};


/***/ }),

/***/ 3938:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isObject = __webpack_require__(5335);

module.exports = function (it) {
  if (!isObject(it)) {
    throw TypeError(String(it) + ' is not an object');
  } return it;
};


/***/ }),

/***/ 4361:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var has = __webpack_require__(1883);
var ownKeys = __webpack_require__(5816);
var getOwnPropertyDescriptorModule = __webpack_require__(7632);
var definePropertyModule = __webpack_require__(3610);

module.exports = function (target, source) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
  }
};


/***/ }),

/***/ 4789:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var internalObjectKeys = __webpack_require__(6347);
var enumBugKeys = __webpack_require__(290);

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};


/***/ }),

/***/ 4977:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var fails = __webpack_require__(2074);

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : typeof detection == 'function' ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

module.exports = isForced;


/***/ }),

/***/ 5077:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var fails = __webpack_require__(2074);

// Detect IE8's incomplete defineProperty implementation
module.exports = !fails(function () {
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});


/***/ }),

/***/ 5225:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var NATIVE_SYMBOL = __webpack_require__(1849);

module.exports = NATIVE_SYMBOL
  // eslint-disable-next-line no-undef
  && !Symbol.sham
  // eslint-disable-next-line no-undef
  && typeof Symbol.iterator == 'symbol';


/***/ }),

/***/ 5318:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var DESCRIPTORS = __webpack_require__(5077);
var definePropertyModule = __webpack_require__(3610);
var anObject = __webpack_require__(3938);
var objectKeys = __webpack_require__(1641);

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
module.exports = DESCRIPTORS ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule.f(O, key = keys[index++], Properties[key]);
  return O;
};


/***/ }),

/***/ 5335:
/***/ ((module) => {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),

/***/ 5476:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// toObject with fallback for non-array-like ES3 strings
var IndexedObject = __webpack_require__(8664);
var requireObjectCoercible = __webpack_require__(1229);

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};


/***/ }),

/***/ 5816:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getBuiltIn = __webpack_require__(6492);
var getOwnPropertyNamesModule = __webpack_require__(4789);
var getOwnPropertySymbolsModule = __webpack_require__(8916);
var anObject = __webpack_require__(3938);

// all object keys, includes non-enumerable and symbols
module.exports = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};


/***/ }),

/***/ 5831:
/***/ ((module) => {

/**
 * Forwards console messages to content script
 */
function proxyConsole(tabId, method, message) {
  console[method](message);
  chrome.tabs.sendMessage(tabId, {
    type: 'LOG',
    level: method,
    message: message
  });
}

/**
 * Sends file status updates to the content script
 */
function updateFileStatus(tabId, url, status, reason = null) {
  chrome.tabs.sendMessage(tabId, {
    type: 'FILE_STATUS',
    url: url,
    status: status,
    // 'success', 'skipped', or 'failed'
    reason: reason // Optional explanation message
  });
}

/**
 * Converts blob to data URL
 */
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Initiates file download
 */
function downloadURL(filename, url) {
  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: false
  }, downloadId => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }
  });
}

/**
 * Generates appropriate ZIP filename from URL
 */
function getZipFilename(domain, url) {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;

    // If it's the homepage or just a slash
    if (pathname === "/" || pathname === "") {
      return `${domain}.zip`;
    }

    // Remove extensions and clean up the pathname
    let pageName = pathname.split('/').pop().split('.')[0];

    // If we have a page name, add it to the filename
    if (pageName && pageName.length > 0) {
      return `${domain}-${pageName}.zip`;
    } else {
      return `${domain}.zip`;
    }
  } catch (error) {
    console.warn("Couldn't parse URL for ZIP filename, using domain only", error);
    return `${domain}.zip`;
  }
}
module.exports = {
  proxyConsole,
  updateFileStatus,
  blobToDataURL,
  downloadURL,
  getZipFilename
};

/***/ }),

/***/ 5904:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var shared = __webpack_require__(2);
var uid = __webpack_require__(665);

var keys = shared('keys');

module.exports = function (key) {
  return keys[key] || (keys[key] = uid(key));
};


/***/ }),

/***/ 5975:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(200);
var createNonEnumerableProperty = __webpack_require__(7712);

module.exports = function (key, value) {
  try {
    createNonEnumerableProperty(global, key, value);
  } catch (error) {
    global[key] = value;
  } return value;
};


/***/ }),

/***/ 6192:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const {
  processPageData
} = __webpack_require__(6863);
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed.");
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PAGE_DATA') {
    processPageData(message.data, sender).then(() => sendResponse({
      success: true
    })).catch(error => sendResponse({
      success: false,
      error: error.message
    }));
    return true; // Indicates async response
  }
  return false;
});
module.exports = {}; // Export empty object for consistency

/***/ }),

/***/ 6347:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var has = __webpack_require__(1883);
var toIndexedObject = __webpack_require__(5476);
var indexOf = (__webpack_require__(8186).indexOf);
var hiddenKeys = __webpack_require__(7708);

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~indexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),

/***/ 6492:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var path = __webpack_require__(9720);
var global = __webpack_require__(200);

var aFunction = function (variable) {
  return typeof variable == 'function' ? variable : undefined;
};

module.exports = function (namespace, method) {
  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global[namespace])
    : path[namespace] && path[namespace][method] || global[namespace] && global[namespace][method];
};


/***/ }),

/***/ 6539:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toInteger = __webpack_require__(7317);

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
module.exports = function (index, length) {
  var integer = toInteger(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};


/***/ }),

/***/ 6736:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(7746);
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

/***/ }),

/***/ 6765:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

// We can't use ES module import for JSZip as it's loaded via importScripts in MV3
// We'll switch to global scope access for JSZip
const {
  processPageData
} = __webpack_require__(6863);
__webpack_require__(6192);

// JSZip is loaded via importScripts in background-wrapper.js

/***/ }),

/***/ 6843:
/***/ ((module) => {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),

/***/ 6863:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(7746);
const {
  proxyConsole,
  updateFileStatus,
  blobToDataURL,
  downloadURL,
  getZipFilename
} = __webpack_require__(5831);
const {
  modifyHTML
} = __webpack_require__(6736);

/**
 * Processes page data and downloads as ZIP
 */
async function processPageData(data, sender) {
  const {
    domain,
    html,
    resources,
    url
  } = data;
  const tabId = sender.tab.id;

  // JSZip is loaded globally via importScripts in background-wrapper.js
  const zip = new JSZip();
  const domainFolder = zip.folder(domain);

  // Determine the HTML filename based on the URL
  let htmlFilename = "index.html";
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    if (pathname.length > 1 && pathname.endsWith('.html')) {
      htmlFilename = pathname.split('/').pop();
    }
  } catch (error) {
    proxyConsole(tabId, 'warn', "Couldn't parse URL, using index.html as default");
  }

  // Modify the HTML before adding it to the zip
  const modifiedHtml = modifyHTML(html);
  domainFolder.file(htmlFilename, modifiedHtml);
  let processedCount = 0;
  const totalResources = resources.length;
  chrome.action.setBadgeText({
    text: "0%"
  });
  chrome.action.setBadgeBackgroundColor({
    color: "#4688F1"
  });

  // Load user settings
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get({
      maxResourceSize: 30,
      maxTotalSize: 120,
      downloadCss: true,
      downloadJs: true,
      downloadImages: true,
      downloadFonts: true,
      downloadVideos: true
    }, function (settings) {
      const MAX_RESOURCE_SIZE_MB = settings.maxResourceSize;
      const MAX_TOTAL_SIZE_MB = settings.maxTotalSize;
      proxyConsole(tabId, 'log', `Settings loaded: Max Resource Size: ${MAX_RESOURCE_SIZE_MB}MB, Max Total Size: ${MAX_TOTAL_SIZE_MB}MB`);
      (async function processResources() {
        try {
          let totalSize = 0;
          // Notify content script that download has started
          chrome.tabs.sendMessage(tabId, {
            type: 'DOWNLOAD_STARTED'
          });
          for (const res of resources) {
            try {
              // Define resource types and their handling rules
              const resourceTypes = {
                css: {
                  folder: "css",
                  extension: ".css",
                  sameDomainOnly: false
                },
                js: {
                  folder: "js",
                  extension: ".js",
                  sameDomainOnly: true
                },
                image: {
                  folder: "images",
                  extension: null,
                  sameDomainOnly: false
                },
                font: {
                  folder: "fonts",
                  extension: null,
                  sameDomainOnly: false
                },
                video: {
                  folder: "videos",
                  extension: null,
                  sameDomainOnly: true
                }
              };
              let type = resourceTypes[res.type];
              if (!type) continue; // Skip unsupported resource types

              // Check if the user disabled this resource type
              if (res.type === 'css' && !settings.downloadCss) {
                proxyConsole(tabId, 'warn', `User disabled CSS downloads: ${res.url}`);
                updateFileStatus(tabId, res.url, 'skipped', 'CSS disabled by user');
                continue;
              }
              if (res.type === 'js' && !settings.downloadJs) {
                proxyConsole(tabId, 'warn', `User disabled JS downloads: ${res.url}`);
                updateFileStatus(tabId, res.url, 'skipped', 'JS disabled by user');
                continue;
              }
              if (res.type === 'image' && !settings.downloadImages) {
                proxyConsole(tabId, 'warn', `User disabled Images downloads: ${res.url}`);
                updateFileStatus(tabId, res.url, 'skipped', 'Images disabled by user');
                continue;
              }
              if (res.type === 'font' && !settings.downloadFonts) {
                proxyConsole(tabId, 'warn', `User disabled Fonts downloads: ${res.url}`);
                updateFileStatus(tabId, res.url, 'skipped', 'Fonts disabled by user');
                continue;
              }
              if (res.type === 'video' && !settings.downloadVideos) {
                proxyConsole(tabId, 'warn', `User disabled Videos downloads: ${res.url}`);
                updateFileStatus(tabId, res.url, 'skipped', 'Videos disabled by user');
                continue;
              }

              // Check domain restriction for types that require same-domain only
              if (type.sameDomainOnly && res.url.startsWith("http") && new URL(res.url).hostname !== domain) {
                proxyConsole(tabId, 'warn', `Skipping cross-domain resource: ${res.url}`);
                updateFileStatus(tabId, res.url, 'skipped', 'Cross-domain resource');
                continue;
              }

              // Process filename
              let filename = res.filename || res.url.split('/').pop().split('?')[0];

              // Special handling for Next.js images
              if (res.url.includes('/_next/image') && res.url.includes('url=')) {
                try {
                  // Extract the encoded URL parameter
                  const urlMatch = res.url.match(/url=([^&]+)/);
                  if (urlMatch && urlMatch[1]) {
                    // Decode the URL
                    const decodedUrl = decodeURIComponent(urlMatch[1]);
                    // Extract filename from the decoded URL
                    const nextjsFilename = decodedUrl.split('/').pop().split('?')[0];
                    if (nextjsFilename) {
                      filename = nextjsFilename;
                    }
                  }
                } catch (e) {
                  proxyConsole(tabId, 'warn', `Error extracting Next.js image name: ${e.message}`);
                }
              }
              if (type.extension && !filename.endsWith(type.extension)) {
                if (type.extension === ".js" || type.extension === ".css") {
                  if (type.extension === ".js") continue; // Skip non-JS files per rule
                  filename += type.extension;
                }
              }

              // Adjust filename for images if necessary
              if (type.folder === "images" && (res.url.includes("/img/") || res.url.includes("/images/"))) {
                filename = res.url.split('/').pop().split('?')[0];
              }

              // Check for font files by extension or path
              if (type.folder === "fonts" || /\.(woff2?|ttf|otf|eot)($|\?)/.test(filename.toLowerCase()) || res.url.includes("/fonts/")) {
                // Ensure this is processed as a font
                type = resourceTypes["font"];
              }
              proxyConsole(tabId, 'log', `Fetching resource: ${res.url} → ${filename}`);

              // Fetch with timeout
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 30000);
              try {
                const response = await fetch(res.url, {
                  signal: controller.signal,
                  credentials: 'omit',
                  cache: 'force-cache'
                });
                clearTimeout(timeoutId);
                if (!response.ok) {
                  throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
                }
                const blob = await response.blob();
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('font/')) {
                  // Override the resource type to font regardless of original detection
                  type = resourceTypes["font"];
                }

                // Check individual resource size
                if (blob.size > MAX_RESOURCE_SIZE_MB * 1024 * 1024) {
                  proxyConsole(tabId, 'warn', `Skipping ${res.url}: exceeds maximum resource size`);
                  updateFileStatus(tabId, res.url, 'skipped', `Exceeds max size limit (${MAX_RESOURCE_SIZE_MB}MB)`);
                  continue;
                }

                // Track total size
                totalSize += blob.size;
                if (totalSize > MAX_TOTAL_SIZE_MB * 1024 * 1024) {
                  proxyConsole(tabId, 'warn', `Total size exceeds limit of ${MAX_TOTAL_SIZE_MB}MB`);
                }
                const subFolder = domainFolder.folder(type.folder);
                subFolder.file(filename, blob);
                proxyConsole(tabId, 'log', `Successfully added to ZIP: ${filename}`);
                updateFileStatus(tabId, res.url, 'success');
              } catch (fetchError) {
                clearTimeout(timeoutId);
                proxyConsole(tabId, 'error', `Failed to fetch ${res.url}: ${fetchError.message}`);
                updateFileStatus(tabId, res.url, 'failed', fetchError.message);
                continue;
              }

              // Update progress after each resource
              processedCount++;
              const percentage = Math.round(processedCount / totalResources * 100);
              chrome.action.setBadgeText({
                text: `${percentage}%`
              });
              chrome.tabs.sendMessage(tabId, {
                type: 'DOWNLOAD_PROGRESS',
                percentage: percentage
              });
            } catch (err) {
              proxyConsole(tabId, 'error', `Error processing resource ${res.url}: ${err.message}`);
            }
          }

          // Generate a descriptive filename for the ZIP
          const zipFilename = getZipFilename(domain, url);
          try {
            const content = await zip.generateAsync({
              type: "blob"
            });
            const dataUrl = await blobToDataURL(content);
            downloadURL(zipFilename, dataUrl);
            chrome.action.setBadgeText({
              text: ""
            });
            chrome.tabs.sendMessage(tabId, {
              type: 'DOWNLOAD_COMPLETE',
              filename: zipFilename
            });
            resolve();
          } catch (err) {
            proxyConsole(tabId, 'error', `Error generating ZIP file: ${err.message}`);
            reject(err);
          }
        } catch (err) {
          reject(err);
        }
      })();
    });
  });
}
module.exports = {
  processPageData
};

/***/ }),

/***/ 6926:
/***/ ((module) => {

module.exports = false;


/***/ }),

/***/ 7317:
/***/ ((module) => {

var ceil = Math.ceil;
var floor = Math.floor;

// `ToInteger` abstract operation
// https://tc39.es/ecma262/#sec-tointeger
module.exports = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
};


/***/ }),

/***/ 7485:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(200);
var createNonEnumerableProperty = __webpack_require__(7712);
var has = __webpack_require__(1883);
var setGlobal = __webpack_require__(5975);
var inspectSource = __webpack_require__(9965);
var InternalStateModule = __webpack_require__(9206);

var getInternalState = InternalStateModule.get;
var enforceInternalState = InternalStateModule.enforce;
var TEMPLATE = String(String).split('String');

(module.exports = function (O, key, value, options) {
  var unsafe = options ? !!options.unsafe : false;
  var simple = options ? !!options.enumerable : false;
  var noTargetGet = options ? !!options.noTargetGet : false;
  var state;
  if (typeof value == 'function') {
    if (typeof key == 'string' && !has(value, 'name')) {
      createNonEnumerableProperty(value, 'name', key);
    }
    state = enforceInternalState(value);
    if (!state.source) {
      state.source = TEMPLATE.join(typeof key == 'string' ? key : '');
    }
  }
  if (O === global) {
    if (simple) O[key] = value;
    else setGlobal(key, value);
    return;
  } else if (!unsafe) {
    delete O[key];
  } else if (!noTargetGet && O[key]) {
    simple = true;
  }
  if (simple) O[key] = value;
  else createNonEnumerableProperty(O, key, value);
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, 'toString', function toString() {
  return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
});


/***/ }),

/***/ 7632:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var DESCRIPTORS = __webpack_require__(5077);
var propertyIsEnumerableModule = __webpack_require__(9304);
var createPropertyDescriptor = __webpack_require__(6843);
var toIndexedObject = __webpack_require__(5476);
var toPrimitive = __webpack_require__(874);
var has = __webpack_require__(1883);
var IE8_DOM_DEFINE = __webpack_require__(7694);

var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
exports.f = DESCRIPTORS ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return nativeGetOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (has(O, P)) return createPropertyDescriptor(!propertyIsEnumerableModule.f.call(O, P), O[P]);
};


/***/ }),

/***/ 7694:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var DESCRIPTORS = __webpack_require__(5077);
var fails = __webpack_require__(2074);
var createElement = __webpack_require__(3262);

// Thank's IE8 for his funny defineProperty
module.exports = !DESCRIPTORS && !fails(function () {
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});


/***/ }),

/***/ 7708:
/***/ ((module) => {

module.exports = {};


/***/ }),

/***/ 7712:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var DESCRIPTORS = __webpack_require__(5077);
var definePropertyModule = __webpack_require__(3610);
var createPropertyDescriptor = __webpack_require__(6843);

module.exports = DESCRIPTORS ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),

/***/ 7746:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(1605);
var $includes = (__webpack_require__(8186).includes);
var addToUnscopables = __webpack_require__(298);
var arrayMethodUsesToLength = __webpack_require__(3638);

var USES_TO_LENGTH = arrayMethodUsesToLength('indexOf', { ACCESSORS: true, 1: 0 });

// `Array.prototype.includes` method
// https://tc39.es/ecma262/#sec-array.prototype.includes
$({ target: 'Array', proto: true, forced: !USES_TO_LENGTH }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('includes');


/***/ }),

/***/ 8186:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toIndexedObject = __webpack_require__(5476);
var toLength = __webpack_require__(3747);
var toAbsoluteIndex = __webpack_require__(6539);

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

module.exports = {
  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};


/***/ }),

/***/ 8569:
/***/ ((module) => {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),

/***/ 8664:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var fails = __webpack_require__(2074);
var classof = __webpack_require__(8569);

var split = ''.split;

// fallback for non-array-like ES3 and non-enumerable old V8 strings
module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;


/***/ }),

/***/ 8890:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getBuiltIn = __webpack_require__(6492);

module.exports = getBuiltIn('document', 'documentElement');


/***/ }),

/***/ 8916:
/***/ ((__unused_webpack_module, exports) => {

exports.f = Object.getOwnPropertySymbols;


/***/ }),

/***/ 9206:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var NATIVE_WEAK_MAP = __webpack_require__(2886);
var global = __webpack_require__(200);
var isObject = __webpack_require__(5335);
var createNonEnumerableProperty = __webpack_require__(7712);
var objectHas = __webpack_require__(1883);
var shared = __webpack_require__(9310);
var sharedKey = __webpack_require__(5904);
var hiddenKeys = __webpack_require__(7708);

var WeakMap = global.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP) {
  var store = shared.state || (shared.state = new WeakMap());
  var wmget = store.get;
  var wmhas = store.has;
  var wmset = store.set;
  set = function (it, metadata) {
    metadata.facade = it;
    wmset.call(store, it, metadata);
    return metadata;
  };
  get = function (it) {
    return wmget.call(store, it) || {};
  };
  has = function (it) {
    return wmhas.call(store, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    metadata.facade = it;
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return objectHas(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return objectHas(it, STATE);
  };
}

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};


/***/ }),

/***/ 9304:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable;


/***/ }),

/***/ 9310:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(200);
var setGlobal = __webpack_require__(5975);

var SHARED = '__core-js_shared__';
var store = global[SHARED] || setGlobal(SHARED, {});

module.exports = store;


/***/ }),

/***/ 9720:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(200);

module.exports = global;


/***/ }),

/***/ 9965:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var store = __webpack_require__(9310);

var functionToString = Function.toString;

// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
if (typeof store.inspectSource != 'function') {
  store.inspectSource = function (it) {
    return functionToString.call(it);
  };
}

module.exports = store.inspectSource;


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
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This is a wrapper file for the background script
// It serves as an entry point for webpack without using ES modules syntax

(function () {
  // Import JSZip globally
  try {
    self.importScripts('jszip.min.js');
  } catch (e) {
    console.error('Error importing JSZip:', e);
  }

  // Require all needed modules
  __webpack_require__(6765);
})();
/******/ })()
;
//# sourceMappingURL=background.js.map