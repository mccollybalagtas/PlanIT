import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Avatar, RadialProgress } from '../components/ui';
import { UserIcon, BellIcon, MoonIcon, SunIcon, ComputerDesktopIcon, KeyIcon, TrashIcon, CameraIcon, Bars3Icon, ArrowRightOnRectangleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { taskApi } from '../services/api';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { user, updateProfile, updatePassword, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '', avatar: user?.avatar || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      avatar: user?.avatar || ''
    });
  }, [user]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await taskApi.getStats();
      setStats(res.data.stats);
    } catch (error) {
      toast.error('Failed to load progress stats');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'progress' && !stats && !statsLoading) {
      fetchStats();
    }
  }, [activeTab, stats, statsLoading, fetchStats]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSwitchAccount = () => {
    logout();
    navigate('/login');
  };

  const handleAddAccount = () => {
    navigate('/register');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profileForm);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      setProfileForm(prev => ({ ...prev, avatar: evt.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setProfileForm(prev => ({ ...prev, avatar: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
if (passwordForm.newPassword.length < 8) {
       toast.error('Password must be at least 8 characters');
       return;
     }
    setSaving(true);
    try {
      await updatePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password updated');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    if (user) {
      updateProfile({ theme: newTheme });
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Implement account deletion
      toast.error('Account deletion not implemented yet');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'appearance', label: 'Appearance', icon: MoonIcon },
    { id: 'progress', label: 'Progress', icon: Bars3Icon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Security', icon: KeyIcon },
    { id: 'danger', label: 'Danger Zone', icon: TrashIcon },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-64 flex-shrink-0">
          <CardContent className="p-0">
            <nav className="space-y-1 p-4" aria-label="Settings navigation">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${activeTab === tab.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <tab.icon className="w-5 h-5 flex-shrink-0" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
               <CardContent>
                 <div className="flex items-center gap-6 mb-5">
                   <div className="relative">
                     {profileForm.avatar ? (
                       <Avatar src={profileForm.avatar} name={profileForm.name} size="xl" />
                     ) : (
                       <Avatar name={profileForm.name} size="xl" />
                     )}
                     <button
                       type="button"
                       onClick={() => fileInputRef.current?.click()}
                       className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg"
                       aria-label="Change profile picture"
                     >
                       <CameraIcon className="w-4 h-4" />
                     </button>
                   </div>
                   <div>
                     <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Profile picture</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG up to 2MB</p>
                   </div>
                 </div>
                 <input
                   type="file"
                   ref={fileInputRef}
                   accept="image/*"
                   onChange={handleAvatarChange}
                   className="hidden"
                 />
                 {profileForm.avatar && (
                   <button
                     type="button"
                     onClick={handleRemoveAvatar}
                     className="text-sm text-red-500 hover:text-red-700 mb-4"
                   >
                     Remove photo
                   </button>
                 )}
                 <form onSubmit={handleProfileSubmit} className="space-y-5">
                   <Input label="Full Name" name="name" value={profileForm.name} onChange={(e) => setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} required />
                   <Input label="Email" name="email" type="email" value={profileForm.email} onChange={(e) => setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} required />
                   <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                     <Button type="submit" loading={saving}>Save Changes</Button>
                   </div>
                 </form>
               </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="label">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: SunIcon, desc: 'Always use light mode' },
                      { value: 'dark', label: 'Dark', icon: MoonIcon, desc: 'Always use dark mode' },
                      { value: 'system', label: 'System', icon: ComputerDesktopIcon, desc: 'Match system setting' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleThemeChange(option.value)}
                        className={`
                          p-4 rounded-xl border-2 text-left transition-all
                          ${theme === option.value
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <option.icon className={`w-6 h-6 ${theme === option.value ? 'text-indigo-600' : 'text-gray-400'}`} />
                          <span className="font-medium text-gray-900 dark:text-gray-50">{option.label}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'progress' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bars3Icon className="w-5 h-5 text-indigo-600" />
                  Task Progress Tracker
                </CardTitle>
                {!stats && (
                  <Button size="sm" variant="secondary" onClick={fetchStats} loading={statsLoading}>
                    Load Stats
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : stats ? (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
                      <RadialProgress value={stats.completed} max={stats.total} color="green" label="Completed" sublabel={`${stats.completed} of ${stats.total} tasks`} />
                      <RadialProgress value={stats.pending} max={stats.total} color="yellow" label="Pending" sublabel={`${stats.pending} tasks`} />
                      <RadialProgress value={stats.overdue} max={stats.total} color="red" label="Overdue" sublabel={`${stats.overdue} tasks`} />
                      <RadialProgress value={stats.dueToday} max={stats.total} color="blue" label="Due Today" sublabel={`${stats.dueToday} tasks`} />
                    </div>
                    {stats.byPriority.length > 0 && (
                      <div className="mt-8">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">By Priority</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {stats.byPriority.map((item) => {
                            const priorityColor = item._id === 'urgent' ? 'red' : item._id === 'high' ? 'orange' : item._id === 'medium' ? 'yellow' : 'green';
                            return (
                              <div key={item._id} className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${priorityColor === 'red' ? 'bg-red-500' : priorityColor === 'orange' ? 'bg-orange-500' : priorityColor === 'yellow' ? 'bg-amber-500' : 'bg-green-500'}`} />
                                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{item._id}</span>
                                <span className="font-medium text-gray-900 dark:text-gray-50">{item.count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bars3Icon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">Click "Load Stats" to see your progress</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-50">Push Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive browser notifications for reminders</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={user?.notificationsEnabled} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div>
                  <label className="label">Default Reminder Time</label>
                  <select defaultValue={user?.reminderTime || 15} className="input" onChange={(e) => updateProfile({ reminderTime: parseInt(e.target.value) })}>
                    <option value={0}>At time of event</option>
                    <option value={5}>5 minutes before</option>
                    <option value={15}>15 minutes before</option>
                    <option value={30}>30 minutes before</option>
                    <option value={60}>1 hour before</option>
                    <option value={1440}>1 day before</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <Input label="Current Password" name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} required />
                  <Input label="New Password" name="newPassword" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} required hint="At least 8 characters" />
                  <Input label="Confirm New Password" name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} required />
                  <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button type="submit" loading={saving}>Update Password</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'danger' && (
            <Card className="border-red-200 dark:border-red-900/30">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                  <TrashIcon className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/30">
                  <p className="text-red-800 dark:text-red-200">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
                <Button variant="danger" onClick={handleDeleteAccount} className="w-full">
                  Delete Account
                </Button>

                <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button variant="secondary" className="w-full" onClick={handleSwitchAccount}>
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                    Switch Account
                  </Button>
                  <Button variant="secondary" className="w-full" onClick={handleAddAccount}>
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Account
                  </Button>
                  <Button variant="secondary" className="w-full" onClick={handleLogout}>
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}