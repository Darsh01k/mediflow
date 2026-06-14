import html2pdf from 'html2pdf.js';

export const downloadPrescriptionPdf = (prescription, elementId = 'printable-prescription') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Prescription element not found');
    return;
  }

  const patientName = `${prescription.patient.user?.firstName || ''}${prescription.patient.user?.lastName || ''}`.replace(/[^a-zA-Z0-9]/g, '');
  const dateObj = prescription.createdAt ? new Date(prescription.createdAt) : new Date();
  const YYYY = dateObj.getFullYear();
  const MM = String(dateObj.getMonth() + 1).padStart(2, '0');
  const DD = String(dateObj.getDate()).padStart(2, '0');
  const HH = String(dateObj.getHours()).padStart(2, '0');
  const mm = String(dateObj.getMinutes()).padStart(2, '0');
  const formattedDateTime = `${YYYY}-${MM}-${DD}_${HH}-${mm}`;
  const filename = `MediFlow_${patientName}_${formattedDateTime}.pdf`;

  const opt = {
    margin:       [0.4, 0.4, 0.4, 0.4],
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  return html2pdf().from(element).set(opt).save();
};

export const printPrescription = (prescription) => {
  const patientName = `${prescription.patient.user?.firstName || ''}${prescription.patient.user?.lastName || ''}`.replace(/[^a-zA-Z0-9]/g, '');
  const dateObj = prescription.createdAt ? new Date(prescription.createdAt) : new Date();
  const YYYY = dateObj.getFullYear();
  const MM = String(dateObj.getMonth() + 1).padStart(2, '0');
  const DD = String(dateObj.getDate()).padStart(2, '0');
  const HH = String(dateObj.getHours()).padStart(2, '0');
  const mm = String(dateObj.getMinutes()).padStart(2, '0');
  const formattedDateTime = `${YYYY}-${MM}-${DD}_${HH}-${mm}`;
  const filename = `MediFlow_${patientName}_${formattedDateTime}`;

  const originalTitle = document.title;
  document.title = filename;
  
  window.print();
  
  setTimeout(() => {
    document.title = originalTitle;
  }, 1000);
};
