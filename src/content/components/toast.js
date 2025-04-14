/**
 * Creates and manages toast notification UI elements
 */
export class Toast {
	constructor() {
		this.toastContainer = null;
		this.progressBar = null;
		this.progressText = null;
		this.setupToastContainer();
	}

	setupToastContainer() {
		// Create toast container if it doesn't exist
		this.toastContainer = document.createElement('div');
		this.toastContainer.id = 'page-download-toast';
		this.toastContainer.style.display = 'none';
		// Add styling for toast container
		this.toastContainer.style.position = 'fixed';
		this.toastContainer.style.bottom = '20px';
		this.toastContainer.style.right = '20px';
		this.toastContainer.style.backgroundColor = '#333';
		this.toastContainer.style.color = 'white';
		this.toastContainer.style.padding = '10px 20px';
		this.toastContainer.style.borderRadius = '5px';
		this.toastContainer.style.zIndex = '10000';
		this.toastContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
		document.body.appendChild(this.toastContainer);
	}

	showToast(message, duration = 3000) {
		this.toastContainer.textContent = message;
		this.toastContainer.style.display = 'block';

		setTimeout(() => {
			this.hideToast();
		}, duration);
	}

	hideToast() {
		this.toastContainer.style.display = 'none';
	}

	showProgress(message) {
		// Create progress container
		this.toastContainer.textContent = '';
		this.toastContainer.style.display = 'block';

		const messageElem = document.createElement('div');
		messageElem.textContent = message;
		this.toastContainer.appendChild(messageElem);

		// Add progress bar
		this.progressBar = document.createElement('div');
		this.progressBar.style.width = '100%';
		this.progressBar.style.backgroundColor = '#444';
		this.progressBar.style.marginTop = '10px';
		this.progressBar.style.height = '5px';
		this.progressBar.style.position = 'relative';

		const progressFill = document.createElement('div');
		progressFill.style.width = '0%';
		progressFill.style.backgroundColor = '#4CAF50';
		progressFill.style.height = '100%';

		this.progressBar.appendChild(progressFill);
		this.toastContainer.appendChild(this.progressBar);

		// Add progress text
		this.progressText = document.createElement('div');
		this.progressText.textContent = '0%';
		this.progressText.style.textAlign = 'center';
		this.progressText.style.fontSize = '12px';
		this.progressText.style.marginTop = '5px';
		this.toastContainer.appendChild(this.progressText);

		return {
			updateProgress: (percent) => {
				progressFill.style.width = `${percent}%`;
				this.progressText.textContent = `${percent}%`;
			}
		};
	}
}
