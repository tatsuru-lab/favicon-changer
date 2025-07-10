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

// Available languages configuration
const AVAILABLE_LANGUAGES = {
  'auto': { name: 'Auto (System Default)', nativeName: 'Auto (System Default)' },
  'en': { name: 'English', nativeName: 'English' },
  'ja': { name: 'Japanese', nativeName: '日本語' }
};

// Current language setting (will be loaded from storage)
let currentLanguage = 'auto';

// Function to get localized message with custom language support
function getMessage(key, substitutions = [], forceLanguage = null) {
  const targetLanguage = forceLanguage || currentLanguage;
  
  // If auto or language not specified, use Chrome's default behavior
  if (targetLanguage === 'auto' || !targetLanguage) {
    if (substitutions.length === 0) {
      return chrome.i18n.getMessage(key);
    }
    return chrome.i18n.getMessage(key, substitutions);
  }
  
  // Try to get message from specific language
  try {
    // Load messages from the specific locale
    const message = getMessageFromLocale(key, targetLanguage);
    if (message) {
      return formatMessage(message, substitutions);
    }
  } catch (e) {
    console.warn(`Failed to get message "${key}" for language "${targetLanguage}":`, e);
  }
  
  // Fallback to Chrome's default behavior
  if (substitutions.length === 0) {
    return chrome.i18n.getMessage(key);
  }
  return chrome.i18n.getMessage(key, substitutions);
}

// Cache for loaded language messages
const languageMessagesCache = {};

// Helper function to get message from specific locale
function getMessageFromLocale(key, language) {
  // Check cache first
  if (languageMessagesCache[language] && languageMessagesCache[language][key]) {
    return languageMessagesCache[language][key].message;
  }
  
  // Try to load from locale files
  try {
    const localeUrl = chrome.runtime.getURL(`_locales/${language}/messages.json`);
    // Since we can't use synchronous fetch in this context, we'll implement async loading
    // For now, return null to use fallback
    return null;
  } catch (e) {
    console.warn(`Failed to load locale ${language}:`, e);
    return null;
  }
}

// Function to load messages for a specific language
async function loadLanguageMessages(language) {
  if (languageMessagesCache[language]) {
    return languageMessagesCache[language];
  }
  
  try {
    const localeUrl = chrome.runtime.getURL(`_locales/${language}/messages.json`);
    const response = await fetch(localeUrl);
    if (response.ok) {
      const messages = await response.json();
      languageMessagesCache[language] = messages;
      return messages;
    }
  } catch (e) {
    console.warn(`Failed to load messages for language ${language}:`, e);
  }
  
  return null;
}

// Enhanced getMessage function with async language loading
async function getMessageAsync(key, substitutions = [], forceLanguage = null) {
  const targetLanguage = forceLanguage || currentLanguage;
  
  // If auto or language not specified, use Chrome's default behavior
  if (targetLanguage === 'auto' || !targetLanguage) {
    if (substitutions.length === 0) {
      return chrome.i18n.getMessage(key);
    }
    return chrome.i18n.getMessage(key, substitutions);
  }
  
  // Try to get message from specific language
  try {
    const messages = await loadLanguageMessages(targetLanguage);
    if (messages && messages[key]) {
      return formatMessage(messages[key].message, substitutions);
    }
  } catch (e) {
    console.warn(`Failed to get message "${key}" for language "${targetLanguage}":`, e);
  }
  
  // Fallback to Chrome's default behavior
  if (substitutions.length === 0) {
    return chrome.i18n.getMessage(key);
  }
  return chrome.i18n.getMessage(key, substitutions);
}

// Function to load language setting from storage
async function loadLanguageSetting() {
  try {
    const result = await chrome.storage.sync.get(['selectedLanguage']);
    currentLanguage = result.selectedLanguage || 'auto';
    console.log('Loaded language setting:', currentLanguage);
  } catch (error) {
    console.error('Failed to load language setting:', error);
    currentLanguage = 'auto';
  }
}

// Function to save language setting to storage
async function saveLanguageSetting(language) {
  try {
    await chrome.storage.sync.set({ selectedLanguage: language });
    currentLanguage = language;
    console.log('Saved language setting:', language);
  } catch (error) {
    console.error('Failed to save language setting:', error);
  }
}

// Helper function to format message with substitutions
function formatMessage(message, substitutions) {
  if (!substitutions || substitutions.length === 0) {
    return message;
  }
  
  let formatted = message;
  substitutions.forEach((substitution, index) => {
    const placeholder = `$${index + 1}`;
    formatted = formatted.replace(new RegExp('\\' + placeholder, 'g'), substitution);
  });
  
  return formatted;
}

// Function to set up localized text
async function setupLocalizedText() {
  // Update HTML page title
  document.title = await getMessageAsync('optionsTitle');
  
  // Update main elements text
  const mainTitle = document.querySelector('#mainTitle');
  if (mainTitle) {
    mainTitle.innerHTML = `<i class="material-icons" style="vertical-align: middle; margin-right: 12px; color: var(--primary-color);">palette</i>${await getMessageAsync('optionsTitle')}`;
  }
  
  const addUpdateTitle = document.querySelector('#addUpdateTitle');
  if (addUpdateTitle) {
    addUpdateTitle.innerHTML = `<i class="material-icons" style="vertical-align: middle; margin-right: 8px;">add_circle</i>${await getMessageAsync('addUpdateSetting')}`;
  }
  
  // Update language settings section
  const languageSelectLabel = document.querySelector('#languageSelectLabel');
  if (languageSelectLabel) {
    const icon = languageSelectLabel.querySelector('.material-icons');
    if (icon) {
      languageSelectLabel.innerHTML = `<i class="material-icons">language</i>${await getMessageAsync('language')}:`;
    }
  }
  
  const clickToEditText = document.querySelector('#clickToEditText');
  if (clickToEditText) {
    clickToEditText.innerHTML = `<i class="material-icons" style="vertical-align: middle; margin-right: 4px; font-size: 16px;">info</i>${await getMessageAsync('clickToEdit')}`;
  }
  
  // Update help accordion title
  const matchingRuleHelpTitle = document.querySelector('#matchingRuleHelpTitle');
  if (matchingRuleHelpTitle) {
    matchingRuleHelpTitle.textContent = await getMessageAsync('howDoesMatchingWork');
  }
  
  const matchingRuleLabel = document.querySelector('#matchingRuleLabel');
  if (matchingRuleLabel) {
    matchingRuleLabel.textContent = getMessage('matchingRule');
  }
  
  const matchingRuleHelp = document.querySelector('#matchingRuleHelp');
  if (matchingRuleHelp) {
    matchingRuleHelp.textContent = getMessage('matchingRuleHelp');
  }
  
  const chooseIconSourceTitle = document.querySelector('#chooseIconSourceTitle');
  if (chooseIconSourceTitle) {
    chooseIconSourceTitle.innerHTML = `<i class="material-icons" style="vertical-align: middle; margin-right: 8px;">image</i>${getMessage('chooseIconSource')}`;
  }
  
  const chooseIconSourceHelp = document.querySelector('#chooseIconSourceHelp');
  if (chooseIconSourceHelp) {
    chooseIconSourceHelp.innerHTML = `<i class="material-icons" style="vertical-align: middle; margin-right: 4px; font-size: 16px;">info</i>${getMessage('selectOneIconSource')}`;
  }
  
  // Update accordion titles
  const urlAccordionTitle = document.querySelector('#urlAccordionTitle');
  if (urlAccordionTitle) {
    urlAccordionTitle.textContent = getMessage('externalImageUrl');
  }
  
  const bundledAccordionTitle = document.querySelector('#bundledAccordionTitle');
  if (bundledAccordionTitle) {
    bundledAccordionTitle.textContent = getMessage('selectBundledIcon');
  }
  
  const uploadAccordionTitle = document.querySelector('#uploadAccordionTitle');
  if (uploadAccordionTitle) {
    uploadAccordionTitle.textContent = getMessage('uploadNewIcon');
  }
  
  const externalImageUrlLabel = document.querySelector('#externalImageUrlLabel');
  if (externalImageUrlLabel) {
    externalImageUrlLabel.textContent = getMessage('externalImageUrl');
  }
  
  const externalImageUrlHelp = document.querySelector('#externalImageUrlHelp');
  if (externalImageUrlHelp) {
    externalImageUrlHelp.textContent = getMessage('externalImageUrlHelp');
  }
  
  const selectBundledIconLabel = document.querySelector('#selectBundledIconLabel');
  if (selectBundledIconLabel) {
    selectBundledIconLabel.innerHTML = `<i class="material-icons" style="vertical-align: middle; margin-right: 8px;">folder</i>${getMessage('selectBundledIcon')}`;
  }
  
  const uploadNewIconLabel = document.querySelector('#uploadNewIconLabel');
  if (uploadNewIconLabel) {
    uploadNewIconLabel.innerHTML = `<i class="material-icons" style="vertical-align: middle; margin-right: 8px;">cloud_upload</i>${getMessage('uploadNewIcon')}`;
  }
  
  const oneIconSourceNote = document.querySelector('#oneIconSourceNote');
  if (oneIconSourceNote) {
    oneIconSourceNote.innerHTML = `<i class="material-icons" style="vertical-align: middle; margin-right: 4px; font-size: 16px;">info</i>${getMessage('oneIconSourceNote')}`;
  }
  
  const saveButton = document.querySelector('#save span');
  if (saveButton) {
    saveButton.textContent = getMessage('saveSetting');
  }
  
  const clearFormButton = document.querySelector('#clearForm span');
  if (clearFormButton) {
    clearFormButton.textContent = getMessage('clearForm');
  }
  
  const currentSettingsTitle = document.querySelector('#currentSettingsTitle');
  if (currentSettingsTitle) {
    currentSettingsTitle.innerHTML = `<i class="material-icons" style="vertical-align: middle; margin-right: 8px;">list</i>${getMessage('currentSettings')}`;
  }
  
  // Update file upload text
  const fileUploadLabel = document.querySelector('.file-upload-label span');
  if (fileUploadLabel) {
    fileUploadLabel.textContent = getMessage('chooseFileOrDrag');
  }
  
  // Update placeholders
  const domainInput = document.querySelector('#domain');
  if (domainInput) {
    domainInput.placeholder = getMessage('matchingRulePlaceholder');
  }
  
  const faviconUrlInput = document.querySelector('#faviconUrl');
  if (faviconUrlInput) {
    faviconUrlInput.placeholder = getMessage('externalImageUrlPlaceholder');
  }
  
  // Update no bundled icons text if container exists
  const noBundledIconsText = document.querySelector('#noBundledIconsText');
  if (noBundledIconsText) {
    noBundledIconsText.innerHTML = `<i class="material-icons" style="vertical-align: middle; margin-right: 4px;">info</i>${getMessage('noBundledIcons')}`;
  }
}

const domainInput = document.getElementById('domain');
const faviconUrlInput = document.getElementById('faviconUrl');
const iconUploadInput = document.getElementById('iconUpload');
const bundledIconsContainer = document.getElementById('bundledIconsContainer'); // Added
const saveButton = document.getElementById('save');
const settingsListDiv = document.getElementById('settingsList');
const clearFormButton = document.getElementById('clearForm'); // Renamed variable

// Accordion functionality
let currentActiveSource = null;

function initAccordion() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const content = item.querySelector('.accordion-content');
      const source = item.dataset.source;
      
      // Close all other accordion items
      accordionHeaders.forEach(otherHeader => {
        const otherItem = otherHeader.closest('.accordion-item');
        const otherContent = otherItem.querySelector('.accordion-content');
        const otherSource = otherItem.dataset.source;
        
        if (otherSource !== source) {
          otherHeader.classList.remove('active');
          otherContent.classList.remove('active');
          clearAccordionValues(otherSource);
        }
      });
      
      // Toggle current accordion item
      const isActive = header.classList.contains('active');
      if (isActive) {
        header.classList.remove('active');
        content.classList.remove('active');
        currentActiveSource = null;
        clearAccordionValues(source);
      } else {
        header.classList.add('active');
        content.classList.add('active');
        currentActiveSource = source;
      }
      
      updateAccordionStatus();
    });
  });
  
  // Set up event listeners for form inputs
  setupAccordionInputListeners();
}

function clearAccordionValues(source) {
  switch (source) {
    case 'url':
      faviconUrlInput.value = '';
      break;
    case 'bundled':
      document.querySelectorAll('input[name="bundledIconSelection"]').forEach(radio => {
        radio.checked = false;
      });
      break;
    case 'upload':
      iconUploadInput.value = '';
      break;
  }
}

function setupAccordionInputListeners() {
  // URL input listener
  faviconUrlInput.addEventListener('input', () => {
    updateAccordionStatus();
  });
  
  // File upload listener
  iconUploadInput.addEventListener('change', () => {
    updateAccordionStatus();
  });
  
  // Note: Bundled icon listeners will be set up in populateBundledIcons function
}

function updateAccordionStatus() {
  // Update URL status
  const urlStatus = document.getElementById('urlStatus');
  const urlHeader = document.getElementById('urlAccordionHeader');
  if (faviconUrlInput.value.trim()) {
    urlStatus.innerHTML = '<i class="material-icons" style="font-size: 16px; color: #4caf50;">check_circle</i>';
    urlHeader.classList.add('completed');
  } else {
    urlStatus.innerHTML = '';
    urlHeader.classList.remove('completed');
  }
  
  // Update bundled status
  const bundledStatus = document.getElementById('bundledStatus');
  const bundledHeader = document.getElementById('bundledAccordionHeader');
  const selectedBundled = document.querySelector('input[name="bundledIconSelection"]:checked');
  if (selectedBundled) {
    bundledStatus.innerHTML = '<i class="material-icons" style="font-size: 16px; color: #4caf50;">check_circle</i>';
    bundledHeader.classList.add('completed');
  } else {
    bundledStatus.innerHTML = '';
    bundledHeader.classList.remove('completed');
  }
  
  // Update upload status
  const uploadStatus = document.getElementById('uploadStatus');
  const uploadHeader = document.getElementById('uploadAccordionHeader');
  if (iconUploadInput.files && iconUploadInput.files.length > 0) {
    uploadStatus.innerHTML = '<i class="material-icons" style="font-size: 16px; color: #4caf50;">check_circle</i>';
    uploadHeader.classList.add('completed');
  } else {
    uploadStatus.innerHTML = '';
    uploadHeader.classList.remove('completed');
  }
}

function openAccordionSection(source) {
  // Close all accordion sections first
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.classList.remove('active');
  });
  document.querySelectorAll('.accordion-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Open the specified section
  const targetHeader = document.querySelector(`[data-source="${source}"] .accordion-header`);
  const targetContent = document.querySelector(`[data-source="${source}"] .accordion-content`);
  
  if (targetHeader && targetContent) {
    targetHeader.classList.add('active');
    targetContent.classList.add('active');
    currentActiveSource = source;
    updateAccordionStatus();
  }
}

// Function to generate radio buttons for bundled icons
function populateBundledIcons() {
  if (bundledIconFilenames.length === 0) {
    bundledIconsContainer.innerHTML = `<p class="body2"><i class="material-icons" style="vertical-align: middle; margin-right: 4px;">info</i>${getMessage('noBundledIconsDefined')}</p>`;
    return;
  }

  bundledIconsContainer.innerHTML = ''; // Clear placeholder
  bundledIconFilenames.forEach((filename, index) => {
    const radioId = `bundledIcon_${index}`;
    const iconUrl = chrome.runtime.getURL(`images/${filename}`);

    // Create material design icon option
    const iconOption = document.createElement('div');
    iconOption.className = 'icon-option';

    const radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.name = 'bundledIconSelection';
    radioInput.id = radioId;
    radioInput.value = filename;

    const img = document.createElement('img');
    img.src = iconUrl;
    img.alt = filename;
    img.onerror = () => { 
        console.warn(getMessage('couldNotLoadBundledIcon', [filename]));
        iconOption.style.display = 'none'; // Hide broken icon option
    };

    const label = document.createElement('label');
    label.setAttribute('for', radioId);
    label.textContent = filename;
    label.style.cursor = 'pointer';

    iconOption.appendChild(radioInput);
    iconOption.appendChild(img);
    iconOption.appendChild(label);

    // Add click handler for the entire icon option
    iconOption.addEventListener('click', () => {
      radioInput.checked = true;
      updateAccordionStatus();
    });

    // Add change listener to radio input
    radioInput.addEventListener('change', () => {
      updateAccordionStatus();
    });

    bundledIconsContainer.appendChild(iconOption);
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
  const listItem = document.createElement('div');
  listItem.className = 'list-item';
  
  let valueDisplay = '';
  const imgPrev = document.createElement('img');
  imgPrev.style.width = '24px';
  imgPrev.style.height = '24px';
  imgPrev.style.borderRadius = '4px';
  let ruleType = settingKey.includes('/') ? "Prefix" : "Keyword";
  let iconType = 'unknown'; // To track icon source for editing

  // Icon processing display (Determine iconType)
  if (iconIdentifier.startsWith('data:image/')) {
    imgPrev.src = iconIdentifier;
    valueDisplay = getMessage('uploadedResizedIcon');
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
      valueDisplay = `${getMessage('bundled')}: ${iconIdentifier}`;
      iconType = 'bundled';
    } catch (e) {
      imgPrev.style.display = 'none';
      valueDisplay = `${getMessage('bundled')}: ${iconIdentifier} (Error?)`;
      iconType = 'bundled_error'; // Indicate potential issue
    }
  }
  
  // Create icon container
  const iconContainer = document.createElement('div');
  iconContainer.className = 'list-item-icon';
  iconContainer.appendChild(imgPrev);
  
  // Create content container
  const contentContainer = document.createElement('div');
  contentContainer.className = 'list-item-content';
  
  const primaryText = document.createElement('div');
  primaryText.className = 'list-item-primary';
  const localizedRuleType = ruleType === "Prefix" ? getMessage('prefix') : getMessage('keyword');
  primaryText.textContent = `${settingKey}`;
  
  const secondaryText = document.createElement('div');
  secondaryText.className = 'list-item-secondary';
  secondaryText.innerHTML = `<i class="material-icons" style="font-size: 14px; vertical-align: middle; margin-right: 4px;">${ruleType === 'Prefix' ? 'link' : 'search'}</i>${localizedRuleType} • ${valueDisplay}`;
  
  contentContainer.appendChild(primaryText);
  contentContainer.appendChild(secondaryText);

  // --- Add Click Listener for Editing ---
  contentContainer.addEventListener('click', () => {
    console.log(`Editing setting: ${settingKey}`);
    // Populate the rule input
    domainInput.value = settingKey;

    // Clear existing icon inputs/selections
    faviconUrlInput.value = '';
    iconUploadInput.value = '';
    document.querySelectorAll('input[name="bundledIconSelection"]').forEach(radio => radio.checked = false);

    // Set the icon source based on the type and open appropriate accordion
    if (iconType === 'url') {
      faviconUrlInput.value = iconIdentifier;
      // Open URL accordion
      openAccordionSection('url');
    } else if (iconType === 'bundled') {
      const radioToSelect = document.querySelector(`input[name="bundledIconSelection"][value="${iconIdentifier}"]`);
      if (radioToSelect) {
        radioToSelect.checked = true;
      }
      // Open bundled accordion
      openAccordionSection('bundled');
    } else if (iconType === 'data'){
      // Can't pre-fill file input or easily show Data URL preview here.
      // User must select a new source if they want to change the icon.
      alert(getMessage('editingUploadedIcon'));
      // Open upload accordion
      openAccordionSection('upload');
    } else {
      // Bundled error or unknown - clear fields
    }
    
    // Scroll to top of page to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    domainInput.focus(); // Focus the input field
  });
  // --- End Click Listener ---

  const deleteButton = document.createElement('button');
  deleteButton.className = 'btn btn-secondary';
  deleteButton.innerHTML = `<i class="material-icons" style="font-size: 18px;">delete</i>`;
  deleteButton.title = getMessage('delete');
  deleteButton.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent triggering the edit click
    // Optionally clear form if deleting the item being edited
    if (domainInput.value === settingKey) {
      domainInput.value = '';
      faviconUrlInput.value = '';
      iconUploadInput.value = '';
      document.querySelectorAll('input[name="bundledIconSelection"]').forEach(radio => radio.checked = false);
    }
    deleteSetting(settingKey);
  });

  listItem.appendChild(iconContainer);
  listItem.appendChild(contentContainer);
  listItem.appendChild(deleteButton);
  settingsListDiv.appendChild(listItem);
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
    saveButton.classList.add('saving');
    saveButton.querySelector('span').textContent = getMessage('saving');

    let ruleInput = domainInput.value.trim();
    const faviconUrlInputVal = faviconUrlInput.value.trim();
    const file = iconUploadInput.files[0];
    const selectedBundledIconRadio = document.querySelector('input[name="bundledIconSelection"]:checked');
    const bundledIconValue = selectedBundledIconRadio ? selectedBundledIconRadio.value : null;

    // --- Input Validation (Rule and Icon Source Count) ---
    if (!ruleInput) {
        alert(getMessage('enterMatchingRule'));
        saveButton.disabled = false; 
        saveButton.classList.remove('saving');
        saveButton.querySelector('span').textContent = getMessage('saveSetting');
        return;
    }
    // Removed Regex Validation

    const sourcesProvided = [faviconUrlInputVal, file, bundledIconValue].filter(Boolean).length;
    if (sourcesProvided === 0) {
        alert(getMessage('provideIconSource'));
        saveButton.disabled = false; 
        saveButton.classList.remove('saving');
        saveButton.querySelector('span').textContent = getMessage('saveSetting');
        return;
    } else if (sourcesProvided > 1) {
        alert(getMessage('oneIconSourceOnly'));
        saveButton.disabled = false; 
        saveButton.classList.remove('saving');
        saveButton.querySelector('span').textContent = getMessage('saveSetting');
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
            alert(getMessage('invalidUrlPrefix', [ruleInput]));
            saveButton.disabled = false; 
            saveButton.classList.remove('saving');
            saveButton.querySelector('span').textContent = getMessage('saveSetting');
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
                throw new Error(getMessage('invalidUrlFormat'));
            }
            try {
                const response = await fetch(faviconUrlInputVal, { method: 'HEAD' });
                if (!response.ok) {
                     const getResponse = await fetch(faviconUrlInputVal);
                     if (!getResponse.ok) throw new Error(getMessage('fetchFailed', [getResponse.status]));
                     const contentType = getResponse.headers.get('Content-Type');
                     if (!contentType || !contentType.startsWith('image/')) throw new Error(getMessage('notAnImageGet'));
                } else {
                    const contentType = response.headers.get('Content-Type');
                    if (!contentType || !contentType.startsWith('image/')) throw new Error(getMessage('notAnImageHead'));
                }
            } catch (fetchError) {
                throw new Error(getMessage('urlCheckFailed', [fetchError.message]));
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
                clearForm(); // Use clearForm function to reset everything including accordion
                loadSettings();
                saveButton.disabled = false; 
                saveButton.classList.remove('saving');
                saveButton.querySelector('span').textContent = getMessage('saveSetting');
            });
        });

    } catch (error) {
        console.error("Error processing icon or saving settings:", error);
        alert(getMessage('errorPrefix', [error.message]));
        saveButton.disabled = false; 
        saveButton.classList.remove('saving');
        saveButton.querySelector('span').textContent = getMessage('saveSetting');
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
    
    // Reset accordion state
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.classList.remove('active', 'completed');
    });
    document.querySelectorAll('.accordion-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.accordion-status').forEach(status => {
        status.innerHTML = '';
    });
    currentActiveSource = null;
    
    domainInput.focus(); // Set focus back to the first input
}
// --- End Clear Form Function ---

// Event listeners and initial population
saveButton.addEventListener('click', saveSetting);
clearFormButton.addEventListener('click', clearForm); // Function to initialize language selector
function initLanguageSelector() {
  const languageSelect = document.getElementById('languageSelect');
  if (!languageSelect) return;
  
  // Set current language
  languageSelect.value = currentLanguage;
  
  // Add event listener for language changes
  languageSelect.addEventListener('change', async (e) => {
    const newLanguage = e.target.value;
    await saveLanguageSetting(newLanguage);
    
    // Reload the interface with new language
    await setupLocalizedText();
    
    // Show success message
    console.log(`Language changed to: ${newLanguage}`);
  });
}

// Function to initialize help accordions
function initHelpAccordions() {
  const helpHeaders = document.querySelectorAll('.help-accordion-header');
  
  helpHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const isActive = header.classList.contains('active');
      
      // Close all other help accordions
      helpHeaders.forEach(otherHeader => {
        if (otherHeader !== header) {
          otherHeader.classList.remove('active');
          otherHeader.nextElementSibling.classList.remove('active');
        }
      });
      
      // Toggle current accordion
      if (isActive) {
        header.classList.remove('active');
        content.classList.remove('active');
      } else {
        header.classList.add('active');
        content.classList.add('active');
      }
    });
  });
}

// Function to refresh interface with current language
async function refreshInterface() {
  await setupLocalizedText();
  populateBundledIcons();
  loadSettings();
  initAccordion();
  initLanguageSelector();
  initHelpAccordions();
}

// Renamed function and updated listener
document.addEventListener('DOMContentLoaded', async () => {
    // Load language setting first
    await loadLanguageSetting();
    
    // Initialize interface
    await refreshInterface();
}); 