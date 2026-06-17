import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AppShell from './components/layout/AppShell';
import './index.css';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const HomePage = lazy(() => import('./pages/home/HomePage'));
const PetsPage = lazy(() => import('./pages/pets/PetsPage'));
const PetDetailPage = lazy(() => import('./pages/pets/PetDetailPage'));
const MissionDetailPage = lazy(() => import('./pages/missions/MissionDetailPage'));
const HealthDashboardPage = lazy(() => import('./pages/health/HealthDashboardPage'));
const RanksPage = lazy(() => import('./pages/ranks/RanksPage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const ProfileEditPage = lazy(() => import('./pages/settings/ProfileEditPage'));
const ChangePasswordPage = lazy(() => import('./pages/settings/ChangePasswordPage'));
const SubscriptionPlansPage = lazy(() => import('./pages/settings/SubscriptionPlansPage'));
const AchievementsPage = lazy(() => import('./pages/achievements/AchievementsPage'));
const FamilyPage = lazy(() => import('./pages/family/FamilyPage'));
const PetSetupPage = lazy(() => import('./pages/pets/PetSetupPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>;
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

      {/* Private — wrapped in AppShell */}
      <Route path="/" element={<PrivateRoute><AppShell /></PrivateRoute>}>
        <Route index element={<HomePage />} />
        <Route path="pets" element={<PetsPage />} />
        <Route path="pets/setup" element={<PetSetupPage />} />
        <Route path="pets/:id" element={<PetDetailPage />} />
        <Route path="missions" element={<MissionDetailPage />} />
        <Route path="health" element={<HealthDashboardPage />} />
        <Route path="ranks" element={<RanksPage />} />
        <Route path="shop" element={<Navigate to="/settings/subscription" replace />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="family" element={<FamilyPage />} />
        <Route path="admin/stats" element={<AdminDashboardPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/profile" element={<ProfileEditPage />} />
        <Route path="settings/password" element={<ChangePasswordPage />} />
        <Route path="settings/subscription" element={<SubscriptionPlansPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <Suspense fallback={<div className="page-loader"><div className="spinner spinner-lg" /></div>}>
              <AppRoutes />
            </Suspense>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
