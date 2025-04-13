Create a new Git branch from main called claude37-thinking-build.

Restructure this Chrome extension (Manifest V3, plain JS) into a new src/ directory.

For content.js, background.js and popup.js:

Analyze and break them into smaller modules grouped by related functionality
Use standard import/export syntax
Ensure that all functionality remains intact and works as expected
Keep popup.js as a single file unless there's a clear reason to modularize

Update popup.html to reference the correct bundled script

Create a webpack build that:

Builds the modularized code into a dist/ directory

Outputs the final versions of content.js, background.js, and popup.js as single bundled files

Copies static files to dist/ unchanged

Be very careful about ES module imports and require(), I've been battling all day with AI agents and none of them have got them working in the build

Validate the changes, that functionality and intentions in the original files exists in the new /src folder

I will test this in Chrome from the /dist folder
