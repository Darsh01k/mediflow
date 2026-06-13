import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import Select from '../components/ui/Select';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  Eye, 
  Calendar,
  User,
  HeartPulse,
  CornerDownRight,
  ChevronRight,
  Clipboard,
  X
} from 'lucide-react';

const Prescriptions = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states (For Doctor)
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [prescriptionDate, setPrescriptionDate] = useState(new Date().toISOString().split('T')[0]);
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Detail View Modal states
  const [viewingPrescription, setViewingPrescription] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      // Load prescriptions
      const rxRes = await API.get('/prescriptions');
      setPrescriptions(rxRes.data);

      // If doctor, load patients list for dropdown
      if (user?.role === 'DOCTOR' || user?.role === 'PLATFORM_ADMIN') {
        const patientsRes = await API.get('/patients');
        setPatients(patientsRes.data);
      }
    } catch (err) {
      setError('Failed to load prescriptions directory.');
    } finally {
      setLoading(false);
    }
  };

  // Medicine table builders
  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const handleRemoveMedicine = (idx) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleMedicineChange = (idx, field, value) => {
    const updated = [...medicines];
    updated[idx][field] = value;
    setMedicines(updated);
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedPatientId) {
      setError('Please select a patient.');
      return;
    }

    // Filter out blank medicines
    const activeMeds = medicines.filter(m => m.name.trim() !== '');
    if (activeMeds.length === 0) {
      setError('Please add at least one medicine.');
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        patientId: parseInt(selectedPatientId),
        doctorId: user.profileId,
        hospitalId: user.hospital?.id || 1, // Fallback if no hospital associated
        prescriptionDate,
        medicinesJson: JSON.stringify(activeMeds),
        dosage,
        instructions,
        notes
      };

      await API.post('/prescriptions', payload);
      toast.success('Prescription created successfully!');
      setIsCreating(false);
      // Reset form
      setSelectedPatientId('');
      setMedicines([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
      setDosage('');
      setInstructions('');
      setNotes('');
      // Reload prescriptions
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit prescription.');
      toast.error('Failed to submit prescription');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
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

  const downloadPDF = (rx) => {
    const element = document.getElementById('printable-prescription');
    if (!element) return;
    
    const opt = {
      margin:       [0.4, 0.4, 0.4, 0.4],
      filename:     `prescription-${rx.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    const runHtml2Pdf = () => {
      window.html2pdf().from(element).set(opt).save();
    };

    if (window.html2pdf) {
      runHtml2Pdf();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.integrity = 'sha512-GsLlZN/3F2ErC5xGLnLDu5897DLgGLuOP8bKOqg86cGl4nFMibis6UpGG30UMNkOPdApcWEX8/Obc9JNnK1OPg==';
      script.crossOrigin = 'anonymous';
      script.onload = runHtml2Pdf;
      document.body.appendChild(script);
    }
  };

  // Convert medicines JSON string back to array safely
  const parseMedicines = (jsonStr) => {
    try {
      return jsonStr ? JSON.parse(jsonStr) : [];
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Hide regular DOM during browser prints */}
      <div className="print:hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-sans tracking-tight">Prescriptions Management</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">Manage clinical prescriptions, dosages, and printable letters</p>
          </div>
          {(user?.role === 'DOCTOR' || user?.role === 'PLATFORM_ADMIN') && !isCreating && (
            <Button 
              onClick={() => setIsCreating(true)}
              variant="primary"
              size="sm"
              icon={Plus}
            >
              Add Prescription
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

        {/* Prescription Creation form */}
        {isCreating && (
          <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-4 border-b">
              <CardTitle>Draft Medical Prescription</CardTitle>
              <CardDescription>Enter patient particulars and medicines details below</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSavePrescription} className="space-y-6 text-xs font-semibold text-slate-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Patient Lookup"
                    id="patient"
                    required
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    icon={User}
                    className="bg-white text-slate-700 font-medium"
                  >
                    <option value="">Select a Patient...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.user.firstName} {p.user.lastName} (DOB: {p.dateOfBirth})
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="Prescription Date"
                    id="prescriptionDate"
                    type="date"
                    required
                    value={prescriptionDate}
                    onChange={(e) => setPrescriptionDate(e.target.value)}
                    icon={Calendar}
                    className="bg-white text-slate-700"
                  />
                </div>

                {/* Medicines Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                      <HeartPulse className="w-4.5 h-4.5 text-emerald-500" />
                      <span>Medicines & Clinical Drugs</span>
                    </h3>
                    <Button 
                      type="button" 
                      onClick={handleAddMedicine} 
                      variant="secondary" 
                      size="xs"
                      icon={Plus}
                    >
                      Add Medicine Row
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {medicines.map((med, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-slate-50 p-3.5 border border-slate-200/60 rounded-xl relative group">
                        <Input
                          label="Medicine Name"
                          id={`med-name-${idx}`}
                          required={idx === 0}
                          value={med.name}
                          onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Amoxicillin 500mg"
                          className="bg-white text-slate-700"
                        />

                        <Input
                          label="Dosage Pattern"
                          id={`med-dosage-${idx}`}
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          placeholder="e.g. 1 Tablet"
                          className="bg-white text-slate-700"
                        />

                        <Input
                          label="Frequency"
                          id={`med-frequency-${idx}`}
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                          placeholder="e.g. Thrice daily"
                          className="bg-white text-slate-700"
                        />

                        <Input
                          label="Duration"
                          id={`med-duration-${idx}`}
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                          placeholder="e.g. 5 days"
                          className="bg-white text-slate-700"
                        />

                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Input
                              label="Instructions"
                              id={`med-inst-${idx}`}
                              value={med.instructions}
                              onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                              placeholder="e.g. After meals"
                              className="bg-white text-slate-700"
                            />
                          </div>
                          {medicines.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => handleRemoveMedicine(idx)}
                              className="p-2.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-all cursor-pointer mt-5 self-end"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="dosage" className="block font-bold text-slate-400 uppercase tracking-wider">General Dosage Summary</label>
                    <textarea
                      id="dosage"
                      rows="2"
                      placeholder="Summary of medicine administration timings..."
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 text-slate-800 bg-white placeholder-slate-400 text-sm font-medium resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="instructions" className="block font-bold text-slate-400 uppercase tracking-wider">General Instructions</label>
                    <textarea
                      id="instructions"
                      rows="2"
                      placeholder="Add food guidelines, side-effect warnings..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 text-slate-800 bg-white placeholder-slate-400 text-sm font-medium resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="notes" className="block font-bold text-slate-400 uppercase tracking-wider">Notes / Special Observations</label>
                  <textarea
                    id="notes"
                    rows="2"
                    placeholder="Referrals, clinical observations, follow-up dates..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 text-slate-800 bg-white placeholder-slate-400 text-sm font-medium resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button type="button" variant="secondary" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={saving} variant="primary">
                    Save Prescription
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Existing Prescriptions List */}
        {loading ? (
          <div className="h-48 flex flex-col items-center justify-center gap-3">
            <Spinner size="md" />
            <p className="text-slate-500 text-xs font-semibold">Loading prescriptions...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed">
            <p className="text-slate-500 font-bold text-sm">No prescriptions found on your account.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.map((rx) => {
              const meds = parseMedicines(rx.medicinesJson);
              return (
                <Card key={rx.id} className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded text-slate-500">
                        Prescription #{rx.id}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{rx.prescriptionDate}</span>
                      </span>
                    </div>

                    <div className="space-y-1">
                      {user?.role === 'PATIENT' ? (
                        <h4 className="font-extrabold text-slate-800 text-xs">Dr. {rx.doctor.user.firstName} {rx.doctor.user.lastName}</h4>
                      ) : (
                        <h4 className="font-extrabold text-slate-800 text-xs">Patient: {rx.patient.user.firstName} {rx.patient.user.lastName}</h4>
                      )}
                      <p className="text-[10px] text-slate-400 font-bold">{rx.hospital.name}</p>
                    </div>

                    <div className="space-y-1.5 border-l-2 border-emerald-500/60 pl-3">
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wide">Medicines</span>
                      <p className="text-[11px] text-slate-600 font-medium truncate">
                        {meds.map(m => m.name).join(', ')}
                      </p>
                    </div>
                  </CardContent>

                  <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                    <Button 
                      onClick={() => setViewingPrescription(rx)}
                      variant="secondary" 
                      size="xs"
                      icon={Eye}
                      className="border border-slate-200 shadow-sm"
                    >
                      View
                    </Button>
                    <Button 
                      onClick={() => {
                        setViewingPrescription(rx);
                        setTimeout(() => downloadPDF(rx), 200);
                      }}
                      variant="secondary" 
                      size="xs"
                      icon={Download}
                      className="border border-slate-200 shadow-sm text-blue-655 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Download PDF
                    </Button>
                    <Button 
                      onClick={() => {
                        setViewingPrescription(rx);
                        setTimeout(() => window.print(), 100);
                      }}
                      variant="secondary" 
                      size="xs"
                      icon={Printer}
                      className="border border-slate-200 shadow-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    >
                      Print
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Viewing Details / Printable Letterhead (Rendered as Modal on UI, full screen on print) */}
      {viewingPrescription && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:relative print:inset-auto print:bg-white print:p-0">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:relative print:border-none print:shadow-none print:max-w-none print:w-full print:max-h-none print:overflow-visible">
            
            {/* Modal Actions Bar (Hides in print) */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden shrink-0">
              <span className="text-xs font-bold text-slate-800">Prescription Preview</span>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => downloadPDF(viewingPrescription)} 
                  size="xs" 
                  variant="primary" 
                  icon={Download}
                >
                  Download PDF
                </Button>
                <Button 
                  onClick={handlePrint} 
                  size="xs" 
                  variant="secondary" 
                  icon={Printer}
                  className="border border-slate-200 shadow-sm text-emerald-600 hover:text-emerald-705"
                >
                  Print
                </Button>
                <button 
                  onClick={() => setViewingPrescription(null)}
                  className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Letterhead Content Container */}
            <div id="printable-prescription" className="p-8 md:p-10 overflow-y-auto flex-1 space-y-6 print:p-0 print:overflow-visible text-slate-800 bg-white">
              {/* Header Letterhead */}
              <div className="flex justify-between items-start border-b-2 border-emerald-600 pb-5 gap-6">
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center gap-2.5">
                    <HealthAvatar avatarId={viewingPrescription.hospital.logoAvatar || 'hospital_1'} className="w-12 h-12 rounded-xl border border-slate-200 shadow-sm shrink-0" />
                    <div>
                      <h2 className="text-base font-black tracking-tight text-slate-900 uppercase font-sans leading-none">{viewingPrescription.hospital.name}</h2>
                      <p className="text-[9px] text-emerald-605 font-bold uppercase tracking-wider mt-1.5">Registered Clinic & Hospital</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold max-w-sm leading-relaxed mt-2">
                    {viewingPrescription.hospital.address}, {viewingPrescription.hospital.city}, {viewingPrescription.hospital.state}
                  </p>
                  <p className="text-[9px] text-slate-400 font-semibold leading-none">
                    Phone: {viewingPrescription.hospital.phone} | Email: {viewingPrescription.hospital.email || 'info@mediflow.com'}
                  </p>
                </div>
                <div className="text-right space-y-1 shrink-0">
                  <span className="inline-block text-[8px] font-black tracking-wider uppercase bg-emerald-500 text-white px-2.5 py-0.5 rounded-full">PRESCRIPTION</span>
                  <p className="text-[10px] text-slate-450 font-bold mt-1">RX-ID: #{viewingPrescription.id}</p>
                  <p className="text-[10px] text-slate-450 font-bold">Date: {viewingPrescription.prescriptionDate}</p>
                  <p className="text-[10px] text-slate-450 font-bold">
                    Time: {viewingPrescription.createdAt ? new Date(viewingPrescription.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Doctor and Patient particulars */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-4 border border-slate-200/60 rounded-xl print:bg-white print:p-0 print:border-none print:grid-cols-2">
                <div className="space-y-1 text-left text-[11px] font-semibold text-slate-500">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Practitioner Details</p>
                  <h4 className="font-extrabold text-slate-800 text-xs">Dr. {viewingPrescription.doctor.user.firstName} {viewingPrescription.doctor.user.lastName}</h4>
                  <p className="text-slate-600 font-medium">
                    {viewingPrescription.doctor.specialization}
                  </p>
                  <p className="text-slate-500 font-medium leading-normal">
                    {viewingPrescription.doctor.qualification || 'MBBS, MD'} | LIC: {viewingPrescription.doctor.licenseNumber}
                  </p>
                </div>

                <div className="space-y-1 text-left text-[11px] font-semibold text-slate-500 border-l border-slate-200/80 pl-6 print:border-l print:pl-6">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Patient Details</p>
                  <h4 className="font-extrabold text-slate-800 text-xs">{viewingPrescription.patient.user.firstName} {viewingPrescription.patient.user.lastName}</h4>
                  <p className="text-slate-655 font-medium">
                    Patient ID: #{viewingPrescription.patient.id}
                  </p>
                  <p className="text-slate-500 font-medium">
                    Age: {getAge(viewingPrescription.patient.dateOfBirth)} | Gender: {viewingPrescription.patient.gender}
                  </p>
                </div>
              </div>

              {/* Rx Medicines List */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5 text-left">
                  <span className="font-serif italic text-base text-emerald-600 font-black">℞</span>
                  <span>Prescribed Medications</span>
                </h3>
                
                <table className="w-full border-collapse text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/50 print:bg-slate-50">
                      <th className="py-2.5 px-3 font-extrabold text-slate-700 w-1/3">Drug Name</th>
                      <th className="py-2.5 px-3 font-extrabold text-slate-700">Dosage</th>
                      <th className="py-2.5 px-3 font-extrabold text-slate-700">Frequency</th>
                      <th className="py-2.5 px-3 font-extrabold text-slate-700">Duration</th>
                      <th className="py-2.5 px-3 font-extrabold text-slate-700">Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseMedicines(viewingPrescription.medicinesJson).map((med, idx) => (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 print:grid-cols-2 text-left">
                <div className="space-y-1.5 text-[11px]">
                  <h4 className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wider">General Timing Guidelines</h4>
                  <p className="text-slate-600 font-medium bg-slate-50/50 p-3 rounded-lg border border-slate-200/50 leading-relaxed print:bg-white print:p-0 print:border-none">
                    {viewingPrescription.dosage || 'Follow detailed medicines chart timings.'}
                  </p>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <h4 className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wider">Additional Doctor Instructions</h4>
                  <p className="text-slate-600 font-medium bg-slate-50/50 p-3 rounded-lg border border-slate-200/50 leading-relaxed print:bg-white print:p-0 print:border-none">
                    {viewingPrescription.instructions || 'Keep out of reach of children. Store in dry place.'}
                  </p>
                </div>
              </div>

              {viewingPrescription.notes && (
                <div className="space-y-1.5 text-[11px] pt-2 text-left">
                  <h4 className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wider">Clinical Notes</h4>
                  <p className="text-slate-600 font-medium bg-slate-50/50 p-3 rounded-lg border border-slate-200/50 leading-relaxed print:bg-white print:p-0 print:border-none">
                    {viewingPrescription.notes}
                  </p>
                </div>
              )}

              {/* Doctor Signature Block */}
              <div className="pt-10 flex justify-between items-end gap-6 text-[10px] font-semibold text-slate-400 text-left">
                <div className="flex items-center gap-6">
                  <div className="space-y-0.5">
                    <p className="text-slate-500 font-bold">Generated by MediFlow</p>
                    <p className="text-slate-400 italic">Secure Transaction Signature Authenticated</p>
                  </div>
                  {/* Hospital Seal */}
                  <div className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-full flex flex-col items-center justify-center text-center shrink-0 p-1 bg-slate-50/50 print:bg-white">
                    <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase leading-none">HOSPITAL</span>
                    <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase leading-none mt-0.5">SEAL</span>
                  </div>
                </div>
                <div className="text-center space-y-1 w-44 shrink-0">
                  <div className="h-0.5 bg-slate-300 w-full" />
                  <p className="font-extrabold text-slate-700 text-xs">Dr. {viewingPrescription.doctor.user.firstName} {viewingPrescription.doctor.user.lastName}</p>
                  <p className="text-[9px] text-slate-400 uppercase font-black">Authorized Signature</p>
                </div>
              </div>
            </div>

            {/* Modal Close Actions (Hides in print) */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50 print:hidden shrink-0">
              <Button onClick={() => setViewingPrescription(null)} variant="secondary" size="sm">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
