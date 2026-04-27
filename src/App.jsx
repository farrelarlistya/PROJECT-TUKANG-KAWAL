import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { USER_ROLES } from '@/utils/constants';

// Lazy-loaded pages
const Home = lazy(() => import('@/pages/Home'));
const ArticleDetail = lazy(() => import('@/pages/ArticleDetail'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Account = lazy(() => import('@/pages/Account'));
const AccountInfo = lazy(() => import('@/pages/AccountInfo'));
const AccountSettings = lazy(() => import('@/pages/AccountSettings'));
const SubscriptionStatusPage = lazy(() => import('@/pages/SubscriptionStatusPage'));
const Subscription = lazy(() => import('@/pages/Subscription'));
const MulaiNgawal = lazy(() => import('@/pages/MulaiNgawal'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Admin pages
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminReview = lazy(() => import('@/pages/admin/AdminReview'));
const AdminWriteArticle = lazy(() => import('@/pages/admin/AdminWriteArticle'));
const AdminManageArticles = lazy(() => import('@/pages/admin/AdminManageArticles'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminMembership = lazy(() => import('@/pages/admin/AdminMembership'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
        <p className="mt-4 text-[#777]">Memuat...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/category/:slug" element={<Home />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/subscription" element={<Subscription />} />

        {/* Protected: Account */}
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>}>
          <Route index element={<AccountInfo />} />
          <Route path="settings" element={<AccountSettings />} />
          <Route path="subscription" element={<SubscriptionStatusPage />} />
        </Route>

        {/* Protected: Member */}
        <Route path="/mulai-ngawal" element={
          <ProtectedRoute requiredRole={USER_ROLES.MEMBER}><MulaiNgawal /></ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole={USER_ROLES.ADMIN}><AdminLayout /></ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="review" element={<AdminReview />} />
          <Route path="write" element={<AdminWriteArticle />} />
          <Route path="articles" element={<AdminManageArticles />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="membership" element={<AdminMembership />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
