import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { resettoken } = useParams();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const validate = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await resetPassword(resettoken, formData.password);
      toast.success('Password has been reset successfully');
      navigate('/login');
    } catch (error) {
      if (error.response?.status === 400) {
        setTokenValid(false);
      }
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="resetSphere" cx="35%" cy="30%" r="65%">
                      <stop offset="0%" stopColor="#c7d2fe"/>
                      <stop offset="50%" stopColor="#6366f1"/>
                      <stop offset="100%" stopColor="#3730a3"/>
                    </radialGradient>
                    <linearGradient id="resetLetter" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff"/>
                      <stop offset="100%" stopColor="#e0e7ff"/>
                    </linearGradient>
                    <filter id="resetShadow" x="-30%" y="-30%" width="160%" height="160%">
                      <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#1e1b4b" floodOpacity="0.35"/>
                    </filter>
                  </defs>
                  <rect x="8" y="8" width="84" height="84" rx="22" fill="url(#resetSphere)" filter="url(#resetShadow)"/>
                  <ellipse cx="36" cy="32" rx="16" ry="11" fill="white" opacity="0.22"/>
                  <g transform="translate(2, 2)" opacity="0.25">
                    <text x="50" y="66" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontSize="42" fontWeight="900" fill="#1e1b4b">MC</text>
                  </g>
                  <text x="50" y="64" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontSize="42" fontWeight="900" fill="url(#resetLetter)">MC</text>
                </svg>
              </div>
              <span className="text-2xl font-bold gradient-text">PlanIt</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Invalid or expired link</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">This password reset link has expired or is invalid.</p>
          </div>

          <Card className="animate-fade-in">
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Please request a new password reset link.</p>
              <Link to="/forgot-password">
                <Button className="w-full">Request new link</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 5v14h1.5V9l3 3v6H13V5h-1.5v8.5L9 11.5V5H7z" />
                <path d="M16.5 5v14h1.5V5h-1.5zm3 0v14h1.5V5h-1.5z" />
                <path d="M20 5v14l2-6-2-8v14z" />
              </svg>
            </div>
            <span className="text-2xl font-bold gradient-text">PlanIt</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Reset password</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Enter your new password below</p>
        </div>

        <Card className="animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Input
                label="New Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
                icon={<LockClosedIcon className="w-5 h-5 text-gray-400" />}
                hint="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="••••••••"
              icon={<LockClosedIcon className="w-5 h-5 text-gray-400" />}
            />

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Reset password
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                <ArrowLeftIcon className="w-4 h-4 inline mr-1" />
                Back to login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}