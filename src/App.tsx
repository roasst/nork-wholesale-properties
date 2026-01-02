import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';

import { AuthProvider } from './admin/context/AuthContext';
import { ToastProvider } from './admin/context/ToastContext';
import { ProtectedRoute } from './admin/components/ProtectedRoute';
import { AdminRedirect } from './admin/components/AdminRedirect';
import { Login } from './admin/pages/Login';
import { Register } from './admin/pages/Register';
import { Dashboard } from './admin/pages/Dashboard';
import { Properties as AdminProperties } from './admin/pages/Properties';
import { PropertyNew } from './admin/pages/PropertyNew';
import { PropertyEdit } from './admin/pages/PropertyEdit';
import { Inquiries } from './admin/pages/Inquiries';
import { Users } from './admin/pages/Users';
import { Profile } from './admin/pages/Profile';
import { Wholesalers } from './admin/pages/Wholesalers';
import { WholesalerDetail } from './admin/pages/WholesalerDetail';
import { OwnerAnalytics } from './admin/pages/OwnerAnalytics';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/admin" element={<AdminRedirect />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/register" element={<Register />} />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/properties"
            element={
              <ProtectedRoute>
                <AdminProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/properties/new"
            element={
              <ProtectedRoute requiredRoles={['owner', 'admin', 'editor']}>
                <PropertyNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/properties/edit/:id"
            element={
              <ProtectedRoute requiredRoles={['owner', 'admin', 'editor']}>
                <PropertyEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inquiries"
            element={
              <ProtectedRoute>
                <Inquiries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/wholesalers"
            element={
              <ProtectedRoute>
                <Wholesalers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/wholesalers/:id"
            element={
              <ProtectedRoute>
                <WholesalerDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRoles={['owner', 'admin']}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute requiredRoles={['owner']}>
                <OwnerAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                  <HomePage />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/properties"
            element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                  <PropertiesPage />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/property/:id"
            element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                  <PropertyDetailPage />
                </main>
                <Footer />
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  </ToastProvider>
  );
}

export default App;
