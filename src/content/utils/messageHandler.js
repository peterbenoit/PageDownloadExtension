import { Toast } from '../components/toast.js';
import { collectResources } from './resourceCollector.js';

export class MessageHandler {
	constructor() {
		this.toast = new Toast();
		this.setupMessageListener();
	}

	setupMessageListener() {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			console.log('Content script received message:', message);

			switch (message.action) {
				case 'scanPage':
					this.handleScanPage(sendResponse);
					return true; // Keep the message channel open for async response

				case 'showToast':
					this.toast.showToast(message.message, message.duration);
					sendResponse({ success: true });
					break;

				case 'showProgress':
					const progressControl = this.toast.showProgress(message.message);
					// Store the progress control for potential updates
					this._progressControl = progressControl;
					sendResponse({ success: true });
					break;

				case 'updateProgress':
					if (this._progressControl) {
						this._progressControl.updateProgress(message.percent);
					}
					sendResponse({ success: true });
					break;
			}
		});
	}

	async handleScanPage(sendResponse) {
		try {
			const resources = await collectResources();
			sendResponse({
				success: true,
				html: document.documentElement.outerHTML,
				resources: resources,
				title: document.title,
				url: window.location.href
			});
		} catch (error) {
			console.error('Error collecting page resources:', error);
			sendResponse({
				success: false,
				error: error.message
			});
		}
	}
}
