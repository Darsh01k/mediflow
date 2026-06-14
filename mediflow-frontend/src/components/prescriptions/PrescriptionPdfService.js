import html2pdf from 'html2pdf.js';

const sanitizeElement = (originalEl, cloneEl, logStats) => {
  const computedStyle = window.getComputedStyle(originalEl);
  
  // Properties that might contain unsupported oklch() or color-mix()
  const propertiesToSanitize = [
    'color',
    'backgroundColor',
    'borderColor',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
    'outlineColor'
  ];

  propertiesToSanitize.forEach(prop => {
    let val = computedStyle[prop];
    if (val) {
      // Resolve unsupported values
      if (val.includes('oklch') || val.includes('color-mix')) {
        logStats.unsupportedStyles.push(`${originalEl.tagName} - ${prop}: ${val}`);
        if (prop.toLowerCase().includes('border')) {
          val = '#cbd5e1'; // fallback standard border color
        } else if (prop.toLowerCase().includes('background')) {
          val = '#ffffff'; // fallback background
        } else {
          val = '#111827'; // fallback text color
        }
      }
      cloneEl.style[prop] = val;
    }
  });

  // Clear unsupported layout filters, shadows, and backdrop filters
  const stylesToClear = ['backdropFilter', 'webkitBackdropFilter', 'filter', 'boxShadow', 'textShadow'];
  stylesToClear.forEach(styleProp => {
    const val = computedStyle[styleProp];
    if (val && val !== 'none' && val !== 'initial') {
      logStats.unsupportedStyles.push(`${originalEl.tagName} - ${styleProp}: ${val}`);
      cloneEl.style[styleProp] = 'none';
    }
  });

  // Strip complex gradient backgrounds
  const backgroundImage = computedStyle.backgroundImage;
  if (backgroundImage && (backgroundImage.includes('gradient') || backgroundImage.includes('url'))) {
    logStats.unsupportedStyles.push(`${originalEl.tagName} - backgroundImage: ${backgroundImage}`);
    cloneEl.style.backgroundImage = 'none';
  }

  // Enforce print-safe styling class on all nodes in the printable tree
  cloneEl.classList.add('print-safe');

  // Recursively sanitize children
  logStats.elementCount++;
  for (let i = 0; i < originalEl.children.length; i++) {
    if (originalEl.children[i] && cloneEl.children[i]) {
      sanitizeElement(originalEl.children[i], cloneEl.children[i], logStats);
    }
  }
};

export const sanitizeClone = (originalElement) => {
  console.log('[PDF Sanitizer] Initiating DOM clone and sanitization sweep...');
  const clone = originalElement.cloneNode(true);
  
  // Render clone offscreen so computed styles are preserved but it remains hidden
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '-9999px';
  clone.style.display = 'block';
  clone.style.width = originalElement.offsetWidth + 'px';
  document.body.appendChild(clone);

  const logStats = {
    elementCount: 0,
    unsupportedStyles: []
  };

  sanitizeElement(originalElement, clone, logStats);

  console.log(`[PDF Sanitizer] Sanitization complete. ${logStats.elementCount} elements processed.`);
  if (logStats.unsupportedStyles.length > 0) {
    console.warn('[PDF Sanitizer] Unsupported styles found and resolved:', logStats.unsupportedStyles.length, 'occurrences');
  }

  return clone;
};

export const downloadPrescriptionPdf = async (prescription, elementId = 'printable-prescription') => {
  console.log('[PDF Service] Triggered downloadPrescriptionPdf for element:', elementId);
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('[PDF Service] Element not found in DOM:', elementId);
    throw new Error('Prescription template element not found in DOM.');
  }

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

  console.log('[PDF Service] Generating download file name:', filename);

  const clone = sanitizeClone(element);

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

  try {
    console.log('[PDF Service] Initiating html2pdf download conversion on sanitized clone...');
    await html2pdf().from(clone).set(opt).save();
    console.log('[PDF Service] PDF download complete successfully.');
  } catch (err) {
    console.error('[PDF Service] Error generating downloadable PDF:', err);
    throw err;
  } finally {
    if (clone && clone.parentNode) {
      clone.parentNode.removeChild(clone);
    }
  }
};

export const printPrescription = async (prescription, elementId = 'printable-prescription') => {
  console.log('[PDF Service] Triggered printPrescription (via blob container) for element:', elementId);
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('[PDF Service] Element not found in DOM:', elementId);
    throw new Error('Prescription template element not found in DOM.');
  }

  const patientName = `${prescription.patient.user?.firstName || ''}${prescription.patient.user?.lastName || ''}`.replace(/[^a-zA-Z0-9]/g, '');
  const dateObj = prescription.createdAt ? new Date(prescription.createdAt) : new Date();
  const YYYY = dateObj.getFullYear();
  const MM = String(dateObj.getMonth() + 1).padStart(2, '0');
  const DD = String(dateObj.getDate()).padStart(2, '0');
  const HH = String(dateObj.getHours()).padStart(2, '0');
  const mm = String(dateObj.getMinutes()).padStart(2, '0');
  const formattedDateTime = `${YYYY}-${MM}-${DD}_${HH}-${mm}`;
  const filename = `MediFlow_Prescription_${patientName}_${formattedDateTime}.pdf`;

  const clone = sanitizeClone(element);

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

  try {
    console.log('[PDF Service] Initiating html2pdf print blob conversion on sanitized clone...');
    const pdfBlob = await html2pdf().from(clone).set(opt).output('blob');
    console.log('[PDF Service] PDF print blob created. Size:', pdfBlob.size, 'bytes');
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, '_blank');
    console.log('[PDF Service] Print PDF blob opened in new tab.');
  } catch (err) {
    console.error('[PDF Service] Error generating print blob PDF:', err);
    throw err;
  } finally {
    if (clone && clone.parentNode) {
      clone.parentNode.removeChild(clone);
    }
  }
};
