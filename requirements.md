# Page Downloader Extension (Manifest V3)

## Main functionality

-   When visiting a page and clicking the extension, download the raw, unedited HTML of the starting page along with its associated resources (images, CSS, JavaScript) silently as a single ZIP archive download.

## Resource structure in the ZIP

-   The content should be organized under a folder named after the domain.
    -   For example, downloading from `domainA.com` should create a structure like:
        -   domainA.com/
            -   page.html
            -   /images
            -   /css
            -   /js

## Resource paths on a page

-   Paths to resources should be fixed:
    -   The HTML file is saved as `page.html`
    -   Images saved under the `/images` folder
    -   CSS files saved under the `/css` folder
    -   JavaScript files saved under the `/js` folder

## Handling linked pages

-   Do not download any linked pages from the current page.

## External resources

-   Do not download external files (files not hosted on the same domain)

## Error handling

-   If any resource fails to download, log the error using `console.error`

## Future enhancements

-   If dynamic behavior is needed, consider handling that later.

# Restructuring Plan

## Overview

This document outlines the restructuring of the Chrome extension into a `src/` directory and modularization of its code.

## Steps

1. Move all source files (`background.js`, `content.js`, `popup.js`, `manifest.json`, etc.) into a new `src/` directory.
2. Modularize `background.js` and `content.js` by splitting them into smaller modules grouped by related functionality.
3. Update `popup.html` to reference the correct bundled script.
4. Create a `vite.config.js` file to handle the build process, ensuring the output matches the required structure.
5. Ensure all functionality remains intact and works as expected.

## Modularization Plan

-   **background.js**
    -   Split into modules for event listeners, message handling, and utility functions.
-   **content.js**
    -   Split into modules for DOM manipulation, event handling, and communication with the background script.

## Build Configuration

-   Use Vite to bundle the modularized code into a `dist/` directory.
-   Ensure the final output includes single bundled files for `content.js`, `background.js`, and `popup.js`.
-   Copy `manifest.json`, `icons/`, and `popup.html` to `dist/` unchanged.
