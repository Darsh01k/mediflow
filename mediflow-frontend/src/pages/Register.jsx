import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { 
  HeartPulse, 
  User, 
  Lock, 
  Mail, 
  CreditCard, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Phone
} from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Common fields
  const [role, setRole] = useState('PATIENT');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Patient fields
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [bloodType, setBloodType] = useState('O+');

  // Doctor fields
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [bio, setBio] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password || !email || !firstName || !lastName) {
      setError('Please fill in all basic credentials');
      return;
    }

    const payload = {
      username,
      password,
      email,
      role,
      firstName,
      lastName,
    };

    if (role === 'PATIENT') {
      if (!dateOfBirth || !phone || !address || !emergencyContact) {
        setError('Please fill in all patient demographics');
        return;
      }
      payload.dateOfBirth = dateOfBirth;
      payload.gender = gender;
      payload.phone = phone;
      payload.address = address;
      payload.emergencyContact = emergencyContact;
      payload.bloodType = bloodType;
    } else {
      if (!specialization || !licenseNumber || !consultationFee) {
        setError('Please fill in all professional doctor details');
        return;
      }
      payload.specialization = specialization;
      payload.licenseNumber = licenseNumber;
      payload.consultationFee = parseFloat(consultationFee);
      payload.bio = bio;
    }

    try {
      setLoading(true);
      await register(payload);
      setSuccess(true);
      toast.success('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err);
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-12 px-4 relative overflow-hidden">
      {/* Decorative colored glow blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Register box */}
      <Card className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-xl border-slate-800/80 rounded-2xl shadow-2xl z-10 overflow-hidden">
        <CardContent className="p-8">
          {/* Brand Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
              <HeartPulse className="w-7 h-7 text-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-white">Create your Account</h2>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              Choose your role and register below
            </p>
          </div>

          {/* Success Alert */}
          {success && (
            <Alert variant="success" className="mb-6">
              Registration Successful! Redirecting to login...
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 bg-slate-800/50 p-1 rounded-xl mb-6 border border-slate-850">
            <button
              type="button"
              onClick={() => setRole('PATIENT')}
              disabled={loading}
              className={`py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                role === 'PATIENT'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register as Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('DOCTOR')}
              disabled={loading}
              className={`py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                role === 'DOCTOR'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register as Doctor
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Basic Credentials */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider pb-1.5 border-b border-slate-800">
                Basic Account Credentials
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Username"
                  id="username"
                  required
                  placeholder="john_doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  icon={User}
                  className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                />
                
                <Input
                  label="Password"
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  icon={Lock}
                  className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                />

                <Input
                  label="Email"
                  id="email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  icon={Mail}
                  className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500 md:col-span-2"
                />

                <Input
                  label="First Name"
                  id="firstName"
                  required
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                  className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                />

                <Input
                  label="Last Name"
                  id="lastName"
                  required
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                  className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* Section 2: Dynamic Info based on Selected Role */}
            {role === 'PATIENT' ? (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider pb-1.5 border-b border-slate-800">
                  Patient Medical Profile Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Date of Birth"
                    id="dateOfBirth"
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    disabled={loading}
                    icon={Calendar}
                    className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      label="Gender"
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      disabled={loading}
                      className="bg-slate-800/40 border-slate-800 text-white"
                      options={['Male', 'Female', 'Other']}
                    />
                    
                    <Select
                      label="Blood Type"
                      id="bloodType"
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      disabled={loading}
                      className="bg-slate-800/40 border-slate-800 text-white"
                      options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
                    />
                  </div>

                  <Input
                    label="Phone Number"
                    id="phone"
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    icon={Phone}
                    className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                  />

                  <Input
                    label="Emergency Contact"
                    id="emergencyContact"
                    required
                    placeholder="Jane Doe (Spouse) - +1 (555) 111-2222"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    disabled={loading}
                    icon={Phone}
                    className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                  />

                  <div className="md:col-span-2 space-y-1.5 text-xs font-semibold text-slate-650">
                    <label htmlFor="address" className="block font-bold text-slate-500 uppercase tracking-wide">Residential Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <textarea
                        id="address"
                        required
                        rows="2"
                        placeholder="123 Health Ave, Medical City, MC 98765"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/40 border border-slate-800 hover:border-slate-350 focus:outline-none focus:border-emerald-500/50 rounded-xl text-white placeholder-slate-500 text-sm font-medium resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider pb-1.5 border-b border-slate-800">
                  Doctor Professional Practice Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Medical Specialization"
                    id="specialization"
                    required
                    placeholder="Cardiology, Pediatrics, etc."
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    disabled={loading}
                    icon={User}
                    className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                  />

                  <Input
                    label="Medical License Number"
                    id="licenseNumber"
                    required
                    placeholder="LIC-12345678"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    disabled={loading}
                    icon={CreditCard}
                    className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                  />

                  <Input
                    label="Consultation Fee (USD)"
                    id="consultationFee"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="75.00"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    disabled={loading}
                    icon={DollarSign}
                    className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500 md:col-span-2"
                  />

                  <div className="md:col-span-2 space-y-1.5 text-xs font-semibold text-slate-650">
                    <label htmlFor="bio" className="block font-bold text-slate-500 uppercase tracking-wide">Professional Bio</label>
                    <textarea
                      id="bio"
                      rows="2"
                      placeholder="Brief description of your expertise, clinical focus, and professional history..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2.5 bg-slate-800/40 border border-slate-800 hover:border-slate-350 focus:outline-none focus:border-emerald-500/50 rounded-xl text-white placeholder-slate-500 text-sm font-medium resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-4"
            >
              Create Account
            </Button>
          </form>

          {/* Redirect */}
          <div className="mt-6 text-center text-xs font-semibold">
            <p className="text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
