(function () {
  'use strict';

  (async () => {
    await import(
      /* @vite-ignore */
      chrome.runtime.getURL("chunks/content.js.718f7aa5.js")
    );
  })().catch(console.error);

})();
