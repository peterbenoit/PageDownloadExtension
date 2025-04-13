// We can't use ES module import for JSZip as it's loaded via importScripts in MV3
// We'll switch to global scope access for JSZip
const { processPageData } = require('./processPageData');
require('./listeners');

// JSZip is loaded via importScripts in background-wrapper.js
