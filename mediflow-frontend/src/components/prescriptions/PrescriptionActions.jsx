import React from 'react';
import { Eye, Download, Printer } from 'lucide-react';
import Button from '../ui/Button';
import { downloadPrescriptionPdf, printPrescription } from './PrescriptionPdfService';

const PrescriptionActions = ({ prescription, onView, onDownload, onPrint, showView = true, className = "" }) => {
  
  const handlePrintClick = () => {
    if (onPrint) {
      onPrint();
    } else {
      printPrescription(prescription);
    }
  };

  const handleDownloadClick = async () => {
    if (onDownload) {
      onDownload();
    } else {
      await downloadPrescriptionPdf(prescription);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-2 shrink-0 ${className}`}>
      {showView && onView && (
        <Button 
          onClick={onView}
          variant="outline" 
          size="sm"
          icon={Eye}
          className="border-slate-200 hover:border-slate-350 hover:bg-slate-50/80 transition-all font-semibold rounded-xl text-slate-700 flex-1 sm:flex-initial"
        >
          View Prescription
        </Button>
      )}
      <Button 
        onClick={handleDownloadClick}
        variant="outline" 
        size="sm"
        icon={Download}
        className="border-indigo-200 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all font-semibold rounded-xl flex-1 sm:flex-initial"
      >
        Download PDF
      </Button>
      <Button 
        onClick={handlePrintClick}
        variant="outline" 
        size="sm"
        icon={Printer}
        className="border-emerald-200 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all font-semibold rounded-xl flex-1 sm:flex-initial"
      >
        Print Prescription
      </Button>
    </div>
  );
};

export default PrescriptionActions;
