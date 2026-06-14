import html2pdf from 'html2pdf.js';

const sanitizeImagesForPdf = (clone) => {
  const images = clone.getElementsByTagName('img');
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    
    // Log the image audit
    console.log('[PDF Service] Sanitizing image styles:', img.src || 'inline');

    // Force fixed dimensions inside the PDF clone
    img.style.width = '56px';
    img.style.height = '56px';
    img.style.minWidth = '56px';
    img.style.minHeight = '56px';
    img.style.maxWidth = '56px';
    img.style.maxHeight = '56px';
    img.style.objectFit = 'cover';
    img.style.display = 'block';

    // Prevent image stretching
    img.style.transform = 'none';
    img.style.scale = '1';
    img.style.position = 'static';

    // Strip class names to ensure no CSS rules or utility classes can override inline size
    img.className = '';

    // Direct attributes to ensure fallback is 56x56
    img.setAttribute('width', '56');
    img.setAttribute('height', '56');
  }
};

export const sanitizeColorsForPdf = (rootElement) => {
  console.log('[PDF SANITIZER] Starting oklch and CSS custom property cleanup sweep...');
  const doc = rootElement.ownerDocument;
  const win = doc.defaultView || window;
  
  let elementsSanitized = 0;

  const walkElement = (el) => {
    if (el.nodeType !== 1) return; // Process only element nodes

    const computedStyle = win.getComputedStyle(el);

    // Common color-related properties
    const colorProps = [
      'color',
      'backgroundColor',
      'borderColor',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
      'outlineColor',
      'fill',
      'stroke'
    ];

    colorProps.forEach(prop => {
      const val = computedStyle[prop];
      if (val) {
        const hasOklch = val.includes('oklch');
        const hasLch = val.includes('lch');
        const hasLab = val.includes('lab');
        const hasColorMix = val.includes('color-mix');

        if (hasOklch || hasLch || hasLab || hasColorMix) {
          console.log(`[PDF AUDIT] Found unsupported style in element ${el.tagName}.${el.className || ''}: ${prop} = ${val}`);
          
          let fallback = '#0f172a'; // text color fallback
          if (prop.toLowerCase().includes('background')) {
            fallback = '#ffffff'; // background color fallback
          } else if (prop.toLowerCase().includes('border') || prop === 'outlineColor') {
            fallback = '#cbd5e1'; // border color fallback
          } else if (prop === 'fill' || prop === 'stroke') {
            fallback = prop === 'fill' ? 'none' : '#0f766e';
          }

          console.log(`[PDF COLOR FIX] Replacing color for ${prop}: ${val} => ${fallback}`);
          el.style[prop] = fallback;
          elementsSanitized++;
        } else {
          // Explicitly lock in the standard resolved color to prevent inheritance of variables
          el.style[prop] = val;
        }
      }
    });

    // Clear unsupported layout filters, shadows, and backdrop filters
    const stylesToClear = ['backdropFilter', 'webkitBackdropFilter', 'filter', 'boxShadow', 'textShadow'];
    stylesToClear.forEach(styleProp => {
      const val = computedStyle[styleProp];
      if (val && val !== 'none' && val !== 'initial') {
        console.log(`[PDF SANITIZER] Clearing unsupported style ${styleProp} for ${el.tagName}: ${val}`);
        el.style[styleProp] = 'none';
      }
    });

    // Strip complex gradient backgrounds
    const backgroundImage = computedStyle.backgroundImage;
    if (backgroundImage && (backgroundImage.includes('gradient') || backgroundImage.includes('url'))) {
      console.log(`[PDF SANITIZER] Clearing gradient background for ${el.tagName}: ${backgroundImage}`);
      el.style.backgroundImage = 'none';
    }

    // Strip CSS Custom variables directly from inline style attribute
    if (el.style) {
      for (let i = el.style.length - 1; i >= 0; i--) {
        const propName = el.style[i];
        if (propName && propName.startsWith('--')) {
          console.log(`[PDF SANITIZER] Stripping custom variable: ${propName}`);
          el.style.removeProperty(propName);
        }
      }
    }

    // Recurse children
    for (let i = 0; i < el.children.length; i++) {
      walkElement(el.children[i]);
    }
  };

  walkElement(rootElement);
  console.log(`[PDF SANITIZER] Color sanitization sweep completed. Total elements processed: ${elementsSanitized}`);
};

const stripParentStylesheets = () => {
  console.log('[PDF Service] Temporarily stripping parent window stylesheets to avoid oklch parsing crashes...');
  const elements = Array.from(document.querySelectorAll('link[rel="stylesheet"], style:not(#pdf-safe-style)'));
  const savedElements = [];
  elements.forEach(el => {
    const parent = el.parentNode;
    const nextSibling = el.nextSibling;
    if (parent) {
      parent.removeChild(el);
      savedElements.push({ element: el, parent, nextSibling });
    }
  });

  // Backup and clear adoptedStyleSheets
  let savedAdopted = [];
  if (document.adoptedStyleSheets) {
    savedAdopted = [...document.adoptedStyleSheets];
    try {
      document.adoptedStyleSheets = [];
    } catch (e) {
      console.warn('[PDF Service] Failed to clear document.adoptedStyleSheets:', e);
    }
  }

  // Backup and clean inline style attributes on html and body tags
  const savedHtmlStyle = document.documentElement.getAttribute('style');
  const savedBodyStyle = document.body.getAttribute('style');

  const cleanInlineStyle = (el) => {
    if (!el || !el.style) return;
    for (let i = el.style.length - 1; i >= 0; i--) {
      const prop = el.style[i];
      if (prop) {
        const val = el.style.getPropertyValue(prop);
        if (val && (val.includes('oklch') || val.includes('var(') || val.includes('color-mix') || prop.startsWith('--'))) {
          el.style.removeProperty(prop);
        }
      }
    }
  };

  cleanInlineStyle(document.documentElement);
  cleanInlineStyle(document.body);

  return {
    savedElements,
    savedAdopted,
    savedHtmlStyle,
    savedBodyStyle
  };
};

const restoreParentStylesheets = (savedData) => {
  console.log('[PDF Service] Restoring parent window stylesheets...');
  if (!savedData) return;

  // Restore elements
  if (savedData.savedElements) {
    savedData.savedElements.forEach(item => {
      if (item.nextSibling && item.nextSibling.parentNode === item.parent) {
        item.parent.insertBefore(item.element, item.nextSibling);
      } else {
        item.parent.appendChild(item.element);
      }
    });
  }

  // Restore adoptedStyleSheets
  if (document.adoptedStyleSheets && savedData.savedAdopted && savedData.savedAdopted.length > 0) {
    try {
      document.adoptedStyleSheets = savedData.savedAdopted;
    } catch (e) {
      console.warn('[PDF Service] Failed to restore document.adoptedStyleSheets:', e);
    }
  }

  // Restore html/body style attributes
  if (savedData.savedHtmlStyle !== null && savedData.savedHtmlStyle !== undefined) {
    document.documentElement.setAttribute('style', savedData.savedHtmlStyle);
  } else {
    document.documentElement.removeAttribute('style');
  }

  if (savedData.savedBodyStyle !== null && savedData.savedBodyStyle !== undefined) {
    document.body.setAttribute('style', savedData.savedBodyStyle);
  } else {
    document.body.removeAttribute('style');
  }
};

const showLoadingOverlay = () => {
  const overlay = document.createElement('div');
  overlay.id = 'pdf-loading-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = '#ffffff';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '999999';
  overlay.style.fontFamily = 'system-ui, sans-serif';
  overlay.style.color = '#0f172a';
  
  overlay.innerHTML = `
    <div style="border: 4px solid #cbd5e1; border-top: 4px solid #0f766e; border-radius: 50%; width: 40px; height: 40px; animation: pdf-spin 1s linear infinite;"></div>
    <div style="margin-top: 16px; font-weight: 700; font-size: 16px; color: #0f172a;">Generating Prescription PDF...</div>
    <div style="margin-top: 8px; color: #64748b; font-size: 14px;">Please wait while we compile your document.</div>
    <style>
      @keyframes pdf-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  document.body.appendChild(overlay);
  return overlay;
};

const hideLoadingOverlay = (overlay) => {
  if (overlay && overlay.parentNode) {
    overlay.parentNode.removeChild(overlay);
  }
};

export const scanForUnsupportedColors = () => {
  console.log('[PDF Service] Beginning document.styleSheets audit for unsupported colors...');
  let oklchCount = 0;
  const offendingRules = [];
  
  const sheets = Array.from(document.styleSheets);
  sheets.forEach((sheet, sheetIndex) => {
    try {
      const rules = Array.from(sheet.cssRules || sheet.rules || []);
      rules.forEach((rule, ruleIndex) => {
        const cssText = rule.cssText;
        if (cssText) {
          const hasOklch = cssText.includes('oklch');
          const hasOklab = cssText.includes('oklab');
          const hasLch = cssText.includes('lch(');
          const hasLab = cssText.includes('lab(');
          const hasColorMix = cssText.includes('color-mix(');
          
          if (hasOklch || hasOklab || hasLch || hasLab || hasColorMix) {
            oklchCount++;
            const selectorText = rule.selectorText || `Rule #${ruleIndex}`;
            const sourceHref = sheet.href || 'inline/dynamic style';
            offendingRules.push({
              sheetIndex,
              sourceHref,
              selector: selectorText,
              cssText: cssText.substring(0, 150) + (cssText.length > 150 ? '...' : '')
            });
          }
        }
      });
    } catch (e) {
      // Cross-origin stylesheet access security errors are common for external links
    }
  });

  console.log('[PDF DEBUG] Found OKLCH styles:', oklchCount);
  if (offendingRules.length > 0) {
    console.log('[PDF Service] Detailed list of offending CSS selectors:');
    offendingRules.forEach(rule => {
      console.log(`- Selector: "${rule.selector}" in sheet "${rule.sourceHref}" contains unsupported style.`);
      console.log(`  CSS snippet: ${rule.cssText}`);
    });
  } else {
    console.log('[PDF Service] No offending CSS rules found in accessible document.styleSheets.');
  }

  return oklchCount;
};

export const downloadPrescriptionPdf = async (prescription, elementId = 'printable-prescription') => {
  let container = null;
  let tempStyle = null;
  let pdfModeStyle = null;
  let loadingOverlay = null;
  let savedStyles = null;
  
  try {
    // Enable PDF Safe Mode
    document.documentElement.classList.add("pdf-mode");
    console.log("[PDF SAFE MODE] enabled");

    // Diagnostic scan
    scanForUnsupportedColors();

    // Show loading overlay
    loadingOverlay = showLoadingOverlay();

    const patientName = `${prescription.patient.user?.firstName || ''}${prescription.patient.user?.lastName || ''}`.replace(/[^a-zA-Z0-9]/g, '');
    const dateObj = prescription.createdAt ? new Date(prescription.createdAt) : new Date();
    const YYYY = dateObj.getFullYear();
    const MM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const DD = String(dateObj.getDate()).padStart(2, '0');
    const HH = String(dateObj.getHours()).padStart(2, '0');
    const mm = String(dateObj.getMinutes()).padStart(2, '0');
    const formattedDateTime = `${YYYY}-${MM}-${DD}_${HH}-${mm}`;
    
    // Format requested: MediFlow_Prescription_<PatientName>_<YYYY-MM-DD_HH-mm>.pdf
    const filename = `MediFlow_Prescription_${patientName}_${formattedDateTime}.pdf`;
    console.log('[PDF Service] Downloading PDF:', filename);

    // Create an off-screen container
    container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-99999px';
    container.style.top = '0';
    container.style.visibility = 'hidden';
    container.style.width = '800px';
    container.style.height = '1200px';
    container.style.overflow = 'hidden';
    container.style.backgroundColor = '#ffffff';
    document.body.appendChild(container);
    console.log('[PDF Service] Hidden PDF container created');

    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Prescription template element not found in DOM.');
    }

    // Render the cloned prescription only inside this hidden container
    const clone = element.cloneNode(true);
    container.appendChild(clone);

    // Sanitize colors and images inside the clone
    sanitizeColorsForPdf(clone);
    sanitizeImagesForPdf(clone);

    // Create temporary style tag inside the container
    tempStyle = document.createElement('style');
    tempStyle.textContent = `
      .print-safe {
        color: #111827 !important;
        background-color: #ffffff !important;
        border-color: #d1d5db !important;
      }
      .prescription-print-container {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 32px !important;
        border: none !important;
        box-shadow: none !important;
        background: #ffffff !important;
        color: #111827 !important;
        overflow: visible !important;
      }
      .prescription-grid-2 {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 1.5rem !important;
      }
      .prescription-table {
        display: table !important;
        width: 100% !important;
        border-collapse: collapse !important;
      }
      .prescription-table thead {
        display: table-header-group !important;
      }
      .prescription-table tbody {
        display: table-row-group !important;
      }
      .prescription-table tr {
        display: table-row !important;
      }
      .prescription-table th,
      .prescription-table td {
        display: table-cell !important;
        padding: 10px 12px !important;
        border-bottom: 1px solid #e5e7eb !important;
      }
      .prescription-table th {
        background-color: #f3f4f6 !important;
        font-weight: 800 !important;
      }
      * {
        box-shadow: none !important;
        text-shadow: none !important;
        background-image: none !important;
        filter: none !important;
        backdrop-filter: none !important;
        transition: none !important;
      }
    `;
    container.appendChild(tempStyle);

    // Inject PDF-safe styles tag inside document.head
    pdfModeStyle = document.createElement('style');
    pdfModeStyle.id = 'pdf-safe-style';
    pdfModeStyle.textContent = `
      .pdf-mode,
      .pdf-mode * {
        color: #000000 !important;
        background-color: #ffffff !important;
        border-color: #d1d5db !important;
        box-shadow: none !important;
        filter: none !important;
      }
    `;
    document.head.appendChild(pdfModeStyle);

    // Intercept document.styleSheets
    const cleanSheet = tempStyle.sheet;
    const pdfModeSheet = pdfModeStyle.sheet;
    Object.defineProperty(document, 'styleSheets', {
      get: () => {
        const sheets = [];
        if (cleanSheet) sheets.push(cleanSheet);
        if (pdfModeSheet) sheets.push(pdfModeSheet);
        return sheets;
      },
      configurable: true
    });

    const opt = {
      margin:       0.3,
      filename:     filename,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { 
        scale: 3, 
        useCORS: true, 
        allowTaint: true, 
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // Temporarily remove parent window stylesheets
    savedStyles = stripParentStylesheets();

    // Make container visible off-screen for html2canvas
    container.style.visibility = 'visible';
    console.log('[PDF Service] Rendering in isolated container');

    console.log('[PDF Service] Running html2pdf generator...');
    await html2pdf().from(clone).set(opt).save();
    console.log('[PDF Service] PDF download complete successfully.');
  } catch (err) {
    console.error('[PDF Service] PDF download failed:', err);
    throw err;
  } finally {
    // Restore parent stylesheets
    if (savedStyles) {
      restoreParentStylesheets(savedStyles);
    }

    // Restore document.styleSheets getter
    delete document.styleSheets;
    
    // Remove PDF safe style tag
    if (pdfModeStyle && pdfModeStyle.parentNode) {
      pdfModeStyle.parentNode.removeChild(pdfModeStyle);
    }

    // Cleanup container
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      console.log('[PDF Service] Hidden container removed');
    }

    // Hide loading overlay
    hideLoadingOverlay(loadingOverlay);

    // Disable PDF Safe Mode
    document.documentElement.classList.remove("pdf-mode");
    console.log("[PDF SAFE MODE] disabled");
  }
};

export const printPrescription = async (prescription, elementId = 'printable-prescription') => {
  let container = null;
  let tempStyle = null;
  let pdfModeStyle = null;
  let loadingOverlay = null;
  let savedStyles = null;
  let blobUrl = null;
  
  try {
    // Enable PDF Safe Mode
    document.documentElement.classList.add("pdf-mode");
    console.log("[PDF SAFE MODE] enabled");

    // Diagnostic scan
    scanForUnsupportedColors();

    // Show loading overlay
    loadingOverlay = showLoadingOverlay();

    const patientName = `${prescription.patient.user?.firstName || ''}${prescription.patient.user?.lastName || ''}`.replace(/[^a-zA-Z0-9]/g, '');
    const dateObj = prescription.createdAt ? new Date(prescription.createdAt) : new Date();
    const YYYY = dateObj.getFullYear();
    const MM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const DD = String(dateObj.getDate()).padStart(2, '0');
    const HH = String(dateObj.getHours()).padStart(2, '0');
    const mm = String(dateObj.getMinutes()).padStart(2, '0');
    const formattedDateTime = `${YYYY}-${MM}-${DD}_${HH}-${mm}`;
    const filename = `MediFlow_Prescription_${patientName}_${formattedDateTime}.pdf`;
    console.log('[PDF Service] Printing PDF:', filename);

    // Create an off-screen container
    container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-99999px';
    container.style.top = '0';
    container.style.visibility = 'hidden';
    container.style.width = '800px';
    container.style.height = '1200px';
    container.style.overflow = 'hidden';
    container.style.backgroundColor = '#ffffff';
    document.body.appendChild(container);
    console.log('[PDF Service] Hidden PDF container created');

    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Prescription template element not found in DOM.');
    }

    // Render the cloned prescription only inside this hidden container
    const clone = element.cloneNode(true);
    container.appendChild(clone);

    // Sanitize colors and images inside the clone
    sanitizeColorsForPdf(clone);
    sanitizeImagesForPdf(clone);

    // Create temporary style tag inside the container
    tempStyle = document.createElement('style');
    tempStyle.textContent = `
      .print-safe {
        color: #111827 !important;
        background-color: #ffffff !important;
        border-color: #d1d5db !important;
      }
      .prescription-print-container {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 32px !important;
        border: none !important;
        box-shadow: none !important;
        background: #ffffff !important;
        color: #111827 !important;
        overflow: visible !important;
      }
      .prescription-grid-2 {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 1.5rem !important;
      }
      .prescription-table {
        display: table !important;
        width: 100% !important;
        border-collapse: collapse !important;
      }
      .prescription-table thead {
        display: table-header-group !important;
      }
      .prescription-table tbody {
        display: table-row-group !important;
      }
      .prescription-table tr {
        display: table-row !important;
      }
      .prescription-table th,
      .prescription-table td {
        display: table-cell !important;
        padding: 10px 12px !important;
        border-bottom: 1px solid #e5e7eb !important;
      }
      .prescription-table th {
        background-color: #f3f4f6 !important;
        font-weight: 800 !important;
      }
      * {
        box-shadow: none !important;
        text-shadow: none !important;
        background-image: none !important;
        filter: none !important;
        backdrop-filter: none !important;
        transition: none !important;
      }
    `;
    container.appendChild(tempStyle);

    // Inject PDF-safe styles tag inside document.head
    pdfModeStyle = document.createElement('style');
    pdfModeStyle.id = 'pdf-safe-style';
    pdfModeStyle.textContent = `
      .pdf-mode,
      .pdf-mode * {
        color: #000000 !important;
        background-color: #ffffff !important;
        border-color: #d1d5db !important;
        box-shadow: none !important;
        filter: none !important;
      }
    `;
    document.head.appendChild(pdfModeStyle);

    // Intercept document.styleSheets
    const cleanSheet = tempStyle.sheet;
    const pdfModeSheet = pdfModeStyle.sheet;
    Object.defineProperty(document, 'styleSheets', {
      get: () => {
        const sheets = [];
        if (cleanSheet) sheets.push(cleanSheet);
        if (pdfModeSheet) sheets.push(pdfModeSheet);
        return sheets;
      },
      configurable: true
    });

    const opt = {
      margin:       0.3,
      filename:     filename,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { 
        scale: 3, 
        useCORS: true, 
        allowTaint: true, 
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // Temporarily remove parent window stylesheets
    savedStyles = stripParentStylesheets();

    // Make container visible off-screen for html2canvas
    container.style.visibility = 'visible';
    console.log('[PDF Service] Rendering in isolated container');

    console.log('[PDF Service] Running html2pdf print generator...');
    const pdfBlob = await html2pdf().from(clone).set(opt).output('blob');
    blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, '_blank');
    console.log('[PDF Service] Print PDF blob opened.');

    // Revoke blob URL after safe duration
    const targetUrl = blobUrl;
    setTimeout(() => {
      try {
        URL.revokeObjectURL(targetUrl);
        console.log('[PDF Service] Revoked print blob URL:', targetUrl);
      } catch (e) {
        console.error('[PDF Service] Failed to revoke blob URL:', e);
      }
    }, 20000);

  } catch (err) {
    console.error('[PDF Service] Print failed:', err);
    throw err;
  } finally {
    // Restore parent stylesheets
    if (savedStyles) {
      restoreParentStylesheets(savedStyles);
    }

    // Restore document.styleSheets
    delete document.styleSheets;
    
    // Remove PDF safe style tag
    if (pdfModeStyle && pdfModeStyle.parentNode) {
      pdfModeStyle.parentNode.removeChild(pdfModeStyle);
    }

    // Cleanup container
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      console.log('[PDF Service] Hidden container removed');
    }

    // Hide loading overlay
    hideLoadingOverlay(loadingOverlay);

    // Disable PDF Safe Mode
    document.documentElement.classList.remove("pdf-mode");
    console.log("[PDF SAFE MODE] disabled");
  }
};
