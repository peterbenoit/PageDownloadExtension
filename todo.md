# Page Downloader Extension (Manifest V3)

## Main functionality

-   When visiting a page and clicking the extension, the download should start silently without any progress UI or confirmation dialogue.
-   The extension should download the raw, unedited HTML of the starting page.

## Resource structure

-   All downloaded content should be organized under a folder named after the domain.
    -   For example, downloading from `domainA.com` should create a structure like:
        -   domainA.com/
            -   page.html
            -   /images
            -   /css
            -   /js

## Resource paths on a page

-   Paths to resources should be fixed:
    -   The HTML file is saved as `page.html`
    -   Images saved under `/images` folder
    -   CSS files saved under `/css` folder
    -   JavaScript files saved under `/js` folder

## Handling linked pages

-   If there are any links on the page to another page on the same domain:
    -   Only download pages that are directly linked (1-level deep from the starting page)
    -   No recursive downloading of linked pages

## External resources

-   Do not download external files (files not hosted on the same domain)

## Error handling

-   If any resource fails to download, log the error using `console.error`

## Future enhancements

-   If dynamic behavior is needed, consider handling that later.
