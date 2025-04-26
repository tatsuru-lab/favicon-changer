// Content script
console.log("Favicon Changer content script loaded and listening for messages.");

function changeFavicon(iconIdentifier) {
  let faviconUrl;

  // Check the type of identifier
  if (iconIdentifier.startsWith('data:image/')) {
    // Handle Data URL directly
    faviconUrl = iconIdentifier;
    console.log("Using Data URL for favicon (truncated):", faviconUrl.substring(0, 50) + "...");
  } else if (iconIdentifier.startsWith('http://') || iconIdentifier.startsWith('https://')) {
    // Handle external URL
    faviconUrl = iconIdentifier;
    console.log("Using provided external URL:", faviconUrl);
  } else {
    // Assume it's a bundled filename within the 'images' folder
    try {
      faviconUrl = chrome.runtime.getURL(`images/${iconIdentifier}`);
      console.log("Using bundled icon:", faviconUrl);
    } catch (e) {
      console.error(`Error getting URL for bundled icon '${iconIdentifier}':`, e);
      return; // Don't proceed if the URL couldn't be generated
    }
  }

  // Ensure head element exists
  if (!document.head) {
    console.warn("Favicon Changer: document.head not found yet. Favicon change deferred.");
    setTimeout(() => changeFavicon(iconIdentifier), 100);
    return;
  }

  // Remove existing favicon links
  const existingLinks = document.querySelectorAll("link[rel*='icon']");
  // console.log(`Found ${existingLinks.length} existing favicon links. Removing...`);
  existingLinks.forEach(link => link.parentNode.removeChild(link));

  // Add new favicon link
  const link = document.createElement('link');

  // Try to set type based on identifier (more robust needed for Data URLs)
  if (iconIdentifier.startsWith('data:image/png') || iconIdentifier.endsWith('.png')) {
      link.type = 'image/png';
  } else if (iconIdentifier.startsWith('data:image/jpeg') || iconIdentifier.endsWith('.jpg') || iconIdentifier.endsWith('.jpeg')) {
      link.type = 'image/jpeg';
  } else if (iconIdentifier.startsWith('data:image/x-icon') || iconIdentifier.endsWith('.ico')) {
      link.type = 'image/x-icon';
  } else if (iconIdentifier.startsWith('data:image/svg+xml') || iconIdentifier.endsWith('.svg')) {
      link.type = 'image/svg+xml';
  } else {
      link.type = 'image/x-icon'; // Default guess
  }

  link.rel = 'icon';
  link.href = faviconUrl;
  document.head.appendChild(link);
  console.log('Favicon changed using:', faviconUrl.startsWith('data:') ? 'Data URL' : faviconUrl);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // console.log("Message received in content script:", request);
  if (request.action === "changeFavicon") {
    if (request.faviconUrl) {
      changeFavicon(request.faviconUrl);
    } else {
      console.error("Favicon identifier (URL, filename, or Data URL) missing in request.");
    }
  }
});

// Attempt to change favicon on initial load as well, in case the message arrives before the script is ready
// This might be redundant if background script timing is reliable, but can act as a fallback.
/*
chrome.storage.sync.get(['faviconSettings'], (result) => {
  const settings = result.faviconSettings || {};
  const domain = window.location.hostname;
  if (settings[domain]) {
    console.log("(Initial Load) Found setting for", domain, ":", settings[domain]);
    // Need to wait for head to be available
    if (document.readyState === 'loading') { // or 'interactive'
        document.addEventListener('DOMContentLoaded', () => {
            changeFavicon(settings[domain]);
        });
    } else { // 'complete'
        changeFavicon(settings[domain]);
    }
  }
});
*/ 