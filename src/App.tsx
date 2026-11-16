import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ComicDetailPage } from './pages/ComicDetailPage';
import { ChapterReaderPage } from './pages/ChapterReaderPage';
import { MyComicsPage } from './pages/MyComicsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OAuth2RedirectPage } from './pages/OAuth2RedirectPage';
import { ProfilePage } from './pages/ProfilePage';
import { LibraryPage } from './pages/LibraryPage';

import { AdminGuard } from './components/AdminGuard';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminReportsPage } from './pages/AdminReportsPage';
import { AdminGenresPage } from './pages/AdminGenresPage';
import { Flame } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#090a0f] text-[#f3f4f6] flex flex-col font-sans selection:bg-orange-500 selection:text-white antialiased">
          <Navbar />
          
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/comics" element={<SearchPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/comic/:slug" element={<ComicDetailPage />} />
              <Route path="/read/:comicSlug/:chapterSlug" element={<ChapterReaderPage />} />
              <Route path="/my-comics" element={<MyComicsPage />} />

              {/* Admin Routes */}
              <Route element={<AdminGuard />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="genres" element={<AdminGenresPage />} />
                  <Route path="reports" element={<AdminReportsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="border-t border-white/5 bg-[#0e1017] py-8 text-center text-xs text-zinc-500 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="font-extrabold text-sm text-white tracking-tight">HComic Platform</span>
            </div>
            <p className="font-medium text-zinc-400">
              Nền tảng đọc truyện tranh sắc nét, trải nghiệm đọc Zen Mode vô song & tối ưu hóa di động.
            </p>
            <p className="text-[11px] text-zinc-600">
              Tích hợp 100% Backend Spring Boot APIs • React 19 • Tailwind CSS Dark Aesthetic
            </p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
