// --- Offscreen Document Management ---
let creatingOffscreenDocument;

// Function to get localized message in background script
function getMessage(key, substitutions = []) {
  if (substitutions.length === 0) {
    return chrome.i18n.getMessage(key);
  }
  return chrome.i18n.getMessage(key, substitutions);
}

// Function to ensure the offscreen document is available and return a promise
async function ensureOffscreenDocument(path = 'offscreen.html') {
    // Check if the document already exists
    const existingContexts = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] });
    if (existingContexts.length > 0) {
        // console.log("Offscreen document already exists.");
        return;
    }

    // Avoid creating multiple documents simultaneously
    if (creatingOffscreenDocument) {
        await creatingOffscreenDocument;
    } else {
        console.log(getMessage('creatingOffscreenDocument'));
        creatingOffscreenDocument = chrome.offscreen.createDocument({
            url: path,
            reasons: ['OFFSCREEN_CANVAS'],
            justification: 'Resize favicons fetched from external URLs.',
        });
        await creatingOffscreenDocument;
        creatingOffscreenDocument = null; // Reset the promise after creation
        console.log(getMessage('offscreenDocumentCreated'));
    }
}

// Function to send resize request to offscreen document
async function resizeImageOffscreen(imageUrl) {
    await ensureOffscreenDocument();
    console.log("Sending resize request to offscreen for:", imageUrl);
    const response = await chrome.runtime.sendMessage({
        type: 'resizeImage',
        target: 'offscreen',
        imageUrl: imageUrl
    });
    console.log("Background received response from offscreen:", response);
    if (response && response.success) {
        return response.dataUrl;
    } else {
        throw new Error(response?.error || 'Offscreen resizing failed');
    }
}
// --- End Offscreen Document Management ---

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if ((changeInfo.status === 'complete' || changeInfo.url) && tab.url && tab.url.startsWith('http')) {
    chrome.storage.sync.get(['faviconSettings'], (result) => {
      const settings = result.faviconSettings || {};
      if (Object.keys(settings).length === 0) return;

      let tabUrl;
      try { tabUrl = new URL(tab.url); } catch (e) { return; }
      const tabHostname = tabUrl.hostname;
      const tabPathname = tabUrl.pathname;
      const stringToTest = tabHostname + tabPathname; // Used for keyword matching

      let bestPrefixMatchKey = null;
      let longestPrefixMatchLength = -1;
      let firstKeywordMatchKey = null;

      // Iterate through ALL settings to find potential matches for both types
      for (const registeredKey in settings) {
          if (registeredKey.includes('/')) {
              // --- Prefix Rule Check ---
              let registeredHost;
              let registeredPath;
              const pathSeparatorIndex = registeredKey.indexOf('/');
              registeredHost = registeredKey.substring(0, pathSeparatorIndex);
              registeredPath = registeredKey.substring(pathSeparatorIndex);

              let hostMatches = (tabHostname === registeredHost || tabHostname.endsWith('.' + registeredHost));
              let pathMatches = false;
              if (hostMatches) {
                  if (registeredPath === '/') {
                      pathMatches = true;
                  } else if (tabPathname.startsWith(registeredPath)) {
                      const nextCharIndex = registeredPath.length;
                      if (tabPathname.length === registeredPath.length || tabPathname.charAt(nextCharIndex) === '/') {
                          pathMatches = true;
                      }
                  }
              }

              if (hostMatches && pathMatches) {
                  // Keep track of the best (longest) prefix match found so far
                  if (registeredKey.length > longestPrefixMatchLength) {
                      longestPrefixMatchLength = registeredKey.length;
                      bestPrefixMatchKey = registeredKey;
                  }
              }
              // --- End Prefix Rule Check ---
          } else {
              // --- Keyword Rule Check ---
              // Keep track of the *first* keyword match found
              if (firstKeywordMatchKey === null && stringToTest.includes(registeredKey)) {
                  firstKeywordMatchKey = registeredKey;
              }
              // --- End Keyword Rule Check ---
          }
      }

      // Determine final match based on new priority (Keyword > Prefix)
      let finalMatchKey = firstKeywordMatchKey !== null ? firstKeywordMatchKey : bestPrefixMatchKey;

      if (finalMatchKey) {
        const finalFaviconIdentifier = settings[finalMatchKey];
        const matchType = finalMatchKey.includes('/') ? "Prefix" : "Keyword"; // Type determined by the key itself
        const localizedMatchType = matchType === "Prefix" ? getMessage('prefix') : getMessage('keyword');
        console.log(getMessage('applyingIconMatch', [localizedMatchType, finalMatchKey, stringToTest]));

        // Send the identifier to content script
        chrome.tabs.sendMessage(tabId, {
            action: "changeFavicon",
            faviconUrl: finalFaviconIdentifier
        }).catch(err => {
            if (err.message.includes("Could not establish connection")) {
                console.warn(getMessage('contentScriptNotReady', [tabId]));
            } else {
                console.error(getMessage('errorSendingMessage', [tabId, err]));
            }
        });
      } else {
        // console.log(getMessage('noMatchingRule', [stringToTest]));
      }
    });
  }
});

// Open the options page when the browser action icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.runtime.openOptionsPage();
}); 