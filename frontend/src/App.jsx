import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts & Security
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import AnnouncementsManager from './pages/AnnouncementsManager';
import Maintenance from './pages/Maintenance';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import DashboardHome from './pages/DashboardHome';
import ManageStaff from './pages/ManageStaff';
import ManageResidents from './pages/ManageResidents';
import ManageRooms from './pages/ManageRooms';
import MyRoom from './pages/MyRoom';
import Billing from './pages/Billing';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* PROTECTED ROUTES */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          
          <Route path="maintenance" element={<ProtectedRoute allowedRoles={['admin', 'staff', 'resident']}><Maintenance /></ProtectedRoute>} />
          <Route path="billing" element={<ProtectedRoute allowedRoles={['admin', 'staff', 'resident']}><Billing /></ProtectedRoute>} />
          
          <Route path="rooms" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><ManageRooms /></ProtectedRoute>} />
          <Route path="residents" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><ManageResidents /></ProtectedRoute>} />
          <Route path="announcements" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><AnnouncementsManager /></ProtectedRoute>} />
          
          <Route path="staff" element={<ProtectedRoute allowedRoles={['admin']}><ManageStaff /></ProtectedRoute>} />
          <Route path="my-room" element={<ProtectedRoute allowedRoles={['resident']}><MyRoom /></ProtectedRoute>} />
        </Route> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;