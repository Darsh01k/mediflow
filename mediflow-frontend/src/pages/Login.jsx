import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { HeartPulse, Lock, User, Eye, EyeOff, ShieldCheck, Zap, CheckCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const extractErrorMessage = (err, fallback = 'An unexpected error occurred') => {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  
  if (err.response && err.response.data) {
    if (typeof err.response.data === 'string') {
      return err.response.data;
    }
    if (err.response.data.message && typeof err.response.data.message === 'string') {
      return err.response.data.message;
    }
    if (err.response.data.error && typeof err.response.data.error === 'string') {
      return err.response.data.error;
    }
  }
  
  if (err.message && typeof err.message === 'string') {
    return err.message;
  }
  
  try {
    return String(err);
  } catch (e) {
    return fallback;
  }
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const reason = localStorage.getItem('logoutReason');
    if (reason) {
      localStorage.removeItem('logoutReason');
      if (reason === 'session') {
        setSessionExpired(true);
        toast.warning('Your session has expired. Please sign in again.');
      } else if (reason === 'inactivity') {
        toast.warning('You were signed out due to inactivity.');
      }
    }
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const user = await login(username, password);
      let greeting = '';
      const fname = user.firstName ? user.firstName.trim() : '';
      const lname = user.lastName ? user.lastName.trim() : '';
      let fullName = `${fname} ${lname}`.trim();
      
      if (!fullName || 
          fullName.toLowerCase() === 'user' || 
          fullName.toLowerCase() === 'undefined' || 
          fullName.toLowerCase() === 'null') {
        greeting = user.username || 'user';
      } else {
        greeting = fullName;
      }
      
      toast.success(`Welcome Back, ${greeting}`);
      navigate('/');
    } catch (err) {
      console.error('Login Error:', err);
      const message = extractErrorMessage(err, 'Login failed');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      setError('No credential returned from Google');
      return;
    }
    try {
      setError('');
      setLoading(true);
      const user = await loginWithGoogle(credentialResponse.credential);
      
      let greeting = '';
      const fname = user.firstName ? user.firstName.trim() : '';
      const lname = user.lastName ? user.lastName.trim() : '';
      let fullName = `${fname} ${lname}`.trim();
      
      if (!fullName || 
          fullName.toLowerCase() === 'user' || 
          fullName.toLowerCase() === 'undefined' || 
          fullName.toLowerCase() === 'null') {
        greeting = user.username || 'user';
      } else {
        greeting = fullName;
      }
      
      toast.success(`Welcome Back, ${greeting}`);
      navigate('/');
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      const message = extractErrorMessage(err, 'Google sign in failed');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-tr from-indigo-50/60 via-slate-50 to-blue-50/50 relative overflow-hidden select-none">
      
      {/* Premium blurred floating blobs for light background */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-300/10 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-300/10 rounded-full blur-3xl pointer-events-none animate-float-delayed" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-300/5 rounded-full blur-3xl pointer-events-none" />

      {/* LEFT COLUMN: Modern Healthcare Hero panel */}
      <div className="flex-1 hidden md:flex flex-col justify-between p-12 lg:p-16 relative z-10 border-r border-slate-200/50 bg-white/25 backdrop-blur-[1px] animate-fade-in">
        
        {/* Top: Logo Branding */}
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shadow-sm">
            <HeartPulse className="w-6 h-6 text-emerald-600 animate-pulse" />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">MediFlow</span>
        </div>

        {/* Center: Headline & Subheading Cards */}
        <div className="my-auto space-y-8 max-w-lg">
          <div className="relative p-8 rounded-2xl bg-white/70 border border-white/80 shadow-xl shadow-slate-200/10 backdrop-blur-md relative overflow-hidden group">
            {/* Accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />
            
            {/* Subtle floating cross icon */}
            <div className="absolute right-4 bottom-4 opacity-5">
              <HeartPulse className="w-32 h-32 text-indigo-900" />
            </div>
            
            <div className="space-y-4 relative z-10">
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Healthcare Management <span className="bg-gradient-to-r from-emerald-500 to-indigo-650 bg-clip-text text-transparent">Made Simple</span>
              </h1>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Manage appointments, doctors, patients and prescriptions in one secure, unified platform.
              </p>
            </div>
          </div>

          {/* Floating trust badges */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-center justify-center text-center gap-1.5 shadow-sm shadow-emerald-500/5 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">Secure</span>
              <span className="text-[9px] font-semibold text-slate-400">HIPAA Compliant</span>
            </div>

            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col items-center justify-center text-center gap-1.5 shadow-sm shadow-indigo-500/5 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">Fast</span>
              <span className="text-[9px] font-semibold text-slate-400">Instant Sync</span>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex flex-col items-center justify-center text-center gap-1.5 shadow-sm shadow-blue-500/5 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">Reliable</span>
              <span className="text-[9px] font-semibold text-slate-400">99.9% Uptime</span>
            </div>
          </div>
        </div>

        {/* Bottom: Footer Trust indicators */}
        <div className="pt-6 border-t border-slate-200/50 flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span>© 2026 MediFlow Inc.</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>All systems operational</span>
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: Glassmorphism Login Card Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="flex flex-col items-center text-center md:hidden mb-8 max-w-sm px-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-sm">
              <HeartPulse className="w-5 h-5 text-emerald-600 animate-pulse" />
            </div>
            <span className="text-lg font-black text-slate-800 tracking-tight">MediFlow</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Healthcare Management <span className="bg-gradient-to-r from-emerald-500 to-indigo-650 bg-clip-text text-transparent">Made Simple</span>
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-2 leading-relaxed">
            Manage appointments, doctors, patients and prescriptions in one secure platform.
          </p>
          <div className="flex items-center gap-3 mt-4 text-[10px] font-bold text-slate-400">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded">✓ Secure</span>
            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 rounded">✓ Fast</span>
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded">✓ Reliable</span>
          </div>
        </div>

        {/* Card wrapper */}
        <Card className="w-full max-w-md bg-white/75 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl shadow-slate-200/40 overflow-hidden animate-fade-in-up">
          <CardContent className="p-8 sm:p-10">
            
            {/* Header */}
            <div className="space-y-2 mb-8 text-center md:text-left">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Welcome back
              </h2>
              <p className="text-slate-500 text-xs font-semibold">
                Sign in to access your secure healthcare portal
              </p>
            </div>

            {/* Session Expired Alert */}
            {sessionExpired && (
              <Alert variant="warning" className="mb-6 rounded-xl">
                Your session has expired. Please sign in again.
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="danger" className="mb-6 rounded-xl">
                {error}
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Username field */}
              <div className="space-y-1.5 w-full text-xs font-semibold text-slate-650">
                <label htmlFor="username" className="block font-bold text-slate-500 uppercase tracking-wide">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-2.5 pl-10 border border-slate-200 bg-white rounded-xl transition-all focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-300 focus:shadow-sm"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5 w-full text-xs font-semibold text-slate-655">
                <label htmlFor="password" className="block font-bold text-slate-500 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-2.5 pl-10 pr-10 border border-slate-200 bg-white rounded-xl transition-all focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 hover:border-slate-300 focus:shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                className="w-full mt-2 rounded-xl from-emerald-500 to-primary-600 hover:from-emerald-400 hover:to-primary-500 hover:scale-[1.01] text-white font-bold text-sm tracking-wide shadow-md shadow-primary-500/10 hover:shadow-lg hover:shadow-primary-500/20 hover:-translate-y-0.5 transition-all duration-200 py-3"
              >
                Sign In
              </Button>

              {/* Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative px-3 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Or continue with
                </span>
              </div>

              {/* Google Button */}
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    setError('Google sign-in failed. Please try again.');
                    toast.error('Google sign-in failed.');
                  }}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="340"
                />
              </div>

            </form>

            <div className="mt-8 text-center text-xs font-semibold">
              <p className="text-slate-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-emerald-600 hover:text-emerald-500 hover:underline transition-colors"
                >
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
