import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import API from '../services/api';
import { AvatarPicker } from '../components/ui/Avatar';
import AddressAutocomplete from '../components/ui/AddressAutocomplete';
import { 
  HeartPulse, 
  User, 
  Lock, 
  Mail, 
  CreditCard, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Phone,
  Briefcase,
  Globe,
  Building,
  GraduationCap
} from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Role
  const [role, setRole] = useState('PATIENT');

  // Common fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarId, setAvatarId] = useState('patient_1');

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
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [languages, setLanguages] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [hospitalsList, setHospitalsList] = useState([]);

  // Hospital Admin fields
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalEmail, setHospitalEmail] = useState('');
  const [hospitalPhone, setHospitalPhone] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [hospitalCity, setHospitalCity] = useState('');
  const [hospitalState, setHospitalState] = useState('');
  const [hospitalPincode, setHospitalPincode] = useState('');
  const [hospitalLat, setHospitalLat] = useState('');
  const [hospitalLng, setHospitalLng] = useState('');
  const [hospitalLicense, setHospitalLicense] = useState('');
  const [hospitalDesc, setHospitalDesc] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch available hospitals for doctors to pick from
    const loadHospitals = async () => {
      try {
        const res = await API.get('/hospitals');
        const data = res.data || [];
        setHospitalsList(data);
        if (data.length > 0 && data[0]?.id) {
          setHospitalId(data[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load hospitals', err);
        toast.error('Failed to load hospitals list');
      }
    };
    loadHospitals();
  }, []);

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
      avatarId
    };

    if (role === 'PATIENT') {
      if (!dateOfBirth || !phone || !emergencyContact) {
        setError('Please fill in required patient demographics (address is optional)');
        return;
      }
      payload.dateOfBirth = dateOfBirth;
      payload.gender = gender;
      payload.phone = phone;
      payload.address = address; // optional
      payload.emergencyContact = emergencyContact;
      payload.bloodType = bloodType;
    } else if (role === 'DOCTOR') {
      if (!specialization || !licenseNumber || !consultationFee || !hospitalId || !qualification || !experience || !docPhone) {
        setError('Please fill in all doctor details');
        return;
      }
      payload.specialization = specialization;
      payload.licenseNumber = licenseNumber;
      payload.consultationFee = parseFloat(consultationFee);
      payload.bio = bio;
      payload.hospitalId = parseInt(hospitalId);
      payload.qualification = qualification;
      payload.experience = parseInt(experience);
      payload.languages = languages;
      payload.phone = docPhone;
    } else if (role === 'HOSPITAL_ADMIN') {
      if (!hospitalName || !hospitalAddress) {
        setError('Hospital name and street address are required');
        return;
      }
      payload.hospitalName = hospitalName;
      payload.hospitalEmail = hospitalEmail;
      payload.hospitalPhone = hospitalPhone;
      payload.hospitalAddress = hospitalAddress;
      payload.hospitalCity = hospitalCity;
      payload.hospitalState = hospitalState;
      payload.hospitalPincode = hospitalPincode;
      payload.hospitalLatitude = hospitalLat ? parseFloat(hospitalLat) : null;
      payload.hospitalLongitude = hospitalLng ? parseFloat(hospitalLng) : null;
      payload.hospitalLicenseNumber = hospitalLicense;
      payload.hospitalDescription = hospitalDesc;
      payload.hospitalLogoAvatar = avatarId; // Use selected avatar for hospital logo
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
          <div className="grid grid-cols-3 bg-slate-800/50 p-1 rounded-xl mb-6 border border-slate-850">
            <button
              type="button"
              onClick={() => { setRole('PATIENT'); setAvatarId('patient_1'); }}
              disabled={loading}
              className={`py-2 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                role === 'PATIENT'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => { setRole('DOCTOR'); setAvatarId('doctor_1'); }}
              disabled={loading}
              className={`py-2 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                role === 'DOCTOR'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Doctor
            </button>
            <button
              type="button"
              onClick={() => { setRole('HOSPITAL_ADMIN'); setAvatarId('hospital_1'); }}
              disabled={loading}
              className={`py-2 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                role === 'HOSPITAL_ADMIN'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hospital Admin
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Avatar Selector */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider pb-1.5 border-b border-slate-800">
                Choose Profile Avatar
              </h3>
              <AvatarPicker selectedId={avatarId} onSelect={setAvatarId} category={role === 'HOSPITAL_ADMIN' ? 'HOSPITAL' : role} />
            </div>

            {/* Section 2: Basic Credentials */}
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

            {/* Section 3: Dynamic Info based on Selected Role */}
            {role === 'PATIENT' && (
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

                  <div className="md:col-span-2 space-y-1.5 text-xs font-semibold text-slate-600">
                    <label htmlFor="address" className="block font-bold text-slate-500 uppercase tracking-wide">Residential Address (Optional)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <textarea
                        id="address"
                        rows="2"
                        placeholder="123 Health Ave, Medical City, MC 98765"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/40 border border-slate-800 hover:border-slate-700 focus:outline-none focus:border-emerald-500/50 rounded-xl text-white placeholder-slate-500 text-sm font-medium resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {role === 'DOCTOR' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider pb-1.5 border-b border-slate-800">
                  Doctor Professional Practice Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Hospital Selection */}
                  <div className="space-y-1.5 text-xs font-semibold text-slate-600">
                    <label htmlFor="hospitalSelect" className="block font-bold text-slate-500 uppercase tracking-wide">Select Practicing Hospital</label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <select
                        id="hospitalSelect"
                        required
                        value={hospitalId}
                        onChange={(e) => setHospitalId(e.target.value)}
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/40 border border-slate-800 focus:outline-none focus:border-emerald-500/50 rounded-xl text-white text-sm font-medium"
                      >
                        {(!hospitalsList || hospitalsList.length === 0) ? (
                          <option value="">No hospitals registered yet</option>
                        ) : (
                          hospitalsList.map((hosp) => (
                            <option key={hosp?.id} value={hosp?.id} className="bg-slate-900 text-white">
                              {hosp?.name || 'Unnamed Hospital'} ({hosp?.city || hosp?.address || 'N/A'})
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Medical License Number"
                    id="licenseNumber"
                    required
                    placeholder="LIC-98765432"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    disabled={loading}
                    icon={CreditCard}
                    className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                  />

                  <Input
                    label="Medical Specialization"
                    id="specialization"
                    required
                    placeholder="Cardiology, Pediatrics, etc."
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    disabled={loading}
                    icon={Briefcase}
                    className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                  />

                  <Input
                    label="Doctor Phone"
                    id="docPhone"
                    required
                    placeholder="+1 (555) 321-7654"
                    value={docPhone}
                    onChange={(e) => setDocPhone(e.target.value)}
                    disabled={loading}
                    icon={Phone}
                    className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                  />

                  <Input
                    label="Qualification"
                    id="qualification"
                    required
                    placeholder="MD, MBBS, PhD"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    disabled={loading}
                    icon={GraduationCap}
                    className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                  />

                  <Input
                    label="Years of Experience"
                    id="experience"
                    type="number"
                    required
                    min="0"
                    placeholder="12"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    disabled={loading}
                    icon={Calendar}
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
                    className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                  />

                  <Input
                    label="Spoken Languages"
                    id="languages"
                    placeholder="English, Spanish, French"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    disabled={loading}
                    icon={Globe}
                    className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                  />

                  <div className="md:col-span-2 space-y-1.5 text-xs font-semibold text-slate-600">
                    <label htmlFor="bio" className="block font-bold text-slate-500 uppercase tracking-wide">Professional Bio</label>
                    <textarea
                      id="bio"
                      rows="2"
                      placeholder="Brief description of your expertise, clinical focus, and professional history..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2.5 bg-slate-800/40 border border-slate-800 hover:border-slate-700 focus:outline-none focus:border-emerald-500/50 rounded-xl text-white placeholder-slate-500 text-sm font-medium resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {role === 'HOSPITAL_ADMIN' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider pb-1.5 border-b border-slate-800">
                  Hospital Entity Details (Setup new facility)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Hospital Name"
                    id="hospName"
                    required
                    placeholder="Saint Grace Medical Center"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    disabled={loading}
                    icon={Building}
                    className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500 md:col-span-2"
                  />

                  <Input
                    label="Hospital Contact Email"
                    id="hospEmail"
                    type="email"
                    placeholder="info@stgrace.org"
                    value={hospitalEmail}
                    onChange={(e) => setHospitalEmail(e.target.value)}
                    disabled={loading}
                    icon={Mail}
                    className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                  />

                  <Input
                    label="Hospital Contact Phone"
                    id="hospPhone"
                    placeholder="+1 (555) 123-4567"
                    value={hospitalPhone}
                    onChange={(e) => setHospitalPhone(e.target.value)}
                    disabled={loading}
                    icon={Phone}
                    className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                  />

                  <div className="md:col-span-2 space-y-1.5 text-xs font-semibold text-slate-600">
                    <label htmlFor="hospAddress" className="block font-bold text-slate-500 uppercase tracking-wide">Street Address (Mandatory)</label>
                    <AddressAutocomplete
                      value={hospitalAddress}
                      onChange={setHospitalAddress}
                      onSelect={(res) => {
                        setHospitalAddress(res.address);
                        setHospitalCity(res.city);
                        setHospitalState(res.state);
                        setHospitalPincode(res.pincode);
                        setHospitalLat(res.latitude ? res.latitude.toString() : '');
                        setHospitalLng(res.longitude ? res.longitude.toString() : '');
                      }}
                      required
                      disabled={loading}
                      className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                    />
                  </div>

                  <Input
                    label="City"
                    id="hospCity"
                    placeholder="Medical City"
                    value={hospitalCity}
                    onChange={(e) => setHospitalCity(e.target.value)}
                    disabled={loading}
                    className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                  />

                  <Input
                    label="State"
                    id="hospState"
                    placeholder="CA"
                    value={hospitalState}
                    onChange={(e) => setHospitalState(e.target.value)}
                    disabled={loading}
                    className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                  />

                  <Input
                    label="Pincode"
                    id="hospPincode"
                    placeholder="90210"
                    value={hospitalPincode}
                    onChange={(e) => setHospitalPincode(e.target.value)}
                    disabled={loading}
                    className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                  />

                  <Input
                    label="Hospital License Number"
                    id="hospLicense"
                    placeholder="LIC-HOSP-99008"
                    value={hospitalLicense}
                    onChange={(e) => setHospitalLicense(e.target.value)}
                    disabled={loading}
                    icon={CreditCard}
                    className="bg-slate-800/40 border-slate-800 text-white placeholder-slate-500"
                  />

                  <div className="md:col-span-2 space-y-1.5 text-xs font-semibold text-slate-600">
                    <label htmlFor="hospDesc" className="block font-bold text-slate-500 uppercase tracking-wide">Facility Description</label>
                    <textarea
                      id="hospDesc"
                      rows="2"
                      placeholder="Brief description of specialized fields, patient accommodations, etc..."
                      value={hospitalDesc}
                      onChange={(e) => setHospitalDesc(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2.5 bg-slate-800/40 border border-slate-800 hover:border-slate-700 focus:outline-none focus:border-emerald-500/50 rounded-xl text-white placeholder-slate-500 text-sm font-medium resize-none"
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
