import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [formData, setFormData] = useState({ email: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await forgotPassword(formData.email);
      setEmailSent(true);
      toast.success('If an account exists, a reset link has been sent');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="forgotSphere" cx="35%" cy="30%" r="65%">
                      <stop offset="0%" stopColor="#c7d2fe"/>
                      <stop offset="50%" stopColor="#6366f1"/>
                      <stop offset="100%" stopColor="#3730a3"/>
                    </radialGradient>
                    <linearGradient id="forgotLetter" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff"/>
                      <stop offset="100%" stopColor="#e0e7ff"/>
                    </linearGradient>
                    <filter id="forgotShadow" x="-30%" y="-30%" width="160%" height="160%">
                      <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#1e1b4b" floodOpacity="0.35"/>
                    </filter>
                  </defs>
                  <rect x="8" y="8" width="84" height="84" rx="22" fill="url(#forgotSphere)" filter="url(#forgotShadow)"/>
                  <ellipse cx="36" cy="32" rx="16" ry="11" fill="white" opacity="0.22"/>
                  <g transform="translate(2, 2)" opacity="0.25">
                    <text x="50" y="66" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontSize="42" fontWeight="900" fill="#1e1b4b">MC</text>
                  </g>
                  <text x="50" y="64" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontSize="42" fontWeight="900" fill="url(#forgotLetter)">MC</text>
                </svg>
              </div>
              <span className="text-2xl font-bold gradient-text">PlanIt</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Check your email</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">We've sent a password reset link to {formData.email}</p>
          </div>

          <Card className="animate-fade-in">
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">The link expires in 10 minutes for security.</p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => { setEmailSent(false); setFormData({ email: '' }); }} variant="secondary" className="w-full">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Enter different email
                </Button>
                <Link to="/login">
                  <Button variant="ghost" className="w-full">Back to login</Button>
                </Link>
              </div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Forgot password?</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Enter your email and we'll send you a reset link</p>
        </div>

        <Card className="animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
              icon={<EnvelopeIcon className="w-5 h-5 text-gray-400" />}
            />

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Send reset link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Remember your password?{' '}
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}