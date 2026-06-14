import React, { useState } from 'react';
import { HeartPulse } from 'lucide-react';
import './PrescriptionPrint.css';

const PrescriptionTemplate = ({ prescription, elementId = 'printable-prescription' }) => {
  const [logoError, setLogoError] = useState(false);

  if (!prescription) return null;

  const parseMedicines = (jsonStr) => {
    try {
      return jsonStr ? JSON.parse(jsonStr) : [];
    } catch (e) {
      return [];
    }
  };

  const getAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const medicines = parseMedicines(prescription.medicinesJson);

  const renderHospitalLogo = () => {
    const logoId = prescription.hospital.logoAvatar;
    const isValidUrl = logoId && !logoError && (logoId.startsWith('http') || logoId.startsWith('/') || logoId.includes('.'));
    
    if (isValidUrl) {
      return (
        <img 
          src={logoId} 
          alt={prescription.hospital.name} 
          crossOrigin="anonymous"
          className="w-14 h-14 rounded-xl border border-slate-200 shadow-sm shrink-0 object-cover"
          onError={() => setLogoError(true)}
        />
      );
    }
    
    // Fallback initials component
    const initials = prescription.hospital.name
      ? prescription.hospital.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : 'H';

    return (
      <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-emerald-650 to-teal-700 p-0.5 flex items-center justify-center shadow-md shrink-0 border border-slate-200">
        <div className="w-full h-full rounded-xl flex items-center justify-center bg-slate-950/10">
          <span className="fallback-initials text-white font-black text-sm uppercase tracking-tight select-none">
            {initials}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div 
      id={elementId} 
      className="prescription-print-container p-8 md:p-10 space-y-6 text-slate-800 bg-white text-left max-w-[800px] mx-auto print:p-0 print:max-w-none"
    >
      {/* Header Letterhead */}
      <div className="flex justify-between items-start border-b-2 border-emerald-600 pb-5 gap-6">
        <div className="space-y-1.5 text-left flex-1 font-sans">
          <div className="flex items-center gap-3">
            {renderHospitalLogo()}
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase leading-none">
                {prescription.hospital.name}
              </h2>
              <p className="text-[9px] text-emerald-650 font-bold uppercase tracking-wider mt-1">
                Registered Clinic & Hospital
              </p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-semibold max-w-sm leading-relaxed mt-2">
            {prescription.hospital.address}, {prescription.hospital.city}, {prescription.hospital.state} - {prescription.hospital.pincode || ''}
          </p>
          <p className="text-[9px] text-slate-400 font-semibold leading-none pt-0.5">
            Phone: {prescription.hospital.phone} | Email: {prescription.hospital.email || 'contact@hosp.com'}
          </p>
        </div>
        <div className="text-right space-y-1 shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-200/50 print:bg-white print:border-none print:p-0 font-sans">
          <span className="inline-block text-[8px] font-black tracking-wider uppercase bg-emerald-500 text-white px-2.5 py-0.5 rounded-full font-sans">
            PRESCRIPTION
          </span>
          <p className="text-[10px] text-slate-600 font-bold mt-1.5">RX-ID: #{prescription.id}</p>
          <p className="text-[10px] text-slate-500 font-bold">Date: {prescription.prescriptionDate}</p>
          <p className="text-[10px] text-slate-500 font-bold">
            Time: {prescription.createdAt 
              ? new Date(prescription.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
              : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          </p>
        </div>
      </div>

      {/* Doctor and Patient particulars (No Avatars, only details) */}
      <div className="prescription-grid-2 grid grid-cols-2 gap-6 bg-slate-50/50 p-4 border border-slate-200/60 rounded-xl print:bg-white print:p-0 print:border-none">
        {/* Doctor Info */}
        <div className="space-y-1.5 text-left text-[11px] font-semibold text-slate-500 font-sans">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Practitioner Details</p>
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-slate-800 text-xs">
              Dr. {prescription.doctor.user?.firstName} {prescription.doctor.user?.lastName}
            </h4>
            <p className="text-emerald-650 font-bold text-[9px] uppercase tracking-wide leading-none mt-0.5">
              {prescription.doctor.specialization}
            </p>
            <p className="text-slate-500 font-medium text-[9px] mt-0.5">
              {prescription.doctor.qualification || 'MBBS, MD'} | LIC: {prescription.doctor.licenseNumber}
            </p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="space-y-1.5 text-left text-[11px] font-semibold text-slate-500 border-l border-slate-200/80 pl-6 print:border-l print:pl-6 font-sans">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Patient Details</p>
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-slate-800 text-xs">
              {prescription.patient.user?.firstName} {prescription.patient.user?.lastName}
            </h4>
            <p className="text-slate-600 font-medium text-[9px] mt-0.5">Patient ID: #{prescription.patient.id}</p>
            <p className="text-slate-500 font-medium text-[9px]">
              Age: {getAge(prescription.patient.dateOfBirth)} | Gender: {prescription.patient.gender}
            </p>
          </div>
        </div>
      </div>

      {/* Diagnosis */}
      {prescription.notes && (
        <div className="space-y-1.5 text-[11px] pt-1 text-left font-sans">
          <h4 className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wider flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-emerald-500" />
            <span>Clinical Assessment / Diagnosis</span>
          </h4>
          <p className="text-slate-700 font-medium bg-slate-50/50 p-3 rounded-lg border border-slate-200/50 leading-relaxed print:bg-white print:p-0 print:border-none">
            {prescription.notes}
          </p>
        </div>
      )}

      {/* Rx Medicines List */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5 text-left font-sans">
          <span className="font-serif italic text-base text-emerald-600 font-black">℞</span>
          <span>Prescribed Medications</span>
        </h3>
        
        <table className="prescription-table w-full border-collapse text-left text-[11px] font-sans">
          <thead>
            <tr className="border-b border-slate-250 bg-slate-100/50 print:bg-slate-50">
              <th className="py-2.5 px-3 font-extrabold text-slate-700 w-1/3">Drug Name</th>
              <th className="py-2.5 px-3 font-extrabold text-slate-700">Dosage</th>
              <th className="py-2.5 px-3 font-extrabold text-slate-700">Frequency</th>
              <th className="py-2.5 px-3 font-extrabold text-slate-700">Duration</th>
              <th className="py-2.5 px-3 font-extrabold text-slate-700">Instructions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="py-2.5 px-3 font-bold text-slate-800">{med.name}</td>
                <td className="py-2.5 px-3 text-slate-600 font-medium">{med.dosage || 'As directed'}</td>
                <td className="py-2.5 px-3 text-slate-600 font-medium">{med.frequency || 'N/A'}</td>
                <td className="py-2.5 px-3 text-slate-600 font-medium">{med.duration || 'N/A'}</td>
                <td className="py-2.5 px-3 text-slate-500 font-medium italic">{med.instructions || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Instructions and notes */}
      <div className="prescription-grid-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 print:grid-cols-2 text-left font-sans">
        <div className="space-y-1.5 text-[11px]">
          <h4 className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wider">General Timing Guidelines</h4>
          <p className="text-slate-600 font-medium bg-slate-50/50 p-3 rounded-lg border border-slate-200/50 leading-relaxed print:bg-white print:p-0 print:border-none">
            {prescription.dosage || 'Follow detailed medicines chart timings.'}
          </p>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <h4 className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wider">Additional Doctor Instructions</h4>
          <p className="text-slate-600 font-medium bg-slate-50/50 p-3 rounded-lg border border-slate-200/50 leading-relaxed print:bg-white print:p-0 print:border-none">
            {prescription.instructions || 'Keep out of reach of children. Store in dry place.'}
          </p>
        </div>
      </div>

      {/* Doctor Signature Block */}
      <div className="pt-10 flex justify-between items-end gap-6 text-[10px] font-semibold text-slate-400 text-left font-sans">
        <div className="flex items-center gap-6">
          <div className="space-y-0.5">
            <p className="text-slate-500 font-bold">Generated by MediFlow</p>
            <p className="text-slate-400 italic">Secure Transaction Signature Authenticated</p>
          </div>
          {/* Hospital Seal */}
          <div className="w-16 h-16 border-2 border-dashed border-slate-350 rounded-full flex flex-col items-center justify-center text-center shrink-0 p-1 bg-slate-50/50 print:bg-white">
            <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase leading-none">HOSPITAL</span>
            <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase leading-none mt-0.5">SEAL</span>
          </div>
        </div>
        <div className="text-center space-y-1 w-44 shrink-0 font-sans">
          <div className="h-0.5 bg-slate-300 w-full" />
          <p className="font-extrabold text-slate-700 text-xs">
            Dr. {prescription.doctor.user?.firstName} {prescription.doctor.user?.lastName}
          </p>
          <p className="text-[9px] text-slate-400 uppercase font-black font-sans font-sans">Authorized Signature</p>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionTemplate;
