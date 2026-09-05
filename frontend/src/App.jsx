import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Header } from './components/layout/Header';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { TasksPage } from './pages/TasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { SettingsPage } from './pages/SettingsPage';
import { StudyPage } from './pages/StudyPage';
import { GoalsPage } from './pages/GoalsPage';
import { NotesPage } from './pages/NotesPage';
import { LandingPage } from './pages/LandingPage';
import { SupportWidget } from './components/SupportWidget';
import { OnboardingTour } from './components/OnboardingTour';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppLayout() {
  const desktopNavigation = [
    ['Dashboard', '/dashboard'],
    ['Tasks', '/tasks'],
    ['Calendar', '/calendar'],
    ['Study', '/study'],
    ['Goals', '/goals'],
    ['Notes', '/notes'],
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-[1600px] flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-gray-200/70 px-4 py-6 dark:border-gray-700/70 lg:block">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">Workspace</p>
          <nav className="mt-3 space-y-1" aria-label="Desktop workspace navigation">
            {desktopNavigation.map(([label, href]) => (
              <Link key={href} to={href} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-indigo-50 hover:text-indigo-700 dark:text-gray-300 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300 transition group-hover:bg-indigo-500 dark:bg-gray-600" />{label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-cyan-50 p-4 dark:border-indigo-900/50 dark:from-indigo-950/50 dark:to-cyan-950/30">
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Today’s signal</p>
            <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">Keep one clear priority visible and let the rest wait.</p>
            <Link to="/tasks?new=true" className="mt-3 inline-flex text-xs font-semibold text-indigo-600 dark:text-indigo-300">Add priority +</Link>
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
      <SupportWidget />
      <OnboardingTour />
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password/:resettoken" element={<PublicRoute><ResetPassword /></PublicRoute>} />

        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:taskId/edit" element={<TasksPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </NotificationProvider>
  );
}