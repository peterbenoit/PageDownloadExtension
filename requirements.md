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
