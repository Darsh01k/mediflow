import html2pdf from 'html2pdf.js';

const stripParentStylesheets = () => {
  console.log('[PDF Service] Temporarily stripping parent window stylesheets to avoid oklch parsing crashes...');
  const elements = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
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

export const generatePrescriptionDocument = async (prescription, elementId = 'printable-prescription') => {
  console.log('[PDF Service] Triggered isolated document generation for element:', elementId);
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('[PDF Service] Element not found in DOM:', elementId);
    throw new Error('Prescription template element not found in DOM.');
  }

  // Create isolated sandbox iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '800px';
  iframe.style.height = '1200px';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  iframe.style.border = 'none';
  iframe.style.background = '#ffffff';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Prescription Sandbox</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            color: #111827;
            background-color: #ffffff;
            margin: 0;
            padding: 24px;
            box-sizing: border-box;
          }
          .prescription-print-container {
            width: 100%;
            max-width: 750px;
            margin: 0 auto;
            background-color: #ffffff;
            color: #111827;
          }
          .prescription-grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }
          .prescription-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            text-align: left;
            margin-top: 12px;
          }
          .prescription-table th {
            padding: 10px 12px;
            background-color: #f3f4f6;
            color: #374151;
            font-weight: 800;
            border-bottom: 2px solid #d1d5db;
          }
          .prescription-table td {
            padding: 10px 12px;
            color: #4b5563;
            border-bottom: 1px solid #e5e7eb;
          }
          .print-safe {
            color: #111827 !important;
            background-color: #ffffff !important;
            border-color: #d1d5db !important;
          }
          /* Strip unsupported transitions, shadows, gradients, and filters */
          * {
            box-shadow: none !important;
            text-shadow: none !important;
            background-image: none !important;
            filter: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            transition: none !important;
            animation: none !important;
          }
        </style>
      </head>
      <body>
        <div id="prescription-target"></div>
      </body>
    </html>
  `);
  iframeDoc.close();

  // Clone original element and place inside isolated sandbox
  const target = iframeDoc.getElementById('prescription-target');
  const clone = element.cloneNode(true);
  target.appendChild(clone);

  return { iframe, target: clone };
};

export const downloadPrescriptionPdf = async (prescription, elementId = 'printable-prescription') => {
  let sandbox = null;
  let savedStyles = [];
  try {
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

    // Create sandbox iframe
    sandbox = await generatePrescriptionDocument(prescription, elementId);

    // Sanitize all colors inside the clone
    sanitizeColorsForPdf(sandbox.target);

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

    console.log('[PDF Service] Running html2pdf generator...');
    await html2pdf().from(sandbox.target).set(opt).save();
    console.log('[PDF Service] PDF download complete successfully.');
  } catch (err) {
    console.error('[PDF Service] PDF download failed:', err);
    throw err;
  } finally {
    // Restore parent stylesheets
    restoreParentStylesheets(savedStyles);
    
    // Cleanup sandbox iframe
    if (sandbox && sandbox.iframe && sandbox.iframe.parentNode) {
      sandbox.iframe.parentNode.removeChild(sandbox.iframe);
      console.log('[PDF Service] Sandbox iframe cleaned up.');
    }
  }
};

export const printPrescription = async (prescription, elementId = 'printable-prescription') => {
  let sandbox = null;
  let savedStyles = [];
  try {
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

    // Create sandbox iframe
    sandbox = await generatePrescriptionDocument(prescription, elementId);

    // Sanitize colors inside the clone
    sanitizeColorsForPdf(sandbox.target);

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

    console.log('[PDF Service] Running html2pdf print generator...');
    const pdfBlob = await html2pdf().from(sandbox.target).set(opt).output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, '_blank');
    console.log('[PDF Service] Print PDF blob opened.');
  } catch (err) {
    console.error('[PDF Service] Print failed:', err);
    throw err;
  } finally {
    // Restore parent stylesheets
    restoreParentStylesheets(savedStyles);
    
    // Cleanup sandbox iframe
    if (sandbox && sandbox.iframe && sandbox.iframe.parentNode) {
      sandbox.iframe.parentNode.removeChild(sandbox.iframe);
      console.log('[PDF Service] Sandbox iframe cleaned up.');
    }
  }
};
