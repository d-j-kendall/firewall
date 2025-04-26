export {}

console.log("Firewall Background Script Loaded")

const OFFSCREEN_DOCUMENT_PATH = "offscreen.html"
const ICON_PATH = "assets/icon48.png"

// --- Offscreen Document Management ---
async function hasOffscreenDocument(path: string): Promise<boolean> {
  // @ts-expects-error
  if (chrome.runtime.getContexts) {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
      documentUrls: [chrome.runtime.getURL(path)]
    })
    return contexts.length > 0
  } else {
    // Fallback for environments where getContexts might not be available
    // This is less reliable and might need adjustment based on Chrome version
    console.warn(
      "chrome.runtime.getContexts not available, unable to reliably check for existing offscreen document."
    )
    return false
  }
}

// Creates and manages the offscreen document, sending HTML for parsing.
async function parseHtmlViaOffscreen(
  htmlText: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!(await hasOffscreenDocument(OFFSCREEN_DOCUMENT_PATH))) {
    console.log("Creating offscreen document.")
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: [chrome.offscreen.Reason.DOM_PARSER],
      justification: "Parse HTML content from archive.md"
    })
  } else {
    console.log("Offscreen document already exists.")
  }

  console.log("Sending HTML to offscreen document for parsing.")
  try {
    const response = await chrome.runtime.sendMessage({
      action: "parseHtml",
      html: htmlText,
      target: "offscreen"
    })
    console.log("Received response from offscreen:", response)
    return response
  } catch (error: any) {
    console.error("Error sending message to offscreen document:", error)
    return {
      success: false,
      error: `Failed to communicate with offscreen document: ${error.message}`
    }
  } finally {
    // Close the offscreen document after use to conserve resources
    // Consider keeping it open if you parse frequently, but closing is generally better
    console.log("Closing offscreen document.")
    await chrome.offscreen.closeDocument()
  }
}

function notifyUser(title: string, message: string, isError: boolean = false): void {
  if (isError) {
    console.error(`Notification (${title}): ${message}`)
  } else {
    console.log(`Notification (${title}): ${message}`)
  }

  // Create the user-facing notification, system and chrome must allow notifications
  chrome.notifications.create({
    type: "basic",
    iconUrl: chrome.runtime.getURL(ICON_PATH),
    title: title,
    message: message,
    priority: isError ? 2 : 0
  })
}

// Main Click Listener Fuction
chrome.action.onClicked.addListener(async (tab) => {
  console.log("Firewall extension icon clicked for tab:", tab.id)

  if (!tab.id) {
    notifyUser("Firewall Extension Error", "Clicked tab has no ID.", true)
    return
  }

  // Ensure we have a valid URL from the active tab.
  if (
    !tab.url ||
    (!tab.url.startsWith("http:") && !tab.url.startsWith("https://"))
  ) {
    notifyUser(
      "Firewall Extension Error",
      "Cannot process the current tab. It might be a special page or lack a valid web URL.",
      true
    )
    return
  }

  const originalUrl = tab.url
  const archiveUrl = `https://archive.md/${originalUrl}`
  console.log("Attempting to fetch archive:", archiveUrl)

  try {
    const response = await fetch(archiveUrl)

    if (!response.ok) {
      let errorMsg = `HTTP error! Status: ${response.status}`
      if (response.status === 404) {
        errorMsg = "Archive page not found (404)."
      } else if (response.status >= 500) {
        errorMsg = `Archive.md server error (${response.status}). Please try again later.`
      }
      throw new Error(errorMsg)
    }

    const htmlText = await response.text()
    console.log("Successfully fetched archive page content.")

    // Parse the HTML using the offscreen document
    const parseResult = await parseHtmlViaOffscreen(htmlText)

    if (parseResult.success && parseResult.url) {
      console.log("Found original URL via offscreen:", parseResult.url)
      // Open the extracted URL in a new tab
      chrome.tabs.create({ url: parseResult.url })
    } else {
      const errorMessage =
        parseResult.error ||
        "Could not extract URL from the archive page structure."
      notifyUser("Firewall Extension", errorMessage, true)
    }
  } catch (error: any) {
    // Catch fetch errors or errors thrown before offscreen parsing
    notifyUser(
      "Firewall Extension Error",
      `Failed to fetch or process archive: ${error.message}`,
      true
    )
  }
})

// Optional: Listener for when the extension is first installed or updated.
chrome.runtime.onInstalled.addListener((details) => {
  console.log(`Firewall Extension ${details.reason}.`)
  // You could potentially set up context menus or other initial settings here.
  if (details.reason === "install") {
    console.log("First installation setup can go here.")
  } else if (details.reason === "update") {
    console.log(`Updated from version ${details.previousVersion}`)
  }
})
