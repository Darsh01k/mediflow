import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import API from '../services/api';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const toast = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validatePasswordStrength = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(password)) return 'Password must contain at least one special character';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing. Please request a new link.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const strengthError = validatePasswordStrength(newPassword);
    if (strengthError) {
      setError(strengthError);
      return;
    }

    try {
      setLoading(true);
      await API.post('/auth/reset-password', {
        token,
        newPassword
      });
      setSuccess(true);
      toast.success('Password updated successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link might be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-8 gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-600">
              <ShieldCheck className="w-8 h-8" />
            </span>
            <span className="text-2xl font-black tracking-tight text-slate-800">
              MediFlow
            </span>
          </div>
          <span className="text-slate-400 font-bold text-xs uppercase tracking-wider mt-1">
            Secure Password Recovery
          </span>
        </div>

        <Card className="border-slate-200 shadow-xl overflow-hidden bg-white/80 backdrop-blur-md">
          <CardHeader className="pb-4 border-b bg-slate-50">
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Specify a strong and unique new password</CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {success ? (
              <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto border border-emerald-100 animate-bounce">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Password Updated!</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Your account password was updated successfully. Redirecting you to the sign in page...
                </p>
                <div className="pt-2">
                  <Link to="/login">
                    <Button variant="primary" className="w-full rounded-xl">
                      Sign In Now
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-605">
                {error && (
                  <Alert variant="danger">
                    {error}
                  </Alert>
                )}

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2.5 pl-10 pr-10 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-500 uppercase tracking-wide">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2.5 pl-10 pr-10 border border-slate-200 bg-white rounded-xl focus:outline-none text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                    />
                  </div>
                </div>

                {/* Password Strength Checklist Indicator */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-[10px] text-slate-450 font-bold leading-normal">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 border-b pb-1">Strength Requirements:</p>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 8 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span>At least 8 characters long</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span>One uppercase letter (A-Z)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(newPassword) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span>One lowercase letter (a-z)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span>One numeric digit (0-9)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${/[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(newPassword) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span>One special character (e.g. !@#$)</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full mt-2 rounded-xl"
                >
                  Reset Password
                </Button>

                <div className="text-center pt-2 text-[11px]">
                  <Link to="/login" className="text-emerald-600 hover:underline">
                    Back to login page
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
