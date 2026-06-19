import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useToast } from './ToastContext';
import { isSessionExpired, getSessionExpirationReason } from '../utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Check if user is logged in on mount
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      if (isSessionExpired()) {
        const reason = getSessionExpirationReason() || 'session';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('loginTimestamp');
        localStorage.removeItem('lastActivityTimestamp');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('loginTimestamp');
        sessionStorage.removeItem('lastActivityTimestamp');
        localStorage.setItem('logoutReason', reason);
        setUser(null);
        if (!window.location.pathname.includes('/login')) {
          navigate('/login');
        }
      } else {
        setUser(JSON.parse(savedUser));
      }
    }
    setLoading(false);
  }, [navigate]);

  const login = async (username, password) => {
    try {
      const response = await API.post('/auth/login', { username, password });
      const { token, ...userData } = response.data;
      
      const now = Date.now().toString();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('loginTimestamp', now);
      localStorage.setItem('lastActivityTimestamp', now);
      
      setUser(userData);
      return userData;
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.data?.retryAfter || 30;
        throw { message: error.response.data?.message || 'Too many requests', retryAfter, isRateLimit: true };
      }
      throw error.response?.data?.message || 'Login failed. Please check your credentials.';
    }
  };

  const register = async (registerData) => {
    try {
      const response = await API.post('/auth/register', registerData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed. Please check the inputs.';
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTimestamp');
    localStorage.removeItem('lastActivityTimestamp');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('loginTimestamp');
    sessionStorage.removeItem('lastActivityTimestamp');
    setUser(null);
  };

  const updateUser = (newUserData) => {
    const savedUser = JSON.parse(localStorage.getItem('user')) || {};
    const updatedUser = { ...savedUser, ...newUserData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Inactivity tracking & Global timer check
  useEffect(() => {
    if (!user) return;

    const threeHours = 3 * 60 * 60 * 1000;

    const updateActivity = () => {
      localStorage.setItem('lastActivityTimestamp', Date.now().toString());
    };

    let throttleTimeout = null;
    const handleActivity = () => {
      if (!throttleTimeout) {
        updateActivity();
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, 5000); // Throttle activity saves to every 5s
      }
    };

    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    const interval = setInterval(() => {
      if (isSessionExpired()) {
        const reason = getSessionExpirationReason() || 'session';
        logout();
        localStorage.setItem('logoutReason', reason);
        navigate('/login');
        if (reason === 'session') {
          toast.warning('Your session has expired. Please sign in again.');
        } else {
          toast.warning('You were signed out due to inactivity.');
        }
      }
    }, 10000); // Check every 10 seconds

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (throttleTimeout) clearTimeout(throttleTimeout);
      clearInterval(interval);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
