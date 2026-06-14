import html2pdf from 'html2pdf.js';

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

  // Perform computed styles copy and oklch sweep
  const logStats = {
    elementCount: 0,
    unsupportedStyles: []
  };

  const sanitizeAndResolveStyles = (originalEl, cloneEl, stats) => {
    const computedStyle = window.getComputedStyle(originalEl);
    
    // Properties that might contain unsupported oklch(), color-mix() or var()
    const colorProperties = [
      'color',
      'backgroundColor',
      'borderColor',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
      'outlineColor'
    ];

    colorProperties.forEach(prop => {
      let val = computedStyle[prop];
      if (val) {
        // Resolve unsupported values
        if (val.includes('oklch') || val.includes('color-mix') || val.includes('var(')) {
          console.log('[PDF Service] Found oklch/color-mix/var in style:', val);
          stats.unsupportedStyles.push(`${originalEl.tagName} - ${prop}: ${val}`);
          if (prop.toLowerCase().includes('border')) {
            val = '#cbd5e1';
          } else if (prop.toLowerCase().includes('background')) {
            val = '#ffffff';
          } else {
            val = '#111827';
          }
        }
        cloneEl.style[prop] = val;
      }
    });

    // Clear unsupported layout filters, shadows, transitions, and backdrop filters
    const stylesToClear = ['backdropFilter', 'webkitBackdropFilter', 'filter', 'boxShadow', 'textShadow'];
    stylesToClear.forEach(styleProp => {
      const val = computedStyle[styleProp];
      if (val && val !== 'none' && val !== 'initial') {
        stats.unsupportedStyles.push(`${originalEl.tagName} - ${styleProp}: ${val}`);
        cloneEl.style[styleProp] = 'none';
      }
    });

    // Strip complex gradient backgrounds
    const backgroundImage = computedStyle.backgroundImage;
    if (backgroundImage && (backgroundImage.includes('gradient') || backgroundImage.includes('url'))) {
      stats.unsupportedStyles.push(`${originalEl.tagName} - backgroundImage: ${backgroundImage}`);
      cloneEl.style.backgroundImage = 'none';
    }

    // Recursively sanitize children
    stats.elementCount++;
    for (let i = 0; i < originalEl.children.length; i++) {
      if (originalEl.children[i] && cloneEl.children[i]) {
        sanitizeAndResolveStyles(originalEl.children[i], cloneEl.children[i], stats);
      }
    }
  };

  sanitizeAndResolveStyles(element, clone, logStats);

  console.log(`[PDF Service] Sandbox compilation complete. ${logStats.elementCount} elements sanitized.`);
  if (logStats.unsupportedStyles.length > 0) {
    console.log('[PDF Service] Resolved oklch or variables inside DOM:', logStats.unsupportedStyles.length, 'occurrences');
  }

  return { iframe, target: clone };
};

export const downloadPrescriptionPdf = async (prescription, elementId = 'printable-prescription') => {
  let sandbox = null;
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

    sandbox = await generatePrescriptionDocument(prescription, elementId);

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

    console.log('[PDF Service] Initiating download conversion inside isolated sandbox...');
    await html2pdf().from(sandbox.target).set(opt).save();
    console.log('[PDF Service] PDF download complete successfully.');
  } catch (err) {
    console.error('[PDF Service] PDF download failed:', err);
    throw err;
  } finally {
    if (sandbox && sandbox.iframe && sandbox.iframe.parentNode) {
      sandbox.iframe.parentNode.removeChild(sandbox.iframe);
      console.log('[PDF Service] Sandbox iframe cleaned up.');
    }
  }
};

export const printPrescription = async (prescription, elementId = 'printable-prescription') => {
  let sandbox = null;
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
    console.log('[PDF Service] Printing prescription PDF:', filename);

    sandbox = await generatePrescriptionDocument(prescription, elementId);

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

    console.log('[PDF Service] Initiating print blob conversion inside isolated sandbox...');
    const pdfBlob = await html2pdf().from(sandbox.target).set(opt).output('blob');
    console.log('[PDF Service] PDF print blob created. Size:', pdfBlob.size, 'bytes');
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, '_blank');
    console.log('[PDF Service] Print PDF blob opened in new tab.');
  } catch (err) {
    console.error('[PDF Service] PDF print generation failed:', err);
    throw err;
  } finally {
    if (sandbox && sandbox.iframe && sandbox.iframe.parentNode) {
      sandbox.iframe.parentNode.removeChild(sandbox.iframe);
      console.log('[PDF Service] Sandbox iframe cleaned up.');
    }
  }
};
