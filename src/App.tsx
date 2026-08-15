import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ComicDetailPage } from './pages/ComicDetailPage';
import { ChapterReaderPage } from './pages/ChapterReaderPage';
import { MyComicsPage } from './pages/MyComicsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { LibraryPage } from './pages/LibraryPage';

import { AdminGuard } from './components/AdminGuard';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminReportsPage } from './pages/AdminReportsPage';
import { AdminGenresPage } from './pages/AdminGenresPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
          <Navbar />
          
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
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

          <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-400 space-y-1">
            <p className="font-medium text-slate-500">HComic App © 2026 - Nền tảng đọc truyện tranh sắc nét & dịu mắt</p>
            <p className="text-[11px]">Tích hợp 100% APIs Spring Boot Backend • React 19 & Tailwind CSS</p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
