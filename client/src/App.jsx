import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Clubs from './pages/Clubs';
import ClubDetails from './pages/ClubDetails';
import MyClubs from './pages/MyClubs';
import Profile from './pages/Profile';
import Chats from './pages/Chats';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateClub from './pages/admin/CreateClub';
import EditClub from './pages/admin/EditClub';
import PendingRequests from './pages/admin/PendingRequests';
import CreateEvent from './pages/admin/CreateEvent';
import CreateAnnouncement from './pages/admin/CreateAnnouncement';

import './App.css';

// Configure axios defaults
axios.defaults.baseURL = 'https://campusconnect-backend-724n.onrender.com';
axios.defaults.withCredentials = true;

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Student Routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['Student', 'Admin']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/clubs" element={
                <ProtectedRoute allowedRoles={['Student', 'Admin']}>
                  <Clubs />
                </ProtectedRoute>
              } />
              <Route path="/clubs/:clubId" element={
                <ProtectedRoute allowedRoles={['Student', 'Admin']}>
                  <ClubDetails />
                </ProtectedRoute>
              } />
              <Route path="/my-clubs" element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <MyClubs />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/chats/:clubId?" element={
                <ProtectedRoute allowedRoles={['Student', 'Admin']}>
                  <Chats />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/create-club" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <CreateClub />
                </ProtectedRoute>
              } />
              <Route path="/admin/edit-club/:clubId" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <EditClub />
                </ProtectedRoute>
              } />
              <Route path="/admin/pending-requests/:clubId" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <PendingRequests />
                </ProtectedRoute>
              } />
              <Route path="/admin/create-event/:clubId" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <CreateEvent />
                </ProtectedRoute>
              } />
              <Route path="/admin/create-announcement/:clubId" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <CreateAnnouncement />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
