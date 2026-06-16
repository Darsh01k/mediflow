import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LocationProvider } from './context/LocationContext';
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

// New upgraded pages
import DoctorSearch from './pages/DoctorSearch';
import HospitalSearch from './pages/HospitalSearch';
import NearbyHospitals from './pages/NearbyHospitals';
import EmergencyHelp from './pages/EmergencyHelp';
import Prescriptions from './pages/Prescriptions';
import MedicalHistory from './pages/MedicalHistory';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <LocationProvider>
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
                <ProtectedRoute allowedRoles={['PLATFORM_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN']}>
                  <DoctorManagement />
                </ProtectedRoute>
              } />
              
              <Route path="patients" element={
                <ProtectedRoute allowedRoles={['PLATFORM_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR']}>
                  <PatientManagement />
                </ProtectedRoute>
              } />
              
              <Route path="appointments" element={
                <ProtectedRoute allowedRoles={['PLATFORM_ADMIN', 'ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'PATIENT']}>
                  <Appointments />
                </ProtectedRoute>
              } />
              
              <Route path="book-appointment" element={
                <ProtectedRoute allowedRoles={['PLATFORM_ADMIN', 'ADMIN', 'PATIENT']}>
                  <BookAppointment />
                </ProtectedRoute>
              } />
              
              <Route path="records" element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <MyMedicalRecords />
                </ProtectedRoute>
              } />

              {/* Advanced search engines & nearby facilities */}
              <Route path="doctor-search" element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <DoctorSearch />
                </ProtectedRoute>
              } />

              <Route path="hospital-search" element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <HospitalSearch />
                </ProtectedRoute>
              } />

              <Route path="nearby-hospitals" element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <NearbyHospitals />
                </ProtectedRoute>
              } />

              <Route path="emergency" element={
                <ProtectedRoute>
                  <EmergencyHelp />
                </ProtectedRoute>
              } />

              <Route path="prescriptions" element={
                <ProtectedRoute>
                  <Prescriptions />
                </ProtectedRoute>
              } />

              <Route path="history" element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <MedicalHistory />
                </ProtectedRoute>
              } />
            </Route>

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </LocationProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
