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
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            objectFit: 'cover',
            flexShrink: 0
          }}
          onError={() => setLogoError(true)}
        />
      );
    }
    
    // Fallback initials component (pure CSS, oklch/gradient free for printing)
    const initials = prescription.hospital.name
      ? prescription.hospital.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : 'H';

    return (
      <div 
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          backgroundColor: '#0f766e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid #cbd5e1'
        }}
      >
        <span 
          className="fallback-initials" 
          style={{
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '-0.025em',
            userSelect: 'none'
          }}
        >
          {initials}
        </span>
      </div>
    );
  };

  return (
    <div 
      id={elementId} 
      className="prescription-print-container print-safe"
      style={{
        padding: '32px',
        backgroundColor: '#ffffff',
        color: '#111827',
        textAlign: 'left',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: 1.5
      }}
    >
      {/* Header Letterhead */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          borderBottom: '2px solid #0f766e',
          paddingBottom: '20px',
          gap: '24px'
        }}
        className="prescription-header print-safe"
      >
        <div style={{ textAlign: 'left', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {renderHospitalLogo()}
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#111827', textTransform: 'uppercase', margin: 0, lineHeight: 1 }}>
                {prescription.hospital.name}
              </h2>
              <p style={{ fontSize: '9px', color: '#0f766e', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px', margin: 0 }}>
                Registered Clinic & Hospital
              </p>
            </div>
          </div>
          <p style={{ fontSize: '10px', color: '#4b5563', fontWeight: 600, maxWidth: '384px', lineHeight: 1.625, marginTop: '8px', margin: 0 }}>
            {prescription.hospital.address}, {prescription.hospital.city}, {prescription.hospital.state} - {prescription.hospital.pincode || ''}
          </p>
          <p style={{ fontSize: '9px', color: '#6b7280', fontWeight: 600, margin: 0 }}>
            Phone: {prescription.hospital.phone} | Email: {prescription.hospital.email || 'contact@hosp.com'}
          </p>
        </div>

        <div 
          style={{
            textAlign: 'right',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            flexShrink: 0,
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '12px'
          }}
          className="print-safe"
        >
          <span 
            style={{
              display: 'inline-block',
              alignSelf: 'end',
              fontSize: '8px',
              fontWeight: 900,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              backgroundColor: '#10b981',
              color: '#ffffff',
              padding: '2px 10px',
              borderRadius: '9999px'
            }}
          >
            PRESCRIPTION
          </span>
          <p style={{ fontSize: '10px', color: '#374151', fontWeight: 'bold', marginTop: '6px', margin: 0 }}>
            RX-ID: #{prescription.id}
          </p>
          <p style={{ fontSize: '10px', color: '#4b5563', fontWeight: 'bold', margin: 0 }}>
            Date: {prescription.prescriptionDate}
          </p>
          <p style={{ fontSize: '10px', color: '#4b5563', fontWeight: 'bold', margin: 0 }}>
            Time: {prescription.createdAt 
              ? new Date(prescription.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
              : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          </p>
        </div>
      </div>

      {/* Doctor and Patient particulars (No Avatars) */}
      <div 
        className="prescription-grid-2 print-safe"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          backgroundColor: '#fafafa',
          padding: '16px',
          border: '1px solid #f3f4f6',
          borderRadius: '12px',
          marginTop: '24px'
        }}
      >
        {/* Doctor Info */}
        <div style={{ textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            Practitioner Details
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h4 style={{ fontWeight: 800, color: '#1f2937', fontSize: '12px', margin: 0 }}>
              Dr. {prescription.doctor.user?.firstName} {prescription.doctor.user?.lastName}
            </h4>
            <p style={{ color: '#0f766e', fontWeight: 'bold', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.025em', lineHeight: 1, margin: 0 }}>
              {prescription.doctor.specialization}
            </p>
            <p style={{ color: '#6b7280', fontWeight: 500, fontSize: '9px', margin: 0 }}>
              {prescription.doctor.qualification || 'MBBS, MD'} | LIC: {prescription.doctor.licenseNumber}
            </p>
          </div>
        </div>

        {/* Patient Info */}
        <div 
          style={{
            textAlign: 'left',
            fontSize: '11px',
            fontWeight: 600,
            color: '#4b5563',
            borderLeft: '1px solid #e5e7eb',
            paddingLeft: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
          className="print-safe"
        >
          <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            Patient Details
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h4 style={{ fontWeight: 800, color: '#1f2937', fontSize: '12px', margin: 0 }}>
              {prescription.patient.user?.firstName} {prescription.patient.user?.lastName}
            </h4>
            <p style={{ color: '#374151', fontWeight: 500, fontSize: '9px', margin: 0 }}>
              Patient ID: #{prescription.patient.id}
            </p>
            <p style={{ color: '#4b5563', fontWeight: 500, fontSize: '9px', margin: 0 }}>
              Age: {getAge(prescription.patient.dateOfBirth)} | Gender: {prescription.patient.gender}
            </p>
          </div>
        </div>
      </div>

      {/* Diagnosis */}
      {prescription.notes && (
        <div style={{ paddingTop: '4px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '24px' }}>
          <h4 style={{ color: '#1f2937', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            <HeartPulse style={{ width: '16px', height: '16px', color: '#10b981' }} />
            <span>Clinical Assessment / Diagnosis</span>
          </h4>
          <p 
            style={{
              color: '#374151',
              fontSize: '11px',
              fontWeight: 500,
              backgroundColor: '#fafafa',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #f3f4f6',
              lineHeight: 1.625,
              margin: 0
            }}
            className="print-safe"
          >
            {prescription.notes}
          </p>
        </div>
      )}

      {/* Rx Medicines List */}
      <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
        <h3 style={{ color: '#111827', fontSize: '12px', fontWeight: 900, letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0, textAlign: 'left' }}>
          <span style={{ color: '#059669', fontSize: '16px', fontWeight: 900, fontFamily: 'Georgia, serif' }}>℞</span>
          <span>Prescribed Medications</span>
        </h3>
        
        <table 
          className="prescription-table"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '11px',
            textAlign: 'left'
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid #d1d5db', backgroundColor: '#f3f4f6' }} className="print-safe">
              <th style={{ padding: '10px 12px', fontWeight: 800, color: '#374151', width: '33.33%' }}>Drug Name</th>
              <th style={{ padding: '10px 12px', fontWeight: 800, color: '#374151' }}>Dosage</th>
              <th style={{ padding: '10px 12px', fontWeight: 800, color: '#374151' }}>Frequency</th>
              <th style={{ padding: '10px 12px', fontWeight: 800, color: '#374151' }}>Duration</th>
              <th style={{ padding: '10px 12px', fontWeight: 800, color: '#374151' }}>Instructions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }} className="print-safe">
                <td style={{ padding: '10px 12px', fontWeight: 'bold', color: '#1f2937' }}>{med.name}</td>
                <td style={{ padding: '10px 12px', color: '#4b5563', fontWeight: 500 }}>{med.dosage || 'As directed'}</td>
                <td style={{ padding: '10px 12px', color: '#4b5563', fontWeight: 500 }}>{med.frequency || 'N/A'}</td>
                <td style={{ padding: '10px 12px', color: '#4b5563', fontWeight: 500 }}>{med.duration || 'N/A'}</td>
                <td style={{ padding: '10px 12px', color: '#6b7280', fontStyle: 'italic', fontWeight: 500 }}>{med.instructions || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Instructions and notes */}
      <div 
        className="prescription-grid-2 print-safe"
        style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '16px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginTop: '24px',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h4 style={{ color: '#1f2937', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            General Timing Guidelines
          </h4>
          <p 
            style={{
              color: '#4b5563',
              fontSize: '11px',
              fontWeight: 500,
              backgroundColor: '#fafafa',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #f3f4f6',
              lineHeight: 1.625,
              margin: 0
            }}
            className="print-safe"
          >
            {prescription.dosage || 'Follow detailed medicines chart timings.'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h4 style={{ color: '#1f2937', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            Additional Doctor Instructions
          </h4>
          <p 
            style={{
              color: '#4b5563',
              fontSize: '11px',
              fontWeight: 500,
              backgroundColor: '#fafafa',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #f3f4f6',
              lineHeight: 1.625,
              margin: 0
            }}
            className="print-safe"
          >
            {prescription.instructions || 'Keep out of reach of children. Store in dry place.'}
          </p>
        </div>
      </div>

      {/* Doctor Signature Block */}
      <div 
        style={{
          paddingTop: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '24px',
          fontSize: '10px',
          color: '#9ca3af',
          fontWeight: 600,
          marginTop: '24px'
        }}
        className="prescription-signature print-safe"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
            <p style={{ color: '#4b5563', fontWeight: 'bold', margin: 0 }}>Generated by MediFlow</p>
            <p style={{ color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>Secure Transaction Signature Authenticated</p>
          </div>
          {/* Hospital Seal */}
          <div 
            style={{
              width: '64px',
              height: '64px',
              border: '2px dashed #cbd5e1',
              borderRadius: '9999px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '4px',
              backgroundColor: '#fafafa',
              flexShrink: 0
            }}
            className="print-safe"
          >
            <span style={{ fontSize: '8px', fontWeight: 900, color: '#9ca3af', letterSpacing: '0.05em', lineHeight: 1 }}>HOSPITAL</span>
            <span style={{ fontSize: '8px', fontWeight: 900, color: '#9ca3af', letterSpacing: '0.05em', lineHeight: 1, marginTop: '2px' }}>SEAL</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', width: '176px', flexShrink: 0 }}>
          <div style={{ height: '2px', backgroundColor: '#cbd5e1', width: '100%', marginBottom: '4px' }} className="print-safe" />
          <p style={{ color: '#374151', fontSize: '12px', fontWeight: 800, margin: 0 }}>
            Dr. {prescription.doctor.user?.firstName} {prescription.doctor.user?.lastName}
          </p>
          <p style={{ color: '#9ca3af', fontSize: '9px', fontWeight: 950, letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
            Authorized Signature
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionTemplate;
