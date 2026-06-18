import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Hospital, 
  Plus, 
  Trash2, 
  Eye, 
  Edit, 
  Search, 
  X, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Shield, 
  Bed, 
  AlertTriangle, 
  CheckCircle, 
  Globe, 
  FileText 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

const HospitalManagement = () => {
  const toast = useToast();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchName, setSearchName] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchEmergency, setSearchEmergency] = useState('');

  const [selectedHospital, setSelectedHospital] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '',
    licenseNumber: '', description: '', hospitalType: '', facilities: '',
    numberOfBeds: '', emergencyServicesAvailable: false, website: ''
  });

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchName.trim()) params.name = searchName.trim();
      if (searchCity.trim()) params.city = searchCity.trim();
      if (searchType) params.hospitalType = searchType;
      if (searchEmergency === 'yes') params.emergencyServicesAvailable = true;
      else if (searchEmergency === 'no') params.emergencyServicesAvailable = false;
      const res = await API.get('/hospitals/search', { params });
      setHospitals(res.data);
    } catch (err) {
      setError('Failed to load hospitals.');
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (!searchName && !searchCity && !searchType && !searchEmergency) {
      fetchHospitals();
    }
  }, [searchName, searchCity, searchType, searchEmergency]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHospitals();
  };

  const clearSearch = () => {
    setSearchName('');
    setSearchCity('');
    setSearchType('');
    setSearchEmergency('');
  };

  const openView = async (id) => {
    try {
      const res = await API.get(`/hospitals/${id}`);
      setSelectedHospital(res.data);
      setViewModal(true);
    } catch (err) {
      toast.error('Failed to load hospital details');
    }
  };

  const openEdit = async (id) => {
    try {
      const res = await API.get(`/hospitals/${id}`);
      const h = res.data;
      setEditForm({
        name: h.name || '',
        email: h.email || '',
        phone: h.phone || '',
        address: h.address || '',
        city: h.city || '',
        state: h.state || '',
        pincode: h.pincode || '',
        licenseNumber: h.licenseNumber || '',
        description: h.description || '',
        hospitalType: h.hospitalType || '',
        facilities: h.facilities || '',
        numberOfBeds: h.numberOfBeds != null ? String(h.numberOfBeds) : '',
        emergencyServicesAvailable: h.emergencyServicesAvailable || false,
        website: h.website || ''
      });
      setSelectedHospital(res.data);
      setEditModal(true);
    } catch (err) {
      toast.error('Failed to load hospital details');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHospital) return;
    try {
      setEditLoading(true);
      await API.put(`/hospitals/${selectedHospital.id}`, {
        ...editForm,
        numberOfBeds: editForm.numberOfBeds ? parseInt(editForm.numberOfBeds, 10) : null
      });
      toast.success('Hospital updated successfully');
      setEditModal(false);
      setSelectedHospital(null);
      fetchHospitals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update hospital');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/hospitals/${id}`);
      toast.success('Hospital deleted successfully');
      setDeleteConfirm(null);
      fetchHospitals();
    } catch (err) {
      toast.error('Failed to delete hospital');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Hospital Management</CardTitle>
          <CardDescription>Manage all registered hospitals across the platform</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs font-semibold text-rose-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
            <Button variant="ghost" size="sm" onClick={fetchHospitals}>Retry</Button>
          </div>
        )}

        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px]">
            <Input
              placeholder="Search by hospital name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="w-40">
            <Input
              placeholder="City"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              icon={MapPin}
            />
          </div>
          <div className="w-40">
            <Select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Government">Government</option>
              <option value="Private">Private</option>
              <option value="Teaching">Teaching</option>
              <option value="Clinic">Clinic</option>
              <option value="Nursing Home">Nursing Home</option>
              <option value="Multi-Specialty">Multi-Specialty</option>
            </Select>
          </div>
          <div className="w-40">
            <Select
              value={searchEmergency}
              onChange={(e) => setSearchEmergency(e.target.value)}
            >
              <option value="">Emergency: All</option>
              <option value="yes">Emergency: Available</option>
              <option value="no">Emergency: Not Available</option>
            </Select>
          </div>
          <Button type="submit" size="sm">Search</Button>
          <Button variant="outline" size="sm" onClick={clearSearch}>
            Clear
          </Button>
        </form>

        {loading ? (
          <div className="h-40 flex flex-col items-center justify-center gap-2">
            <Spinner />
            <p className="text-slate-400 text-xs">Loading hospitals...</p>
          </div>
        ) : hospitals.length === 0 ? (
          <EmptyState
            title="No Hospitals Found"
            description="No hospitals match your search criteria or none are registered yet."
            icon={Hospital}
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Hospital Name</TH>
                <TH>City</TH>
                <TH>State</TH>
                <TH>Phone</TH>
                <TH>Type</TH>
                <TH>Beds</TH>
                <TH>Emergency</TH>
                <TH>Created</TH>
                <TH className="text-center">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {hospitals.map((h) => (
                <TR key={h.id}>
                  <TD className="font-bold text-slate-800">{h.name}</TD>
                  <TD className="text-slate-500 font-medium">{h.city}</TD>
                  <TD className="text-slate-500 font-medium">{h.state}</TD>
                  <TD className="text-slate-500 font-mono font-medium">{h.phone || 'N/A'}</TD>
                  <TD>
                    <Badge variant="info">{h.hospitalType || 'N/A'}</Badge>
                  </TD>
                  <TD className="text-slate-500 font-medium">
                    {h.numberOfBeds != null ? h.numberOfBeds : '-'}
                  </TD>
                  <TD>
                    {h.emergencyServicesAvailable ? (
                      <Badge variant="success">Yes</Badge>
                    ) : (
                      <Badge variant="neutral">No</Badge>
                    )}
                  </TD>
                  <TD className="text-slate-400 text-[10px]">{formatDate(h.createdAt)}</TD>
                  <TD>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openView(h.id)}
                        className="text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 p-1.5 rounded-xl transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(h.id)}
                        className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 p-1.5 rounded-xl transition-colors cursor-pointer"
                        title="Edit Hospital"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(h.id)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-xl transition-colors cursor-pointer"
                        title="Delete Hospital"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}

        {hospitals.length > 0 && (
          <p className="text-xs text-slate-400 font-semibold">
            Showing {hospitals.length} hospital{hospitals.length !== 1 ? 's' : ''}
          </p>
        )}
      </CardContent>

      {viewModal && selectedHospital && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Hospital className="w-6 h-6 text-emerald-500" />
                <h3 className="text-lg font-black text-slate-800">{selectedHospital.name}</h3>
              </div>
              <button onClick={() => setViewModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {selectedHospital.email || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {selectedHospital.phone || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Website</p>
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    {selectedHospital.website || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">License Number</p>
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    {selectedHospital.licenseNumber || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Type</p>
                  <p className="text-sm font-semibold text-slate-700">{selectedHospital.hospitalType || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Beds</p>
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Bed className="w-3.5 h-3.5 text-slate-400" />
                    {selectedHospital.numberOfBeds != null ? selectedHospital.numberOfBeds : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Emergency Services</p>
                  {selectedHospital.emergencyServicesAvailable ? (
                    <Badge variant="success">Available</Badge>
                  ) : (
                    <Badge variant="neutral">Not Available</Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Doctors</p>
                  <p className="text-sm font-semibold text-slate-700">{selectedHospital.doctorCount || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Created</p>
                  <p className="text-sm font-semibold text-slate-700">{formatDate(selectedHospital.createdAt)}</p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Address</p>
                  <p className="text-sm font-semibold text-slate-700 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    {selectedHospital.address}, {selectedHospital.city}, {selectedHospital.state} - {selectedHospital.pincode}
                  </p>
                </div>
                {selectedHospital.facilities && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Facilities</p>
                    <p className="text-sm font-semibold text-slate-700">{selectedHospital.facilities}</p>
                  </div>
                )}
                {selectedHospital.description && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Description</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{selectedHospital.description}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <Button variant="outline" size="sm" onClick={() => setViewModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {editModal && selectedHospital && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Edit className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-black text-slate-800">Edit Hospital</h3>
              </div>
              <button onClick={() => setEditModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Hospital Name" required value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                  <Input label="Email" type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
                  <Input label="Phone" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
                  <Input label="Website" value={editForm.website} onChange={(e) => setEditForm({...editForm, website: e.target.value})} />
                  <Input label="License Number" value={editForm.licenseNumber} onChange={(e) => setEditForm({...editForm, licenseNumber: e.target.value})} />
                  <Select label="Hospital Type" value={editForm.hospitalType} onChange={(e) => setEditForm({...editForm, hospitalType: e.target.value})}>
                    <option value="">Select Type</option>
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                    <option value="Teaching">Teaching</option>
                    <option value="Clinic">Clinic</option>
                    <option value="Nursing Home">Nursing Home</option>
                    <option value="Multi-Specialty">Multi-Specialty</option>
                  </Select>
                  <Input label="Number of Beds" type="number" min="0" value={editForm.numberOfBeds} onChange={(e) => setEditForm({...editForm, numberOfBeds: e.target.value})} />
                  <Input label="City" value={editForm.city} onChange={(e) => setEditForm({...editForm, city: e.target.value})} />
                  <Input label="State" value={editForm.state} onChange={(e) => setEditForm({...editForm, state: e.target.value})} />
                  <Input label="Pincode" value={editForm.pincode} onChange={(e) => setEditForm({...editForm, pincode: e.target.value})} />
                  <div className="md:col-span-2">
                    <Input label="Address" value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Emergency Services</label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.emergencyServicesAvailable}
                        onChange={(e) => setEditForm({...editForm, emergencyServicesAvailable: e.target.checked})}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      Emergency services available
                    </label>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Facilities</label>
                    <textarea
                      value={editForm.facilities}
                      onChange={(e) => setEditForm({...editForm, facilities: e.target.value})}
                      rows="2"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 hover:border-slate-300 rounded-xl text-slate-800 transition-all focus:outline-none text-sm font-medium resize-none"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 hover:border-slate-300 rounded-xl text-slate-800 transition-all focus:outline-none text-sm font-medium resize-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                <Button variant="outline" type="button" onClick={() => setEditModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={editLoading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-800">Delete Hospital</h3>
                <p className="text-xs font-semibold text-slate-400">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this hospital and all associated data? This will also affect doctors, appointments, and records linked to this hospital.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(deleteConfirm)}>
                Delete Hospital
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default HospitalManagement;
