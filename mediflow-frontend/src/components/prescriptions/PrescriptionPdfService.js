import html2pdf from 'html2pdf.js';

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
    console.log('[PDF Service] Initiating html2pdf download conversion...');
    await html2pdf().from(element).set(opt).save();
    console.log('[PDF Service] PDF download complete successfully.');
  } catch (err) {
    console.error('[PDF Service] Error generating downloadable PDF:', err);
    throw err;
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
    console.log('[PDF Service] Initiating html2pdf print blob conversion...');
    const pdfBlob = await html2pdf().from(element).set(opt).output('blob');
    console.log('[PDF Service] PDF print blob created. Size:', pdfBlob.size, 'bytes');
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, '_blank');
    console.log('[PDF Service] Print PDF blob opened in new tab.');
  } catch (err) {
    console.error('[PDF Service] Error generating print blob PDF:', err);
    throw err;
  }
};
