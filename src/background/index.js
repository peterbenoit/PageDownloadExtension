// Main entry point for background script
// This is a placeholder that will be replaced with modularized code

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === "PAGE_DATA") {
		// Process page data
		console.log("Received PAGE_DATA message");
	}
});

console.log("Background script loaded");
