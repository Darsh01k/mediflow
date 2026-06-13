import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { HeartPulse, Lock, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

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
      setError(err);
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center relative overflow-hidden px-4">
      {/* Decorative colored glow blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <Card className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border-slate-800/80 rounded-2xl shadow-2xl z-10 overflow-hidden">
        <CardContent className="p-8">
          {/* Brand Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
              <HeartPulse className="w-7 h-7 text-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Welcome to <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">MediFlow</span>
            </h2>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              Sign in to access your healthcare portal
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username"
              id="username"
              type="text"
              icon={User}
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="bg-slate-800/40 hover:bg-slate-800/60 focus:bg-slate-800 border-slate-800 focus:border-emerald-500/50 text-white placeholder-slate-500"
            />

            <Input
              label="Password"
              id="password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="bg-slate-800/40 hover:bg-slate-800/60 focus:bg-slate-800 border-slate-800 focus:border-emerald-500/50 text-white placeholder-slate-500"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 text-center text-xs font-semibold">
            <p className="text-slate-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
