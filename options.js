// Define your bundled icons here (filenames in the 'images' folder)
const bundledIconFilenames = [
    'favicon-16x16-1.png',
    'favicon-16x16-2.png',
    'favicon-16x16-3.png',
    'favicon-16x16-4.png',
    'favicon-16x16-5.png',
    'favicon-16x16-6.png'
  // Add your icon filenames, e.g.png'
  // 'personal.ico',
  // 'project_a.svg'
];

const domainInput = document.getElementById('domain');
const faviconUrlInput = document.getElementById('faviconUrl');
const iconUploadInput = document.getElementById('iconUpload');
const bundledIconsContainer = document.getElementById('bundledIconsContainer'); // Added
const saveButton = document.getElementById('save');
const settingsListDiv = document.getElementById('settingsList');
const clearFormButton = document.getElementById('clearForm'); // Renamed variable

// Function to generate radio buttons for bundled icons
function populateBundledIcons() {
  if (bundledIconFilenames.length === 0) {
    bundledIconsContainer.innerHTML = '<p><i>No bundled icons defined in options.js.</i></p>';
    return;
  }

  bundledIconsContainer.innerHTML = ''; // Clear placeholder
  bundledIconFilenames.forEach((filename, index) => {
    const radioId = `bundledIcon_${index}`;
    const iconUrl = chrome.runtime.getURL(`images/${filename}`);

    const label = document.createElement('label');
    label.setAttribute('for', radioId);

    const radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.name = 'bundledIconSelection'; // Group radio buttons
    radioInput.id = radioId;
    radioInput.value = filename;

    const img = document.createElement('img');
    img.src = iconUrl;
    img.alt = filename;
    img.onerror = () => { 
        console.warn(`Could not load bundled icon preview: ${filename}`);
        img.style.display = 'none'; // Hide broken image preview
    };

    label.appendChild(radioInput);
    label.appendChild(img);
    label.appendChild(document.createTextNode(` ${filename}`));

    bundledIconsContainer.appendChild(label);
  });
}

// Load existing settings when the options page opens
function loadSettings() {
  chrome.storage.sync.get(['faviconSettings'], (result) => {
    const settings = result.faviconSettings || {};
    settingsListDiv.innerHTML = '';
    for (const domain in settings) {
      addSettingToList(domain, settings[domain]);
    }
  });
}

// Add a setting to the displayed list (adjust display logic)
function addSettingToList(settingKey, iconIdentifier) {
  const div = document.createElement('div');
  let valueDisplay = '';
  const imgPrev = document.createElement('img');
  imgPrev.style.width = '16px';
  imgPrev.style.height = '16px';
  imgPrev.style.marginRight = '8px';
  imgPrev.style.verticalAlign = 'middle';
  let ruleType = settingKey.includes('/') ? "Prefix" : "Keyword";
  let iconType = 'unknown'; // To track icon source for editing

  // Icon processing display (Determine iconType)
  if (iconIdentifier.startsWith('data:image/')) {
    imgPrev.src = iconIdentifier;
    valueDisplay = 'Uploaded/Resized Icon';
    iconType = 'data';
  } else if (iconIdentifier.startsWith('http')) {
    // This case is less likely now but handle it
    imgPrev.src = iconIdentifier;
    imgPrev.onerror = () => { imgPrev.style.display = 'none'; };
    valueDisplay = iconIdentifier.length > 40 ? iconIdentifier.substring(0, 37) + '...' : iconIdentifier;
    iconType = 'url';
  } else {
    // Bundled icon (filename)
    try {
      imgPrev.src = chrome.runtime.getURL(`images/${iconIdentifier}`);
      valueDisplay = `Bundled: ${iconIdentifier}`;
      iconType = 'bundled';
    } catch (e) {
      imgPrev.style.display = 'none';
      valueDisplay = `Bundled: ${iconIdentifier} (Error?)`;
      iconType = 'bundled_error'; // Indicate potential issue
    }
  }
  
  const textSpan = document.createElement('span');
  textSpan.textContent = `[${ruleType}] ${settingKey}: ${valueDisplay}`;
  if (ruleType === "Keyword") {
    textSpan.style.fontStyle = 'italic';
  }
  
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'setting-item-content'; // Added class for styling/event
  contentWrapper.appendChild(imgPrev);
  contentWrapper.appendChild(textSpan);

  // --- Add Click Listener for Editing ---
  contentWrapper.addEventListener('click', () => {
    console.log(`Editing setting: ${settingKey}`);
    // Populate the rule input
    domainInput.value = settingKey;

    // Clear existing icon inputs/selections
    faviconUrlInput.value = '';
    iconUploadInput.value = '';
    document.querySelectorAll('input[name="bundledIconSelection"]').forEach(radio => radio.checked = false);

    // Set the icon source based on the type
    if (iconType === 'url') {
      faviconUrlInput.value = iconIdentifier; 
    } else if (iconType === 'bundled') {
      const radioToSelect = document.querySelector(`input[name="bundledIconSelection"][value="${iconIdentifier}"]`);
      if (radioToSelect) {
        radioToSelect.checked = true;
      }
    } else if (iconType === 'data'){
      // Can't pre-fill file input or easily show Data URL preview here.
      // User must select a new source if they want to change the icon.
      alert('Editing an uploaded icon. Please choose a new icon source if you wish to change it.');
    } else {
      // Bundled error or unknown - clear fields
    }
    
    // Scroll to top of page to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    domainInput.focus(); // Focus the input field
  });
  // --- End Click Listener ---

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => {
    // Optionally clear form if deleting the item being edited
    if (domainInput.value === settingKey) {
      domainInput.value = '';
      faviconUrlInput.value = '';
      iconUploadInput.value = '';
      document.querySelectorAll('input[name="bundledIconSelection"]').forEach(radio => radio.checked = false);
    }
    deleteSetting(settingKey);
  });

  div.appendChild(contentWrapper);
  div.appendChild(deleteButton);
  settingsListDiv.appendChild(div);
}

// --- Helper function for resizing image using Canvas ---
async function resizeImageToDataUrl(imageUrl, targetWidth, targetHeight) {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const imageBlob = await response.blob();
        const imageBitmap = await createImageBitmap(imageBlob);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

        // Browsers might return jpeg for toDataURL even if original was png, so specify png
        const dataUrl = canvas.toDataURL('image/png');
        
        imageBitmap.close(); // Free memory
        return dataUrl;
    } catch (error) {
        console.error("Error resizing image:", error);
        throw error; // Re-throw to be caught by saveSetting
    }
}
// --- End Helper Function ---

// Save a new or updated setting
async function saveSetting() {
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';

    let ruleInput = domainInput.value.trim();
    const faviconUrlInputVal = faviconUrlInput.value.trim();
    const file = iconUploadInput.files[0];
    const selectedBundledIconRadio = document.querySelector('input[name="bundledIconSelection"]:checked');
    const bundledIconValue = selectedBundledIconRadio ? selectedBundledIconRadio.value : null;

    // --- Input Validation (Rule and Icon Source Count) ---
    if (!ruleInput) {
        alert('Please enter a Matching Rule (URL Prefix or Keyword).');
        saveButton.disabled = false; saveButton.textContent = 'Save Setting';
        return;
    }
    // Removed Regex Validation

    const sourcesProvided = [faviconUrlInputVal, file, bundledIconValue].filter(Boolean).length;
    if (sourcesProvided === 0) {
        alert('Please provide an icon source.');
        saveButton.disabled = false; saveButton.textContent = 'Save Setting';
        return;
    } else if (sourcesProvided > 1) {
        alert('Please provide only one icon source.');
        saveButton.disabled = false; saveButton.textContent = 'Save Setting';
        return;
    }
    // --- End Input Validation ---

    // --- Key Generation (Prefix or Keyword) ---
    let settingKey;
    if (ruleInput.includes('.') || ruleInput.includes('/')) {
        // Treat as URL Prefix
        console.log("Input treated as URL prefix:", ruleInput);
        try {
            let parseUrl = ruleInput;
            if (!parseUrl.startsWith('http://') && !parseUrl.startsWith('https://')) {
                parseUrl = 'http://' + parseUrl;
            }
            const url = new URL(parseUrl);
            const hostname = url.hostname;
            let pathname = url.pathname;
            // Normalize pathname
            if (!pathname.startsWith('/')) pathname = '/' + pathname;
            if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
            settingKey = hostname + pathname;
            console.log(`Generated prefix key: ${settingKey}`);
        } catch (e) {
            alert(`Invalid URL prefix format: ${ruleInput}. Please enter like example.com or example.com/path`);
            saveButton.disabled = false; saveButton.textContent = 'Save Setting';
            return;
        }
    } else {
        // Treat as Keyword
        settingKey = ruleInput;
        console.log("Input treated as keyword:", settingKey);
    }
    // --- End Key Generation ---

    let iconIdentifierToSave;
    // --- Icon Processing (Same as before) ---
    try {
        if (file) {
            iconIdentifierToSave = await readFileAsDataURL(file);
        } else if (bundledIconValue) {
            iconIdentifierToSave = bundledIconValue;
        } else if (faviconUrlInputVal) {
            // (Includes Content-Type check and resize logic - No changes here)
             if (!faviconUrlInputVal.startsWith('http://') && !faviconUrlInputVal.startsWith('https://')) {
                throw new Error('Invalid URL format.');
            }
            try {
                const response = await fetch(faviconUrlInputVal, { method: 'HEAD' });
                if (!response.ok) {
                     const getResponse = await fetch(faviconUrlInputVal);
                     if (!getResponse.ok) throw new Error(`Fetch failed: ${getResponse.status}`);
                     const contentType = getResponse.headers.get('Content-Type');
                     if (!contentType || !contentType.startsWith('image/')) throw new Error('Not an image (GET check).');
                } else {
                    const contentType = response.headers.get('Content-Type');
                    if (!contentType || !contentType.startsWith('image/')) throw new Error('Not an image (HEAD check).');
                }
            } catch (fetchError) {
                throw new Error(`URL check failed: ${fetchError.message}`);
            }
            iconIdentifierToSave = await resizeImageToDataUrl(faviconUrlInputVal, 16, 16);
        }
    // --- End Icon Processing ---

        // Save to storage using the generated key
        chrome.storage.sync.get(['faviconSettings'], (result) => {
            const settings = result.faviconSettings || {};
            settings[settingKey] = iconIdentifierToSave;
            chrome.storage.sync.set({ faviconSettings: settings }, () => {
                console.log('Settings saved for key:', settingKey);
                domainInput.value = '';
                faviconUrlInput.value = '';
                iconUploadInput.value = '';
                if (selectedBundledIconRadio) selectedBundledIconRadio.checked = false;
                loadSettings();
                saveButton.disabled = false; saveButton.textContent = 'Save Setting';
            });
        });

    } catch (error) {
        console.error("Error processing icon or saving settings:", error);
        alert(`Error: ${error.message}`);
        saveButton.disabled = false; saveButton.textContent = 'Save Setting';
    }
}

// Helper function to read file as Data URL
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Delete a setting
function deleteSetting(settingKeyToDelete) {
  chrome.storage.sync.get(['faviconSettings'], (result) => {
    const settings = result.faviconSettings || {};
    if (settings[settingKeyToDelete]) {
      delete settings[settingKeyToDelete];
      chrome.storage.sync.set({ faviconSettings: settings }, () => {
        console.log(`Setting for ${settingKeyToDelete} deleted.`);
        loadSettings(); // Reload the list
      });
    }
  });
}

// --- Function to Clear the Input Form ---
function clearForm() {
    console.log("Clearing the form fields.");
    domainInput.value = '';
    faviconUrlInput.value = '';
    iconUploadInput.value = ''; // Clears the selected file
    // Uncheck any selected bundled icon radio button
    const selectedRadio = document.querySelector('input[name="bundledIconSelection"]:checked');
    if (selectedRadio) {
        selectedRadio.checked = false;
    }
    domainInput.focus(); // Set focus back to the first input
}
// --- End Clear Form Function ---

// Event listeners and initial population
saveButton.addEventListener('click', saveSetting);
clearFormButton.addEventListener('click', clearForm); // Renamed function and updated listener
document.addEventListener('DOMContentLoaded', () => {
    populateBundledIcons();
    loadSettings();
}); 