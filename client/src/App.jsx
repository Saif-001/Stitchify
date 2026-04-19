import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import SplashScreen from './components/SplashScreen';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

// Pages
import LandingPage        from './pages/LandingPage';
import NotFoundPage       from './pages/NotFoundPage';
import LoginPage          from './pages/auth/LoginPage';
import SignupPage         from './pages/auth/SignupPage';
import CustomerHome       from './pages/customer/CustomerHome';
import CustomerProfile    from './pages/customer/CustomerProfile';
import TailorListPage     from './pages/customer/TailorListPage';
import TailorProfilePage  from './pages/customer/TailorProfilePage';
import CustomerOrdersPage from './pages/customer/CustomerOrdersPage';
import TailorDashboard    from './pages/tailor/TailorDashboard';
import TailorProfile      from './pages/tailor/TailorProfile';
import AdminDashboard     from './pages/admin/AdminDashboard';
import AdminTailors       from './pages/admin/AdminTailors';
import AdminUsers         from './pages/admin/AdminUsers';
import AdminOrders        from './pages/admin/AdminOrders';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="loading-spinner"/>
    </div>
  );

  const dash = !user ? '/' : user.role === 'admin' ? '/admin' : user.role === 'tailor' ? '/tailor/dashboard' : '/customer';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar/>
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/login"  element={user ? <Navigate to={dash} replace/> : <LoginPage/>}/>
          <Route path="/signup" element={user ? <Navigate to={dash} replace/> : <SignupPage/>}/>

          {/* Customer */}
          <Route path="/customer"              element={<ProtectedRoute role="customer"><CustomerHome/></ProtectedRoute>}/>
          <Route path="/customer/profile"      element={<ProtectedRoute role="customer"><CustomerProfile/></ProtectedRoute>}/>
          <Route path="/customer/tailors"      element={<ProtectedRoute role="customer"><TailorListPage/></ProtectedRoute>}/>
          <Route path="/customer/tailors/:id"  element={<ProtectedRoute role="customer"><TailorProfilePage/></ProtectedRoute>}/>
          <Route path="/customer/orders"       element={<ProtectedRoute role="customer"><CustomerOrdersPage/></ProtectedRoute>}/>

          {/* Tailor */}
          <Route path="/tailor/dashboard" element={<ProtectedRoute role="tailor"><TailorDashboard/></ProtectedRoute>}/>
          <Route path="/tailor/profile"   element={<ProtectedRoute role="tailor"><TailorProfile/></ProtectedRoute>}/>

          {/* Admin */}
          <Route path="/admin"         element={<ProtectedRoute role="admin"><AdminDashboard/></ProtectedRoute>}/>
          <Route path="/admin/tailors" element={<ProtectedRoute role="admin"><AdminTailors/></ProtectedRoute>}/>
          <Route path="/admin/users"   element={<ProtectedRoute role="admin"><AdminUsers/></ProtectedRoute>}/>
          <Route path="/admin/orders"  element={<ProtectedRoute role="admin"><AdminOrders/></ProtectedRoute>}/>

          <Route path="*" element={<NotFoundPage/>}/>
        </Routes>
      </main>
      <Footer/>
    </div>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        {!splashDone && <SplashScreen onDone={() => setSplashDone(true)}/>}
        {splashDone && <AppRoutes/>}
        <Toaster position="top-right" toastOptions={{
          duration: 3500,
          style: { fontFamily: 'DM Sans, sans-serif', fontSize: 14, background: '#FFFDF9', color: '#2C1810', border: '1px solid #D4B896', borderRadius: '10px', boxShadow: '0 4px 20px rgba(44,24,16,.12)' },
          success: { iconTheme: { primary: '#C4622D', secondary: 'white' } },
          error:   { iconTheme: { primary: '#C0392B', secondary: 'white' } },
        }}/>
      </AuthProvider>
    </BrowserRouter>
  );
}
