import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import HomePage from './pages/home/HomePage';
import PetsPage from './pages/pets/PetsPage';
import PetDetailPage from './pages/pets/PetDetailPage';
import MissionDetailPage from './pages/missions/MissionDetailPage';
import HealthDashboardPage from './pages/health/HealthDashboardPage';
import RanksPage from './pages/ranks/RanksPage';
import ShopPage from './pages/shop/ShopPage';
import CheckoutPage from './pages/shop/CheckoutPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import SettingsPage from './pages/settings/SettingsPage';
import ProfileEditPage from './pages/settings/ProfileEditPage';
import ChangePasswordPage from './pages/settings/ChangePasswordPage';
import SubscriptionPlansPage from './pages/settings/SubscriptionPlansPage';
import AchievementsPage from './pages/achievements/AchievementsPage';
import FamilyPage from './pages/family/FamilyPage';
import PetSetupPage from './pages/pets/PetSetupPage';
import './index.css';

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
        <Route path="shop" element={<ShopPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="family" element={<FamilyPage />} />
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
            <AppRoutes />
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
