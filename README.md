# Page Download Extension

A Chrome extension that downloads web pages and their associated resources as an organized ZIP archive.

## Features

-   **Single ZIP Download**: Downloads the page HTML and resources in one organized archive
-   **Smart Resource Management**:
    -   Downloads images, CSS, and JavaScript files
    -   Processes inline styles and background images
    -   Handles font files and other media
-   **Security First**:
    -   Only downloads JavaScript files with `.js` extension
    -   Strips analytics code (Google Analytics, Microsoft Clarity)
    -   Maintains same-domain restrictions for sensitive resources
-   **Organized Structure**:
    ```
    domain.com/
    ├── page.html
    ├── css/
    │   └── styles.css
    ├── js/
    │   └── script.js
    └── images/
        └── image.png
    ```

## Installation

1. Clone this repository or download the ZIP
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Visit any webpage you want to download
2. Click the extension icon in your Chrome toolbar
3. The page and its resources will download as a single ZIP file
4. Find the downloaded ZIP in your downloads folder, organized by domain

## Configuration

The extension provides configurable settings for:

-   Maximum individual resource size (MB)
-   Maximum total archive size (MB)
-   Resource types to include (CSS, JS, Images, Fonts, Videos)
-   Ad removal option

## Technical Details

-   Built with Manifest V3
-   Uses JSZip for archive creation
-   Handles various resource types:
    -   Images (jpg, png, gif, webp, etc.)
    -   Stylesheets (CSS)
    -   JavaScript files (must end in .js)
    -   Fonts (woff, woff2, ttf, etc.)

## Development

1. Make changes to the source files
2. Reload the extension in `chrome://extensions/`
3. Test changes on various web pages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License - Feel free to use and modify as needed.
