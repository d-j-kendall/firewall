# Firewall - Archive.md Link Extractor Extension

This is a [Plasmo extension](https://docs.plasmo.com/) project bootstrapped with [`plasmo init`](https://www.npmjs.com/package/plasmo).

Here's [an example](https://www.youtube.com/watch?v=2G_CAr3tH9E) retrieving an archived NYT article. 

## Description

Firewall is a simple Chrome browser extension designed to quickly retrieve an underlying link from an `archive.md` page. When you click the extension icon while viewing a webpage, it attempts to:

1.  Construct the corresponding `archive.md` URL for the current page.
2.  Fetch the content of that `archive.md` page.
3.  Parse the fetched HTML using an offscreen document to find a specific link within the main content block.
4.  Open the extracted link in a new browser tab.
5.  If errors occur (e.g., archive page not found, link structure not found, network error), it displays a dialog window with details.

## Getting Started

This project requires `pnpm` for dependency management and running scripts.

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the Chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the core logic by modifying `background.ts`, or the offscreen document (`offscreen.html`, `offscreen.js`). The extension should auto-update in development mode as you make changes (you might need to manually reload for some background script changes).

For further guidance on the Plasmo framework, visit the [Plasmo Documentation](https://docs.plasmo.com/).

## Tech Stack & Tools

- **Framework:** Plasmo (v0.90.3)
- **Language:** TypeScript
- **Package Manager:** pnpm
- **Linting:**
  - ESLint (v9+) with Flat Config (`eslint.config.js`)
  - `@typescript-eslint` for TypeScript rules
  - `eslint-plugin-import` for import/export rules
  - `eslint-plugin-promise` for Promise best practices
- **Browser APIs:** Chrome Extension Manifest V3
  - `chrome.action`
  - `chrome.tabs`
  - `chrome.windows` (for dialogs)
  - `chrome.offscreen` (for DOM parsing)
- **Workspace API**

## Linting

To check for code quality issues, run:

```bash
pnpm lint
```

To attempt automatic fixes for linting issues:

```bash
pnpm lint:fix
```

## Making production build

This project requires pnpm to build correctly. Run the following command:

```bash
pnpm build
```

This will create a production bundle for your extension in the appropriate build directory (e.g., `build/chrome-mv3-prod`), ready to be zipped and published to the stores.

## Packaging for Distribution

After building, create the zip file for store submission:

This command generates the zip file (e.g., build/chrome-mv3-prod.zip) needed for uploading to the Chrome Web Store or other platforms.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp GitHub action](https://docs.plasmo.com/framework/workflows/deployment). Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow the [setup instruction](https://docs.plasmo.com/framework/workflows/deployment) on that page, and you should be on your way for automated submission!
