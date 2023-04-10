# P2:CE Panorama UI Files

This directory contains the layouts, scripts and styles for P2CE's Panorama UI.

## Folder Structure

-   `browser/` -- Contains a webkit css file for browser widget
-   `fonts/` -- Contains the fonts used in Panorama
-   `layout/` -- All UI layouts go here. They're in XML, not HTML
-   `scripts/` -- All JavaScript scripts go here. We use ES6 JS
-   `styles/` -- All CSS/SCSS/SASS stylesheets go here. Note that Panorama CSS is an extended version of normal CSS. Some properties will be missing
-   `dev_keybinds.cfg` -- These keybinds will only be loaded if -dev is passed to the game. By default we bind F6 to open the debugger, F7 to reload changed files, and F8 to reload everything, as well as some other functions.
-   `panorama.cfg` -- This cfg defines various panorama directories, associating them with a name
-   `default_keybinds.cfg` -- This is just a list of the default panorama keybinds

## Using ESLint

To write Panorama JS files, you will want to format them properly. This is where `eslint` comes in.
To use this tool, you will need to do 3 things:

1. Install Node.js, the newest possible stable version should be the best.
2. Open a command prompt inside this directory, and run `npm install`.
3. Whenever you want to check your code for errors, run `npm run check`.
   You can also run `npm run format` to attempt to automatically fix any errors found.
