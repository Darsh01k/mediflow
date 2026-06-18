import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardContent } from '../components/ui/Card';
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
  IndianRupee, 
  Calendar, 
  MapPin, 
  Phone,
  Briefcase,
  Globe,
  Building,
  GraduationCap,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Clock
} from 'lucide-react';

import CityAutocomplete from '../components/ui/CityAutocomplete';
import { formatINR } from '../utils/currency';


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-4 my-8">
          <h3 className="text-sm font-bold text-rose-800">Something went wrong with the registration form</h3>
          <p className="text-xs text-rose-600 font-semibold">{this.state.error?.message || "An unexpected rendering error occurred."}</p>
          <button 
            type="button"
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Reload Registration Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const Register = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Onboarding wizard steps
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  // Role
  const [role, setRole] = useState('PATIENT');

  // Common fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarId, setAvatarId] = useState('patient_1');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');

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

  // Doctor availability
  const [availDays, setAvailDays] = useState([]);
  const [availTime, setAvailTime] = useState('09:00 AM - 05:00 PM');

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

  // Hospital operational details
  const [hospitalType, setHospitalType] = useState('');
  const [hospitalFacilities, setHospitalFacilities] = useState('');
  const [hospitalNumberOfBeds, setHospitalNumberOfBeds] = useState('');
  const [hospitalEmergencyServicesAvailable, setHospitalEmergencyServicesAvailable] = useState(false);
  const [hospitalWebsite, setHospitalWebsite] = useState('');

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

  const validateStep = (s) => {
    if (s === 1) {
      if (!username.trim()) return 'Username is required';
      if (!password) return 'Password is required';
      if (password.length < 6) return 'Password must be at least 6 characters';
      if (!email.trim()) return 'Email is required';
      if (!email.includes('@')) return 'Invalid email format';
      if (!firstName.trim()) return 'First name is required';
      if (!lastName.trim()) return 'Last name is required';
      if (!city) return 'Please select your city location';
    }
    
    if (s === 2) {
      if (role === 'PATIENT') {
        if (!dateOfBirth) return 'Date of Birth is required';
      } else if (role === 'DOCTOR') {
        if (!hospitalId) return 'Please select your practicing hospital';
        if (!docPhone.trim()) return 'Practice contact phone is required';
      } else if (role === 'HOSPITAL_ADMIN') {
        if (!hospitalName.trim()) return 'Hospital name is required';
        if (!hospitalAddress.trim()) return 'Hospital address is required';
      }
    }
    
    if (s === 3) {
      if (role === 'PATIENT') {
        if (!phone.trim()) return 'Contact phone is required';
      } else if (role === 'DOCTOR') {
        if (!specialization.trim()) return 'Specialization is required';
        if (!licenseNumber.trim()) return 'Medical license number is required';
        if (!qualification.trim()) return 'Qualification is required';
        if (!experience) return 'Years of experience is required';
        if (!consultationFee) return 'Consultation fee is required';
      } else if (role === 'HOSPITAL_ADMIN') {
        if (!hospitalLicense.trim()) return 'Hospital license number is required';
      }
    }
    
    return null;
  };

  const handleNext = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      toast.error(err);
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const err = validateStep(1) || validateStep(2) || validateStep(3);
    if (err) {
      setError(err);
      toast.error(err);
      return;
    }

    const payload = {
      username,
      password,
      email,
      role,
      firstName,
      lastName,
      avatarId,
      city,
      state,
      country
    };

    if (role === 'PATIENT') {
      payload.dateOfBirth = dateOfBirth;
      payload.gender = gender;
      payload.phone = phone;
      payload.address = address; // optional
      payload.emergencyContact = emergencyContact;
      payload.bloodType = bloodType;
    } else if (role === 'DOCTOR') {
      payload.specialization = specialization;
      payload.licenseNumber = licenseNumber;
      payload.consultationFee = parseFloat(consultationFee);
      payload.bio = bio;
      payload.hospitalId = parseInt(hospitalId);
      payload.qualification = qualification;
      payload.experience = parseInt(experience);
      payload.languages = languages;
      payload.phone = docPhone;
      // Combine availDays and availTime into availability
      const selectedDaysStr = availDays.join(', ');
      payload.availability = selectedDaysStr && availTime ? `${selectedDaysStr}: ${availTime}` : selectedDaysStr || availTime || '';
    } else if (role === 'HOSPITAL_ADMIN') {
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
      payload.hospitalLogoAvatar = avatarId;
      payload.hospitalType = hospitalType;
      payload.hospitalFacilities = hospitalFacilities;
      payload.hospitalNumberOfBeds = hospitalNumberOfBeds ? parseInt(hospitalNumberOfBeds) : null;
      payload.hospitalEmergencyServicesAvailable = hospitalEmergencyServicesAvailable;
      payload.hospitalWebsite = hospitalWebsite;
    }

    try {
      setLoading(true);
      await register(payload);
      setSuccess(true);
      toast.success('Registration successful! Welcome to MediFlow.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err);
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4 animate-fade-in text-slate-700">
            <h3 className="text-xs font-bold text-indigo-650 uppercase tracking-wider pb-1.5 border-b border-slate-100">
              Basic Account Credentials
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div className="space-y-1.5 text-xs font-semibold text-slate-650">
                <label className="block font-bold text-slate-500 uppercase tracking-wide">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="john_doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-300 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                <label className="block font-bold text-slate-500 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-300 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 animate-in"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5 text-xs font-semibold text-slate-655 md:col-span-2">
                <label className="block font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-300 transition-all duration-200"
                  />
                </div>
              </div>

              {/* First Name */}
              <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                <label className="block font-bold text-slate-500 uppercase tracking-wide">First Name</label>
                <input
                  type="text"
                  required
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-300 transition-all duration-200"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                <label className="block font-bold text-slate-500 uppercase tracking-wide">Last Name</label>
                <input
                  type="text"
                  required
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-300 transition-all duration-200"
                />
              </div>

              {/* Location City Selector */}
              <div className="space-y-1.5 text-xs font-semibold text-slate-655 md:col-span-2">
                <label className="block font-bold text-slate-500 uppercase tracking-wide">Registered City Location</label>
                <CityAutocomplete
                  value={city && state ? `${city}, ${state}, ${country}` : city}
                  onChange={(loc) => {
                    setCity(loc.city);
                    setState(loc.state);
                    setCountry(loc.country);
                  }}
                  disabled={loading}
                  required
                />
              </div>

            </div>
          </div>
        );

      case 2:
        if (role === 'PATIENT') {
          return (
            <div className="space-y-6 animate-fade-in text-slate-700">
              <h3 className="text-xs font-bold text-indigo-650 uppercase tracking-wider pb-1.5 border-b border-slate-100">
                Patient Medical Profile Details
              </h3>
              
              <div className="space-y-4">
                {/* Choose Avatar */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide text-[11px]">Choose Profile Avatar</label>
                  <AvatarPicker selectedId={avatarId} onSelect={setAvatarId} category="PATIENT" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* DOB */}
                  <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                    <label className="block font-bold text-slate-500 uppercase tracking-wide">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="date"
                        required
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-300 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Gender */}
                    <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                      <label className="block font-bold text-slate-500 uppercase tracking-wide">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>

                    {/* Blood Type */}
                    <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                      <label className="block font-bold text-slate-500 uppercase tracking-wide">Blood Type</label>
                      <select
                        value={bloodType}
                        onChange={(e) => setBloodType(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (role === 'DOCTOR') {
          return (
            <div className="space-y-6 animate-fade-in text-slate-700">
              <h3 className="text-xs font-bold text-indigo-650 uppercase tracking-wider pb-1.5 border-b border-slate-100">
                Avatar & Practice Location
              </h3>
              
              <div className="space-y-4">
                {/* Choose Avatar */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide text-[11px]">Choose Profile Avatar</label>
                  <AvatarPicker selectedId={avatarId} onSelect={setAvatarId} category="DOCTOR" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Hospital Selection */}
                  <div className="space-y-1.5 text-xs font-semibold text-slate-655 md:col-span-2">
                    <label htmlFor="hospitalSelect" className="block font-bold text-slate-500 uppercase tracking-wide">Practicing Hospital Affiliation</label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <select
                        id="hospitalSelect"
                        required
                        value={hospitalId}
                        onChange={(e) => setHospitalId(e.target.value)}
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 rounded-xl text-slate-800 text-sm font-medium"
                      >
                        {(!hospitalsList || hospitalsList.length === 0) ? (
                          <option value="">No hospitals registered yet</option>
                        ) : (
                          hospitalsList.map((hosp) => (
                            <option key={hosp?.id} value={hosp?.id}>
                              {hosp?.name || 'Unnamed Hospital'} ({hosp?.city || hosp?.address || 'N/A'})
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Doctor Phone */}
                  <div className="space-y-1.5 text-xs font-semibold text-slate-655 md:col-span-2">
                    <label className="block font-bold text-slate-500 uppercase tracking-wide">Doctor Mobile Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 321-7654"
                        value={docPhone}
                        onChange={(e) => setDocPhone(e.target.value)}
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-350 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (role === 'HOSPITAL_ADMIN') {
          return (
            <div className="space-y-6 animate-fade-in text-slate-700">
              <h3 className="text-xs font-bold text-indigo-650 uppercase tracking-wider pb-1.5 border-b border-slate-100">
                Hospital Entity Info
              </h3>
              
              <div className="space-y-4">
                {/* Choose Avatar (Hospital Logo) */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide text-[11px]">Choose Hospital Icon Logo</label>
                  <AvatarPicker selectedId={avatarId} onSelect={setAvatarId} category="HOSPITAL" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Hospital Name */}
                  <div className="space-y-1.5 text-xs font-semibold text-slate-650 md:col-span-2">
                    <label className="block font-bold text-slate-500 uppercase tracking-wide">Hospital Name</label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Saint Grace Medical Center"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-350 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Hospital Email */}
                  <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                    <label className="block font-bold text-slate-500 uppercase tracking-wide">Hospital Contact Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        placeholder="info@stgrace.org"
                        value={hospitalEmail}
                        onChange={(e) => setHospitalEmail(e.target.value)}
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-355 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Hospital Phone */}
                  <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                    <label className="block font-bold text-slate-500 uppercase tracking-wide">Hospital Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={hospitalPhone}
                        onChange={(e) => setHospitalPhone(e.target.value)}
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-355 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Hospital Street Address */}
                  <div className="md:col-span-2 space-y-1.5 text-xs font-semibold text-slate-655">
                    <label className="block font-bold text-slate-500 uppercase tracking-wide">Hospital Street Address (Mandatory)</label>
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
                      className="bg-white border-slate-200 text-slate-800 placeholder-slate-400"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                    <label className="block font-bold text-slate-500 uppercase tracking-wide">City</label>
                    <input
                      type="text"
                      placeholder="Boston"
                      value={hospitalCity}
                      onChange={(e) => setHospitalCity(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-300"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                    <label className="block font-bold text-slate-500 uppercase tracking-wide">State</label>
                    <input
                      type="text"
                      placeholder="MA"
                      value={hospitalState}
                      onChange={(e) => setHospitalState(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return null;

      case 3:
        if (role === 'PATIENT') {
          return (
            <div className="space-y-4 animate-fade-in text-slate-700">
              <h3 className="text-xs font-bold text-indigo-650 uppercase tracking-wider pb-1.5 border-b border-slate-100">
                Patient Contact Information
              </h3>
              
              <div className="space-y-4">
                {/* Phone */}
                <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Contact Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-350 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Emergency Contact Details (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Jane Doe (Spouse) - +1 (555) 111-2222"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-350 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Residential Address */}
                <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Residential Street Address (Optional)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <textarea
                      rows="3"
                      placeholder="123 Health Ave, Medical City, MC 98765"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-350 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (role === 'DOCTOR') {
          return (
            <div className="space-y-4 animate-fade-in text-slate-700">
              <h3 className="text-xs font-bold text-indigo-650 uppercase tracking-wider pb-1.5 border-b border-slate-100">
                Doctor Professional Practice Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Specialization */}
                <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Medical Specialization</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Cardiology, Pediatrics, etc."
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-350"
                    />
                  </div>
                </div>

                {/* License Number */}
                <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Medical License Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="LIC-98765432"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-350"
                    />
                  </div>
                </div>

                {/* Qualification */}
                <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Qualification</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="MD, MBBS, PhD"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-350"
                    />
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Years of Experience</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="12"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-350"
                    />
                  </div>
                </div>

                {/* Consultation Fee */}
                <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Consultation Fee (INR)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      placeholder="500"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-350"
                    />
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Spoken Languages</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="English, Spanish, French"
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-350"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="md:col-span-2 space-y-1.5 text-xs font-semibold text-slate-655">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Professional Bio</label>
                  <textarea
                    rows="2"
                    placeholder="Brief description of your clinical focus..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-350 resize-none"
                  />
                </div>

                {/* Available Days */}
                <div className="md:col-span-2 space-y-1.5 text-xs font-semibold text-slate-655">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Available Days</label>
                  <div className="flex flex-wrap gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                      const selected = (availDays || []).includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setAvailDays((availDays || []).filter(d => d !== day));
                            } else {
                              setAvailDays([...(availDays || []), day]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl border font-bold text-xs cursor-pointer transition-all ${
                            selected 
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Available Time Slots */}
                <div className="md:col-span-2 space-y-1.5 text-xs font-semibold text-slate-655">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Available Time Slots</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. 09:00 AM - 05:00 PM"
                      value={availTime}
                      onChange={(e) => setAvailTime(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-350"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (role === 'HOSPITAL_ADMIN') {
          return (
            <div className="space-y-4 animate-fade-in text-slate-700">
              <h3 className="text-xs font-bold text-indigo-650 uppercase tracking-wider pb-1.5 border-b border-slate-100">
                Hospital Onboarding Setup
              </h3>
              
              <div className="space-y-4">
                {/* License */}
                <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Hospital Business License Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="LIC-HOSP-99008"
                      value={hospitalLicense}
                      onChange={(e) => setHospitalLicense(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-350"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">Facility Description</label>
                  <textarea
                    rows="4"
                    placeholder="Brief description of specialized fields, patient accommodations, surgical centers, emergency trauma support, etc..."
                    value={hospitalDesc}
                    onChange={(e) => setHospitalDesc(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-350 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Hospital Type */}
                  <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                    <label className="block font-bold text-slate-500 uppercase tracking-wide">Hospital Type</label>
                    <select
                      value={hospitalType}
                      onChange={(e) => setHospitalType(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                    >
                      <option value="">Select Hospital Type</option>
                      <option value="Government">Government</option>
                      <option value="Private">Private</option>
                      <option value="Teaching">Teaching</option>
                      <option value="Multi-Specialty">Multi-Specialty</option>
                      <option value="Clinic">Clinic</option>
                      <option value="Nursing Home">Nursing Home</option>
                    </select>
                  </div>

                  {/* Number of Beds */}
                  <div className="space-y-1.5 text-xs font-semibold text-slate-655">
                    <label className="block font-bold text-slate-500 uppercase tracking-wide">Number of Beds</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 150"
                      value={hospitalNumberOfBeds}
                      onChange={(e) => setHospitalNumberOfBeds(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-300"
                    />
                  </div>

                  {/* Facilities */}
                  <div className="space-y-1.5 text-xs font-semibold text-slate-655 md:col-span-2">
                    <label className="block font-bold text-slate-500 uppercase tracking-wide">Facilities</label>
                    <input
                      type="text"
                      placeholder="e.g. ICU, OPD, Emergency, Pharmacy, Diagnostics"
                      value={hospitalFacilities}
                      onChange={(e) => setHospitalFacilities(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-300"
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-1.5 text-xs font-semibold text-slate-655 md:col-span-2">
                    <label className="block font-bold text-slate-500 uppercase tracking-wide">Website (Optional)</label>
                    <input
                      type="url"
                      placeholder="e.g. https://www.saintgrace.org"
                      value={hospitalWebsite}
                      onChange={(e) => setHospitalWebsite(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-300"
                    />
                  </div>

                  {/* Emergency services toggle */}
                  <div className="space-y-1.5 text-xs font-semibold text-slate-655 md:col-span-2 flex items-center gap-2.5 pt-2">
                    <input
                      type="checkbox"
                      id="emergCheckbox"
                      checked={hospitalEmergencyServicesAvailable}
                      onChange={(e) => setHospitalEmergencyServicesAvailable(e.target.checked)}
                      disabled={loading}
                      className="w-4.5 h-4.5 accent-emerald-500 border border-slate-200 rounded-md cursor-pointer focus:ring-2 focus:ring-indigo-500/15"
                    />
                    <label htmlFor="emergCheckbox" className="font-bold text-slate-655 cursor-pointer select-none">
                      24/7 Emergency Services Available
                    </label>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return null;

      case 4:
        return (
          <div className="space-y-6 animate-fade-in text-sm font-semibold text-slate-600">
            <h3 className="text-xs font-bold text-indigo-650 uppercase tracking-wider pb-1.5 border-b border-slate-100">
              Review and Submit Registration
            </h3>
            
            <div className="bg-slate-50 border border-slate-200/50 p-5 rounded-2xl space-y-4">
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-semibold">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Username</span>
                  <span className="text-slate-800 font-bold">{username}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Email</span>
                  <span className="text-slate-800 font-bold">{email}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Full Name</span>
                  <span className="text-slate-800 font-bold">{firstName} {lastName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Role Type</span>
                  <span className="inline-block text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{role.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">City Location</span>
                  <span className="text-slate-850 font-bold">{city}, {state}</span>
                </div>

                {role === 'PATIENT' && (
                  <>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">DOB</span>
                      <span className="text-slate-800 font-bold">{dateOfBirth}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Gender</span>
                      <span className="text-slate-800 font-bold">{gender}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Blood Type</span>
                      <span className="text-slate-800 font-bold">{bloodType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Contact Phone</span>
                      <span className="text-slate-800 font-bold">{phone}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Emergency Contact</span>
                      <span className="text-slate-800 font-bold">{emergencyContact}</span>
                    </div>
                  </>
                )}

                {role === 'DOCTOR' && (
                  <>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Practice Phone</span>
                      <span className="text-slate-800 font-bold">{docPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Specialization</span>
                      <span className="text-slate-800 font-bold">{specialization}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">License Number</span>
                      <span className="text-slate-800 font-bold">{licenseNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Qualification</span>
                      <span className="text-slate-800 font-bold">{qualification}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Experience</span>
                      <span className="text-slate-800 font-bold">{experience} Years</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Consultation Fee</span>
                      <span className="text-slate-800 font-bold">{formatINR(consultationFee)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Availability</span>
                      <span className="text-slate-800 font-bold">
                        {(availDays || []).join(', ') && availTime ? `${(availDays || []).join(', ')}: ${availTime}` : (availDays || []).join(', ') || availTime || 'Not specified'}
                      </span>
                    </div>
                  </>
                )}

                {role === 'HOSPITAL_ADMIN' && (
                  <>
                    <div className="col-span-2">
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Hospital Entity</span>
                      <span className="text-slate-800 font-bold">{hospitalName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Hospital Phone</span>
                      <span className="text-slate-855 font-bold">{hospitalPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Hospital License</span>
                      <span className="text-slate-855 font-bold">{hospitalLicense}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Street Address</span>
                      <span className="text-slate-855 font-bold leading-normal block">{hospitalAddress}, {hospitalCity}, {hospitalState}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Hospital Type</span>
                      <span className="text-slate-855 font-bold">{hospitalType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Number of Beds</span>
                      <span className="text-slate-855 font-bold">{hospitalNumberOfBeds || '0'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Facilities</span>
                      <span className="text-slate-855 font-bold">{hospitalFacilities || 'None'}</span>
                    </div>
                    {hospitalWebsite && (
                      <div className="col-span-2">
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Website</span>
                        <span className="text-slate-855 font-bold">{hospitalWebsite}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Emergency Services</span>
                      <span className="text-slate-855 font-bold">{hospitalEmergencyServicesAvailable ? 'Available 24/7' : 'Not Available'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-normal text-center pt-2">
              By submitting this form, you confirm that the credentials and license indicators provided are authentic.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-tr from-indigo-50/60 via-slate-50 to-blue-50/50 p-4">
        <Card className="w-full max-w-md bg-white/75 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl shadow-slate-200/40 overflow-hidden animate-fade-in-up text-center">
          <CardContent className="p-4 sm:p-10 flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Registration Successful!</h2>
              <p className="text-slate-500 text-sm font-semibold">Welcome to MediFlow</p>
            </div>
            <p className="text-slate-400 text-xs font-semibold">Redirecting to login portal in a few seconds...</p>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500" 
                style={{
                  animation: 'loadingBar 3s linear forwards'
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-tr from-indigo-50/60 via-slate-50 to-blue-50/50 relative overflow-y-auto select-none">
      
      {/* Blurred background circles */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-300/10 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-300/10 rounded-full blur-3xl pointer-events-none animate-float-delayed" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-300/5 rounded-full blur-3xl pointer-events-none" />

      {/* LEFT COLUMN: Hero Panel */}
      <div className="w-full md:w-[35%] lg:w-[30%] flex flex-col justify-between gap-8 md:gap-0 p-8 md:p-12 lg:p-16 relative z-10 border-b md:border-b-0 md:border-r border-slate-200/50 bg-white/25 backdrop-blur-[1px] animate-fade-in shrink-0 md:h-screen md:sticky md:top-0">
        
        {/* Top Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shadow-sm">
            <HeartPulse className="w-6 h-6 text-emerald-600 animate-pulse" />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">MediFlow</span>
        </div>

        {/* Center: Slogan Cards */}
        <div className="my-auto space-y-8 max-w-lg">
          <div className="relative p-8 rounded-2xl bg-white/70 border border-white/80 shadow-xl shadow-slate-200/10 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />
            <div className="absolute right-4 bottom-4 opacity-5">
              <HeartPulse className="w-32 h-32 text-indigo-900" />
            </div>
            
            <div className="space-y-4 relative z-10">
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Join the Next-Gen <span className="bg-gradient-to-r from-emerald-500 to-indigo-655 bg-clip-text text-transparent">Healthcare Hub</span>
              </h1>
              <p className="text-slate-655 text-sm font-medium leading-relaxed">
                Create an account to manage appointments, sync digital health histories, and connect with clinical practitioners in one unified dashboard.
              </p>
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-3 font-bold text-slate-700 text-xs">
            <div className="flex items-center gap-3 bg-white/40 border border-white/60 p-3.5 rounded-xl shadow-sm backdrop-blur-sm hover:translate-x-1 transition-transform">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 font-bold">✓</div>
              <span>Seamless appointment scheduling with local doctors</span>
            </div>
            <div className="flex items-center gap-3 bg-white/40 border border-white/60 p-3.5 rounded-xl shadow-sm backdrop-blur-sm hover:translate-x-1 transition-transform">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0 font-bold">✓</div>
              <span>Secure, centralized, and HIPAA-compliant medical records</span>
            </div>
            <div className="flex items-center gap-3 bg-white/40 border border-white/60 p-3.5 rounded-xl shadow-sm backdrop-blur-sm hover:translate-x-1 transition-transform">
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0 font-bold">✓</div>
              <span>Interactive, real-time hospital coordinates & directories</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-6 border-t border-slate-200/50 flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span>© 2026 MediFlow Inc.</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>All systems operational</span>
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: Onboarding Wizard */}
      <div className="flex-grow w-full flex flex-col justify-center items-center p-4 sm:p-8 md:p-12 lg:p-16 relative z-10">
        
        {/* Wizard Card Wrapper */}
        <Card className="w-full max-w-2xl bg-white/75 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl shadow-slate-200/40 animate-fade-in-up relative my-6 md:my-10">
          <CardContent className="pt-8 sm:pt-10 px-4 sm:px-10 pb-0 flex flex-col relative h-full">
            
            {/* Form Role Selector (Step 1 only) */}
            {step === 1 && (
              <div className="grid grid-cols-3 gap-1 sm:gap-1.5 bg-slate-100 p-1.5 rounded-2xl mb-6 border border-slate-200/60 shadow-inner">
                <button
                  type="button"
                  onClick={() => { setRole('PATIENT'); setAvatarId('patient_1'); setStep(1); }}
                  disabled={loading}
                  className={`py-2.5 text-[10px] font-black uppercase rounded-xl transition-all cursor-pointer ${
                    role === 'PATIENT'
                      ? 'bg-white text-slate-800 shadow-md'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => { setRole('DOCTOR'); setAvatarId('doctor_1'); setStep(1); }}
                  disabled={loading}
                  className={`py-2.5 text-[10px] font-black uppercase rounded-xl transition-all cursor-pointer ${
                    role === 'DOCTOR'
                      ? 'bg-white text-slate-800 shadow-md'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Doctor
                </button>
                <button
                  type="button"
                  onClick={() => { setRole('HOSPITAL_ADMIN'); setAvatarId('hospital_1'); setStep(1); }}
                  disabled={loading}
                  className={`py-2.5 text-[10px] font-black uppercase rounded-xl transition-all cursor-pointer ${
                    role === 'HOSPITAL_ADMIN'
                      ? 'bg-white text-slate-800 shadow-md'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Hospital Admin
                </button>
              </div>
            )}

            {/* Stepper progress indicator */}
            <div className="mb-6">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-2">
                <span className="uppercase tracking-wider">Step {step} of 4</span>
                <span>{Math.round(((step - 1) / 3) * 100)}% Complete</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-indigo-650 transition-all duration-350"
                  style={{ width: `${((step - 1) / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Step error logs */}
            {error && (
              <Alert variant="danger" className="mb-6 rounded-xl">
                {error}
              </Alert>
            )}

            {/* Step Content */}
            <ErrorBoundary>
              <form onSubmit={(e) => { e.preventDefault(); if (step === 4) { handleSubmit(e); } else { handleNext(); } }} className="flex flex-col flex-grow relative">
                
                <div className="pb-16 flex-grow">
                  {renderStepContent()}
                </div>

                {/* Action Buttons (Sticky Footer) */}
                <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-150 py-4 px-4 sm:px-10 -mx-4 sm:-mx-10 z-20 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.05)] flex items-center justify-between rounded-b-2xl">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-slate-200 disabled:opacity-50"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  )}
                  
                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-indigo-655 hover:from-emerald-450 hover:to-indigo-555 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-505/10 hover:-translate-y-0.5 ml-auto"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Button
                      type="submit"
                      loading={loading}
                      className="rounded-xl from-emerald-500 to-primary-600 hover:from-emerald-450 hover:to-primary-550 text-white font-bold text-xs py-2.5 px-6 shadow-md shadow-primary-500/10 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ml-auto"
                    >
                      {role === 'PATIENT' ? 'Create Account' : role === 'DOCTOR' ? 'Register Doctor' : 'Register Hospital'}
                    </Button>
                  )}
                </div>
              </form>
            </ErrorBoundary>

            {/* Return to Login link (Step 1 only) */}
            {step === 1 && (
              <div className="mt-8 text-center text-xs font-semibold">
                <p className="text-slate-400">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-emerald-600 hover:text-emerald-500 hover:underline transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
