import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DoctorManagement from './pages/DoctorManagement';
import PatientManagement from './pages/PatientManagement';
import Appointments from './pages/Appointments';
import BookAppointment from './pages/BookAppointment';
import MyMedicalRecords from './pages/MyMedicalRecords';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Authentication Views */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Private Portal Views */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              
              <Route path="doctors" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DoctorManagement />
                </ProtectedRoute>
              } />
              
              <Route path="patients" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
                  <PatientManagement />
                </ProtectedRoute>
              } />
              
              <Route path="appointments" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'PATIENT']}>
                  <Appointments />
                </ProtectedRoute>
              } />
              
              <Route path="book-appointment" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PATIENT']}>
                  <BookAppointment />
                </ProtectedRoute>
              } />
              
              <Route path="records" element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <MyMedicalRecords />
                </ProtectedRoute>
              } />
            </Route>

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
