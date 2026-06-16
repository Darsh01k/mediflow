import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import Alert from './ui/Alert';
import Spinner from './ui/Spinner';
import { 
  Lock, 
  Mail, 
  Laptop, 
  Globe, 
  Clock, 
  Trash2, 
  LogOut, 
  ShieldCheck, 
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

const SecuritySettings = () => {
  const { user, logout, updateUser } = useAuth();
  const toast = useToast();

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Update Email States
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Active Sessions States
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState(null);
  const [loggingOutAll, setLoggingOutAll] = useState(false);
  const [sessionsError, setSessionsError] = useState('');

  // OTP resend countdown effect
  useEffect(() => {
    let timer = null;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // Password validation helper
  const validatePasswordStrength = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(password)) return 'Password must contain at least one special character';
    return null;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    const strengthError = validatePasswordStrength(newPassword);
    if (strengthError) {
      setPasswordError(strengthError);
      return;
    }

    try {
      setPasswordLoading(true);
      await API.post('/users/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      setPasswordSuccess('Password changed successfully!');
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Please verify your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRequestEmailChange = async (e) => {
    if (e) e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    if (!newEmail) {
      setEmailError('Please enter a new email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (newEmail.toLowerCase() === user?.email?.toLowerCase()) {
      setEmailError('New email must be different from current email');
      return;
    }

    try {
      setEmailLoading(true);
      const res = await API.post('/users/request-email-change', { newEmail });
      setOtpSent(true);
      setCountdown(60);
      setEmailSuccess(res.data.message || 'For security, a verification code has been sent to your current registered email address.');
      toast.success('Verification code sent successfully!');
    } catch (err) {
      setEmailError(err.response?.data?.message || 'Failed to request email change.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailChange = async (e) => {
    if (e) e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    if (!otp || otp.trim().length !== 6) {
      setEmailError('Please enter a valid 6-digit verification code');
      return;
    }

    try {
      setEmailLoading(true);
      await API.post('/users/verify-email-change', { newEmail, otp });
      setEmailSuccess('Email address updated successfully!');
      toast.success('Email updated successfully!');
      
      // Sync local context state
      updateUser({ email: newEmail });
      
      // Reset flow
      setNewEmail('');
      setOtp('');
      setOtpSent(false);
      setCountdown(0);
    } catch (err) {
      setEmailError(err.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleCancelEmailChange = () => {
    setNewEmail('');
    setOtp('');
    setOtpSent(false);
    setEmailError('');
    setEmailSuccess('');
    setCountdown(0);
  };

  const fetchActiveSessions = async () => {
    try {
      setSessionsLoading(true);
      setSessionsError('');
      const res = await API.get('/users/sessions');
      setSessions(res.data);
    } catch (err) {
      setSessionsError('Failed to load active sessions.');
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to revoke this session? The device will be signed out immediately.')) {
      return;
    }

    try {
      setRevokingSessionId(sessionId);
      await API.delete(`/users/sessions/${sessionId}`);
      toast.success('Device session revoked.');
      // Refresh list
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (err) {
      toast.error('Failed to revoke session.');
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Are you sure you want to sign out of all devices? This will also sign out your current session.')) {
      return;
    }

    try {
      setLoggingOutAll(true);
      await API.post('/users/sessions/logout-all');
      toast.success('Signed out of all devices.');
      // Clear token/localstorage and redirect
      logout();
      window.location.href = '/login';
    } catch (err) {
      toast.error('Failed to sign out of all devices.');
    } finally {
      setLoggingOutAll(false);
    }
  };

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Columns - Security Forms */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Change Password Card */}
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>🔒 Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError && <Alert variant="danger">{passwordError}</Alert>}
              {passwordSuccess && <Alert variant="success">{passwordSuccess}</Alert>}

              <Input
                label="Current Password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={passwordLoading}
                icon={Lock}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={passwordLoading}
                      icon={Lock}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-[34px] text-slate-400 hover:text-slate-650 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Input
                  label="Confirm New Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={passwordLoading}
                  icon={Lock}
                />
              </div>

              {/* Password Strength Indicator */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-[10px] text-slate-450 font-bold leading-normal">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 border-b pb-1">Strength Requirements:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
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
                    <span>One special character (!@#$)</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t pt-3">
                <Button
                  type="submit"
                  loading={passwordLoading}
                  variant="primary"
                >
                  Change Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Update Email Card */}
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>📧 Update Email</CardTitle>
              <CardDescription>Change the email address linked to your account</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {!otpSent ? (
              <form onSubmit={handleRequestEmailChange} className="space-y-4">
                {emailError && <Alert variant="danger">{emailError}</Alert>}
                {emailSuccess && <Alert variant="success">{emailSuccess}</Alert>}

                <div className="p-3 bg-indigo-50/40 border border-indigo-100/50 rounded-xl text-[11px] font-bold text-slate-500 flex justify-between items-center">
                  <span>Current Email Address:</span>
                  <span className="text-slate-700 bg-white border px-2.5 py-1 rounded-lg shadow-2xs font-mono">{user?.email || 'N/A'}</span>
                </div>

                <Input
                  label="New Email Address"
                  type="email"
                  required
                  placeholder="example@mediflow.in"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={emailLoading}
                  icon={Mail}
                />

                <div className="flex justify-end border-t pt-3">
                  <Button
                    type="submit"
                    loading={emailLoading}
                    variant="primary"
                  >
                    Send Verification Code
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailChange} className="space-y-4">
                {emailError && <Alert variant="danger">{emailError}</Alert>}
                {emailSuccess && <Alert variant="success">{emailSuccess}</Alert>}

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-[11.5px] font-semibold text-amber-800 space-y-1">
                  <p className="font-bold text-xs">Verification code sent!</p>
                  <p>We've sent a 6-digit OTP code to <strong className="font-extrabold">{user?.email}</strong>.</p>
                  <p className="text-[10px] text-amber-600 italic">Please check your inbox. The code is valid for 10 minutes.</p>
                </div>

                <Input
                  label="Enter 6-Digit Verification Code"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={emailLoading}
                  className="text-center tracking-widest text-lg font-black"
                />

                <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 px-1 pt-1">
                  {countdown > 0 ? (
                    <span className="text-slate-400">Resend code in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestEmailChange}
                      disabled={emailLoading}
                      className="text-indigo-600 hover:text-indigo-700 cursor-pointer disabled:opacity-50 font-bold"
                    >
                      Resend Code
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCancelEmailChange}
                    disabled={emailLoading}
                    className="text-rose-600 hover:text-rose-700 cursor-pointer font-bold"
                  >
                    Cancel / Change Email
                  </button>
                </div>

                <div className="flex justify-end border-t pt-3 gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancelEmailChange}
                    disabled={emailLoading}
                    className="border-slate-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={emailLoading}
                    variant="primary"
                  >
                    Verify & Update
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Active Sessions */}
      <div className="space-y-6">
        <Card className="shadow-sm border-slate-200 bg-white h-full flex flex-col">
          <CardHeader className="pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>🚪 Active Sessions</CardTitle>
                  <CardDescription>Manage devices logged into your account</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-6">
            <div className="flex-1 space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {sessionsError && <Alert variant="danger">{sessionsError}</Alert>}

              {sessionsLoading && sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                  <Spinner size="md" />
                  <span className="text-xs font-bold">Querying active sessions...</span>
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold py-6 text-center">No active sessions found.</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div 
                      key={session.id} 
                      className={`p-4 rounded-xl border text-[11px] font-semibold flex flex-col gap-2 transition-all ${
                        session.isCurrent 
                          ? 'bg-emerald-50/30 border-emerald-100/60 shadow-2xs' 
                          : 'bg-slate-50 border-slate-200/50 hover:bg-slate-100/40'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-2.5 items-center">
                          <span className={`p-1.5 rounded-lg border ${session.isCurrent ? 'bg-emerald-100/50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-500'}`}>
                            <Laptop className="w-4 h-4" />
                          </span>
                          <div>
                            {session.isCurrent ? (
                              <>
                                <span className="block font-bold text-slate-800 text-xs">
                                  Current Device
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                  {session.browserInfo && session.deviceInfo ? `${session.browserInfo} • ${session.deviceInfo}` : (session.deviceInfo || 'Unknown Device')}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="block font-bold text-slate-800 text-xs">
                                  {session.browserInfo ? `${session.browserInfo} Browser` : 'Unknown Browser'}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                  {session.deviceInfo || 'Unknown Device'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {session.isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
                            Current
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRevokeSession(session.id)}
                            disabled={revokingSessionId === session.id}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                            title="Revoke session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="border-t border-slate-100/80 pt-2 flex items-center justify-between text-[10px] text-slate-450 font-bold">
                        {session.isCurrent ? (
                          <>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              Last Active:
                            </span>
                            <span className="font-mono text-slate-650">
                              Just now
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              Logged In:
                            </span>
                            <span className="font-mono text-slate-600">
                              {session.loginTime ? new Date(session.loginTime).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              }) : 'N/A'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Button
                onClick={handleLogoutAll}
                loading={loggingOutAll}
                variant="destructive"
                className="w-full justify-center gap-2 rounded-xl text-xs"
                icon={LogOut}
              >
                Sign Out of All Devices
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecuritySettings;
