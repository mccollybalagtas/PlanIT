import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bars3Icon, XMarkIcon, BellIcon, MoonIcon, SunIcon, ComputerDesktopIcon,
  UserCircleIcon, ArrowRightOnRectangleIcon, CalendarDaysIcon,
  AcademicCapIcon, UserPlusIcon, FlagIcon, DocumentTextIcon, ChartBarIcon,
  CloudArrowUpIcon, ArrowPathIcon, MicrophoneIcon, WifiIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { Avatar, DropdownMenu } from '../ui';
import { Logo3D } from '../ui/Logo3D';
import toast from 'react-hot-toast';

export function Header() {
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const { unreadCount, markAllAsRead, notifications } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const [offlineMode, setOfflineMode] = useState(() => localStorage.getItem('plannerhub-offline') === 'true');
  const [language, setLanguage] = useState(() => localStorage.getItem('plannerhub-language') || 'en');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: ComputerDesktopIcon },
    { name: 'Tasks', href: '/tasks', icon: ComputerDesktopIcon },
    { name: 'Calendar', href: '/calendar', icon: CalendarDaysIcon },
    { name: 'Study', href: '/study', icon: AcademicCapIcon },
    { name: 'Goals', href: '/goals', icon: FlagIcon },
    { name: 'Notes', href: '/notes', icon: DocumentTextIcon },
  ];

  const toggleOfflineMode = () => {
    const nextValue = !offlineMode;
    setOfflineMode(nextValue);
    localStorage.setItem('plannerhub-offline', String(nextValue));
    toast.success(nextValue ? 'Offline mode enabled' : 'Cloud sync enabled');
  };

  const backupData = () => {
    const backup = { exportedAt: new Date().toISOString(), preferences: { theme, language, offlineMode }, user };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `planit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Backup downloaded');
  };

  const syncSensors = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      await DeviceMotionEvent.requestPermission();
    }
    toast.success('Device sensor sync is ready');
  };

  const startVoiceCommand = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice commands are not supported in this browser');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.onresult = (event) => toast.success(`Heard: ${event.results[0][0].transcript}`);
    recognition.onerror = () => toast.error('Voice command was not heard');
    recognition.start();
  };

  return (
    <header className="sticky top-0 z-40 glass border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2" aria-label="PlanIt Home">
              <Logo3D size="sm" showName />
            </Link>

            <span className="hidden text-xs font-medium uppercase tracking-[0.22em] text-gray-400 lg:block">Workspace</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={`Current theme: ${theme}. Click to change.`}
            >
              {resolvedTheme === 'dark' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>

            <DropdownMenu
              trigger={
                <button
                  className="relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Notifications"
                >
                  <BellIcon className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              }
              items={[
                ...notifications.slice(0, 5).map(n => ({
                  key: n._id,
                  label: n.title,
                  onClick: () => {},
                })),
                notifications.length > 5 && {
                  key: 'view-all',
                  label: 'View all notifications',
                  onClick: () => {},
                },
                { key: 'divider', label: '', disabled: true },
                unreadCount > 0 && {
                  key: 'mark-read',
                  label: 'Mark all as read',
                  onClick: markAllAsRead,
                },
              ].filter(Boolean)}
            />

            <div className="flex items-center gap-2">
              <Avatar src={user?.avatar} name={user?.name || 'User'} size="sm" />
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.name || 'Account'}
              </span>
            </div>

            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Open workspace menu"
                aria-expanded={accountMenuOpen}
              >
                {accountMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 z-50 mt-2 max-h-[calc(100vh-90px)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl bg-white/95 p-2 dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700 animate-scale-in">
                  <div className="px-3 pb-2 pt-1"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Workspace</p></div>
                  <div className="grid grid-cols-2 gap-1">
                    {navigation.map((item) => {
                      const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                      const Icon = item.icon;
                      return <Link key={item.name} to={item.href} onClick={() => setAccountMenuOpen(false)} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm ${isActive ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/60'}`}><Icon className="h-4 w-4" />{item.name}</Link>;
                    })}
                  </div>
                  <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                  <div className="px-3 pb-2 pt-1"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Control center</p></div>
                  <button onClick={() => { navigate('/settings'); setAccountMenuOpen(false); }} className="menu-item"><UserCircleIcon className="h-5 w-5" />Profile & settings</button>
                  <button onClick={toggleTheme} className="menu-item"><>{resolvedTheme === 'dark' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}</>Appearance: {resolvedTheme}</button>
                  <button onClick={() => { navigate('/dashboard#focus-timer'); setAccountMenuOpen(false); }} className="menu-item"><ChartBarIcon className="h-5 w-5" />Focus & tracker</button>
                  <button onClick={() => { markAllAsRead(); setAccountMenuOpen(false); }} className="menu-item"><BellIcon className="h-5 w-5" />Notifications {unreadCount > 0 && `(${unreadCount})`}</button>
                  <button onClick={toggleOfflineMode} className="menu-item"><WifiIcon className="h-5 w-5" />{offlineMode ? 'Offline mode: on' : 'Cloud sync: on'}</button>
                  <button onClick={backupData} className="menu-item"><CloudArrowUpIcon className="h-5 w-5" />Backup workspace</button>
                  <button onClick={syncSensors} className="menu-item"><ArrowPathIcon className="h-5 w-5" />Sync device sensors</button>
                  <button onClick={startVoiceCommand} className="menu-item"><MicrophoneIcon className="h-5 w-5" />Voice command</button>
                  <label className="menu-item"><span className="flex items-center gap-3"><ComputerDesktopIcon className="h-5 w-5" />Language</span><select value={language} onChange={(event) => { setLanguage(event.target.value); localStorage.setItem('plannerhub-language', event.target.value); }} className="rounded-lg border-0 bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700"><option value="en">EN</option><option value="es">ES</option><option value="fr">FR</option><option value="ja">JA</option></select></label>
                  <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                  <button onClick={() => { logout(); navigate('/login'); setAccountMenuOpen(false); }} className="menu-item"><ArrowRightOnRectangleIcon className="h-5 w-5" />Switch user</button>
                  <button onClick={() => { navigate('/register'); setAccountMenuOpen(false); }} className="menu-item"><UserPlusIcon className="h-5 w-5" />Add user</button>
                  <button onClick={() => { logout(); setAccountMenuOpen(false); }} className="menu-item text-red-600 dark:text-red-400"><ArrowRightOnRectangleIcon className="h-5 w-5" />Log out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </header>
  );
}
