import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ToastContext';
import { FieldAuthProvider, FieldProtectedRoute } from './context/FieldAuthContext';

// Admin pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import UploadPage from './pages/UploadPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import ComparisonPage from './pages/ComparisonPage';

// Field technician pages
import FieldLoginPage from './pages/field/FieldLoginPage';
import FieldDocumentListPage from './pages/field/FieldDocumentListPage';
import FieldDocumentFormPage from './pages/field/FieldDocumentFormPage';

export default function App() {
  return (
    <AuthProvider>
      <FieldAuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* ── Admin routes ── */}
              <Route path="/login"           element={<LoginPage />} />
              <Route path="/register"        element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password"  element={<ResetPasswordPage />} />
              <Route path="/dashboard"       element={<DashboardPage />} />
              <Route path="/customers"       element={<CustomersPage />} />
              <Route path="/customers/:id"   element={<CustomerProfilePage />} />
              <Route path="/upload"          element={<UploadPage />} />
              <Route path="/analytics"       element={<AnalyticsPage />} />
              <Route path="/reports"         element={<ReportsPage />} />
              <Route path="/comparison"      element={<ComparisonPage />} />

              {/* ── Field technician routes ── */}
              <Route path="/field/login" element={<FieldLoginPage />} />
              <Route path="/field/documents" element={
                <FieldProtectedRoute>
                  <FieldDocumentListPage />
                </FieldProtectedRoute>
              } />
              <Route path="/field/documents/:id" element={
                <FieldProtectedRoute>
                  <FieldDocumentFormPage />
                </FieldProtectedRoute>
              } />

              {/* ── Redirects ── */}
              <Route path="/"   element={<Navigate to="/dashboard" replace />} />
              <Route path="*"   element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </FieldAuthProvider>
    </AuthProvider>
  );
}
