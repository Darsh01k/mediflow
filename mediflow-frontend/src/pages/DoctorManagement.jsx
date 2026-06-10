import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Stethoscope, 
  Plus, 
  Trash2, 
  Mail, 
  User, 
  Lock,
  DollarSign, 
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Alert from '../components/ui/Alert';

const DoctorManagement = () => {
  const toast = useToast();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [bio, setBio] = useState('');

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await API.get('/doctors');
      setDoctors(response.data);
    } catch (err) {
      setError('Failed to load doctors list.');
      toast.error('Failed to load doctors list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!username || !password || !email || !firstName || !lastName || !specialization || !licenseNumber || !consultationFee) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        username,
        password,
        email,
        role: 'DOCTOR',
        firstName,
        lastName,
        specialization,
        licenseNumber,
        consultationFee: parseFloat(consultationFee),
        bio
      };

      await API.post('/auth/register', payload);
      setFormSuccess(true);
      toast.success('Doctor account registered successfully!');
      
      // Clear Form
      setUsername('');
      setPassword('');
      setEmail('');
      setFirstName('');
      setLastName('');
      setSpecialization('');
      setLicenseNumber('');
      setConsultationFee('');
      setBio('');

      fetchDoctors();
      setTimeout(() => {
        setShowAddForm(false);
        setFormSuccess(false);
      }, 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create doctor account.');
      toast.error(err.response?.data?.message || 'Failed to register doctor');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await API.delete(`/doctors/${id}`);
        toast.success('Doctor deleted successfully');
        fetchDoctors();
      } catch (err) {
        toast.error('Failed to delete doctor profile.');
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Doctor Directory</CardTitle>
          <CardDescription>Manage system practitioners and specialities</CardDescription>
        </div>
        <Button
          variant={showAddForm ? 'secondary' : 'primary'}
          size="sm"
          icon={showAddForm ? undefined : Plus}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add Doctor Account'}
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="danger" title="System Error">
            {error}
          </Alert>
        )}

        {showAddForm && (
          <form onSubmit={handleSubmit} className="p-6 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-5">
            <h3 className="text-sm font-bold text-slate-700 border-b border-slate-200/50 pb-2">
              New Practitioner Registration
            </h3>
            {formError && <Alert variant="danger">{formError}</Alert>}
            {formSuccess && <Alert variant="success">Doctor account registered successfully!</Alert>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Username"
                type="text"
                required
                placeholder="DrUserName"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={User}
              />

              <Input
                label="Password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
              />

              <Input
                label="Email Address"
                type="email"
                required
                placeholder="dr.name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="First Name"
                  type="text"
                  required
                  placeholder="First"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                  label="Last Name"
                  type="text"
                  required
                  placeholder="Last"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <Input
                label="Specialization"
                type="text"
                required
                placeholder="Cardiology, General, etc."
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                icon={Stethoscope}
              />

              <Input
                label="Medical License Number"
                type="text"
                required
                placeholder="LIC-98765432"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                icon={CreditCard}
              />

              <Input
                label="Consultation Fee (USD)"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="75.00"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                icon={DollarSign}
              />

              <div className="md:col-span-2 space-y-1.5 text-xs font-semibold text-slate-600">
                <label className="block font-bold text-slate-500 uppercase tracking-wide">
                  Practitioner Bio
                </label>
                <textarea
                  placeholder="Details of professional background..."
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 hover:border-slate-300 rounded-xl text-slate-800 transition-all focus:outline-none text-sm font-medium resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-200/50">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={formLoading}
              >
                Register Doctor
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="h-40 flex flex-col items-center justify-center gap-2">
            <Spinner />
            <p className="text-slate-400 text-xs">Loading doctors listings...</p>
          </div>
        ) : doctors.length === 0 ? (
          <EmptyState
            title="No Doctors Registered"
            description="There are no medical practitioners currently registered on the platform."
            icon={Stethoscope}
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Doctor</TH>
                <TH>Specialization</TH>
                <TH>License</TH>
                <TH className="text-right">Fee</TH>
                <TH className="text-center">Action</TH>
              </TR>
            </THead>
            <TBody>
              {doctors.map((doc) => (
                <TR key={doc.id}>
                  <TD className="font-bold text-slate-800">
                    Dr. {doc.user?.firstName} {doc.user?.lastName}
                  </TD>
                  <TD className="text-slate-500 font-medium">{doc.specialization}</TD>
                  <TD className="text-slate-500 font-mono font-medium">{doc.licenseNumber}</TD>
                  <TD className="text-right font-bold text-slate-700">${doc.consultationFee}</TD>
                  <TD className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-xl transition-colors"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorManagement;
