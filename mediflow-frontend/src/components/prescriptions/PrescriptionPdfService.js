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

export const downloadPrescriptionPdf = async (prescription, elementId = 'printable-prescription') => {
  let container = null;
  let tempStyle = null;
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

    // Intercept document.styleSheets
    const cleanSheet = tempStyle.sheet;
    Object.defineProperty(document, 'styleSheets', {
      get: () => {
        return cleanSheet ? [cleanSheet] : [];
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
    // Restore document.styleSheets getter
    delete document.styleSheets;
    
    // Cleanup container
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      console.log('[PDF Service] Hidden container removed');
    }
  }
};

export const printPrescription = async (prescription, elementId = 'printable-prescription') => {
  let container = null;
  let tempStyle = null;
  let blobUrl = null;
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

    // Intercept document.styleSheets
    const cleanSheet = tempStyle.sheet;
    Object.defineProperty(document, 'styleSheets', {
      get: () => {
        return cleanSheet ? [cleanSheet] : [];
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
    // Restore document.styleSheets
    delete document.styleSheets;
    
    // Cleanup container
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      console.log('[PDF Service] Hidden container removed');
    }
  }
};
