import React, { useState } from 'react';
import { Eye, Download, Printer } from 'lucide-react';
import Button from '../ui/Button';
import { useToast } from '../../context/ToastContext';
import { downloadPrescriptionPdf, printPrescription } from './PrescriptionPdfService';

const PrescriptionActions = ({ prescription, onView, onDownload, onPrint, showView = true, className = "" }) => {
  const toast = useToast();
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  const isBusy = downloading || printing;

  const handlePrintClick = async () => {
    if (onPrint) {
      onPrint();
      return;
    }
    
    try {
      setPrinting(true);
      toast.info('Generating PDF for print preview...');
      await printPrescription(prescription);
      toast.success('Print document opened successfully in new tab.');
    } catch (err) {
      console.error('[PrescriptionActions] Print error:', err);
      toast.error('Failed to generate print document. Please try again.');
    } finally {
      setPrinting(false);
    }
  };

  const handleDownloadClick = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    try {
      setDownloading(true);
      toast.info('Generating PDF download...');
      await downloadPrescriptionPdf(prescription);
      toast.success('Prescription PDF downloaded successfully.');
    } catch (err) {
      console.error('[PrescriptionActions] Download error:', err);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-2 shrink-0 ${className}`}>
      {showView && onView && (
        <Button 
          onClick={onView}
          disabled={isBusy}
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
        loading={downloading}
        disabled={isBusy}
        variant="outline" 
        size="sm"
        icon={Download}
        className="border-indigo-200 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all font-semibold rounded-xl flex-1 sm:flex-initial"
      >
        Download PDF
      </Button>
      <Button 
        onClick={handlePrintClick}
        loading={printing}
        disabled={isBusy}
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
