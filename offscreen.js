chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "parseHtml" && message.html) {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(message.html, "text/html")

      // Select the elements based on the shortcut logic
      const contentDiv = doc.querySelector("#CONTENT")
      const textBlock = contentDiv?.querySelector(".TEXT-BLOCK")
      const linkElement = textBlock?.querySelector("a[href]") // Find the first link inside

      if (linkElement && linkElement.getAttribute("href")) {
        const extractedUrl = linkElement.getAttribute("href")
        console.log("Offscreen: Found original URL:", extractedUrl)
        sendResponse({ success: true, url: extractedUrl })
      } else {
        console.warn("Offscreen: Could not find the specific link structure.")
        sendResponse({
          success: false,
          error:
            "Could not find the specific link structure (#CONTENT -> .TEXT-BLOCK -> a[href]) on the archive page."
        })
      }
    } catch (error) {
      console.error("Offscreen: Error parsing HTML:", error)
      sendResponse({
        success: false,
        error: `Error parsing HTML: ${error.message}`
      })
    }

    return true
  }
})
