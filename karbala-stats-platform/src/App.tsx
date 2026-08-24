import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { useAuthStore } from './store/authStore'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import AdminLayout from './components/layout/AdminLayout'

// Public pages
import HomePage from './pages/public/HomePage'
import PublicationsPage from './pages/public/PublicationsPage'
import PublicationDetailPage from './pages/public/PublicationDetailPage'
import IndicatorsPage from './pages/public/IndicatorsPage'
import IndicatorDetailPage from './pages/public/IndicatorDetailPage'
import NewsPage from './pages/public/NewsPage'
import NewsArticlePage from './pages/public/NewsArticlePage'
import CalendarPage from './pages/public/CalendarPage'
import RequestFormPage from './pages/public/RequestFormPage'
import SectionPage from './pages/public/SectionPage'

// Admin pages
import LoginPage from './pages/admin/LoginPage'
import GoogleCallbackPage from './pages/admin/GoogleCallbackPage'
import DashboardPage from './pages/admin/DashboardPage'
import AdminPublicationsPage from './pages/admin/PublicationsPage'
import AdminPublicationFormPage from './pages/admin/PublicationFormPage'
import AdminCategoriesPage from './pages/admin/CategoriesPage'
import AdminIndicatorsPage from './pages/admin/IndicatorsPage'
import AdminIndicatorDataPointsPage from './pages/admin/IndicatorDataPointsPage'
import AdminNewsPage from './pages/admin/NewsPage'
import AdminRequestsPage from './pages/admin/RequestsPage'
import AdminUsersPage from './pages/admin/UsersPage'
import AdminSettingsPage from './pages/admin/SettingsPage'
import AdminReportsPage from './pages/admin/ReportsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Login */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/publications" element={<PublicationsPage />} />
            <Route path="/publications/:id" element={<PublicationDetailPage />} />
            <Route path="/indicators" element={<IndicatorsPage />} />
            <Route path="/indicators/:id" element={<IndicatorDetailPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:id" element={<NewsArticlePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/requests" element={<RequestFormPage />} />
            <Route path="/sections/:slug" element={<SectionPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="publications" element={<AdminPublicationsPage />} />
            <Route path="publications/create" element={<AdminPublicationFormPage />} />
            <Route path="publications/:id/edit" element={<AdminPublicationFormPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="category-publishing" element={<Navigate to="/admin/news" replace />} />
            <Route path="indicators" element={<AdminIndicatorsPage />} />
            <Route path="indicators/:id/data-points" element={<AdminIndicatorDataPointsPage />} />
            <Route path="news" element={<AdminNewsPage />} />
            <Route path="requests" element={<AdminRequestsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
