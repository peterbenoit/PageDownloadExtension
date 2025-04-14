# Page Download Extension Restructuring Guide

This guide breaks down the restructuring of the Chrome extension into manageable steps. Each step includes validation to ensure we're on the right track.

## Step 1: Setup Project Structure and Webpack Configuration

**Prompt:**
Create a new Git branch and set up the basic project structure with webpack configuration to build our modularized extension.

1. Create a new Git branch from main called claude37-thinking-build
2. Create a src/ directory structure with placeholder files
3. Set up package.json with webpack dependencies
4. Create webpack.config.js with proper configuration for Chrome extensions
5. Create a simple build script in package.json

**Validation:**

-   The Git branch should be created successfully
-   Running `npm install` should install all dependencies without errors
-   Running `npm run build` should create an initial dist/ directory
-   The build should succeed without errors

## Step 2: Modularize Background Script

**Prompt:**
Analyze background.js and break it into modules by functionality. Focus on separating:

-   Console logging/messaging functionality
-   File status functionality
-   Page processing functionality
-   HTML modification functionality
-   Download functionality

Create appropriate modules in src/background/ with proper imports/exports. Then create a main background.js entry point that imports and uses these modules.

**Validation:**

-   Each module should have a single responsibility
-   All original functionality should be preserved
-   The build should succeed without errors
-   The background script should function correctly when loaded in Chrome

## Step 3: Modularize Content Script

**Prompt:**
Analyze content.js and break it into modules by functionality. Focus on separating:

-   Toast UI components and DOM manipulation
-   Message handling functionality
-   Resource collection functionality

Create appropriate modules in src/content/ with proper imports/exports. Then create a main content.js entry point that imports and uses these modules.

**Validation:**

-   Each module should have a single responsibility
-   All original functionality should be preserved
-   The build should succeed without errors
-   The content script should function correctly when loaded in Chrome

## Step 4: Update Popup Files

**Prompt:**
Move popup.js to src/popup/popup.js with minimal changes since it's already fairly small.
Update popup.html to reference the bundled script from dist/ directory.

**Validation:**

-   The build should succeed without errors
-   The popup should display and function correctly when loaded in Chrome

## Step 5: Finalize and Test Full Extension

**Prompt:**
Ensure all static files (manifest.json, icons, etc.) are copied to the dist/ directory correctly. Perform a full test of the extension to verify all functionality works as expected.

**Validation:**

-   The extension should load without errors in Chrome
-   All functionality should work as expected:
    -   Downloading a page with resources
    -   Settings being saved correctly
    -   UI feedback working correctly
-   Compare the behavior with the original extension to ensure nothing is broken

## Step 6: Code Review and Cleanup

**Prompt:**
Review the modularized code for any improvements, simplifications, or optimizations. Clean up any TODOs or debug code added during development.

**Validation:**

-   The code should be clean, well-organized, and follow consistent patterns
-   No debug or temporary code should remain
-   The build process should be seamless and well-documented
