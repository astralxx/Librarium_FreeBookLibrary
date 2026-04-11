/**
 * App Component - главный компонент приложения
 * Включает маршрутизацию, провайдеры и ленивую загрузку страниц
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Компоненты макета
import { Header, Footer } from './components/layout';

// Провайдеры
import { AuthProvider } from './pages/auth/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Компонент защищенных маршрутов
import { PrivateRoute } from './pages/ProfilePage/PrivateRoute';

// Стили
import './styles/globals.css';

// Ленивая загрузка страниц для оптимизации производительности
const HomePage = lazy(() => import('./pages/HomePage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage/ProfilePage'));

// Компонент загрузки
const LoadingFallback = () => (
  <div className="loading" role="status" aria-label="Загрузка">
    <div className="loading-spinner" />
    <span className="sr-only">Загрузка...</span>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app">
            {/* Шапка сайта */}
            <Header />
            
            {/* Основной контент */}
            <main className="main">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Публичные маршруты */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/stats" element={<StatsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Защищенные маршруты */}
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <ProfilePage />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </main>
            
            {/* Подвал сайта */}
            <Footer />
            
            {/* Уведомления */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              toastClassName="toast-custom"
              bodyClassName="toast-body-custom"
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
