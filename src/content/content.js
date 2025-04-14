import { MessageHandler } from './utils/messageHandler.js';

// Initialize message handler when content script loads
const messageHandler = new MessageHandler();

console.log('Page Download Extension content script loaded');
