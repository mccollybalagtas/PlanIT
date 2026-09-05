import { useState, useEffect } from 'react';
import { initAudio } from '../../utils/sound';

export function BootLoader({ children, loadingTime = 2500 }) {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const steps = [15, 35, 55, 75, 90, 100];
    let i = 0;
    const interval = setInterval(() => {
      setProgress(steps[i]);
      i++;
      if (i >= steps.length) {
        clearInterval(interval);
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    }, loadingTime / steps.length);

    initAudio();

    return () => clearInterval(interval);
  }, [loadingTime]);

  if (!loading) {
    return children;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500">
      <div className="text-center">
              <svg className="w-20 h-20 mb-4 mx-auto" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="bootSphere" cx="35%" cy="30%" r="65%">
                    <stop offset="0%" stopColor="#c7d2fe"/>
                    <stop offset="50%" stopColor="#6366f1"/>
                    <stop offset="100%" stopColor="#3730a3"/>
                  </radialGradient>
                  <linearGradient id="bootLetter" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff"/>
                    <stop offset="100%" stopColor="#e0e7ff"/>
                  </linearGradient>
                  <filter id="bootShadow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#1e1b4b" floodOpacity="0.35"/>
                  </filter>
                </defs>
                <rect x="8" y="8" width="84" height="84" rx="22" fill="url(#bootSphere)" filter="url(#bootShadow)"/>
                <ellipse cx="36" cy="32" rx="16" ry="11" fill="white" opacity="0.22"/>
                <g transform="translate(2, 2)" opacity="0.25">
                  <text x="50" y="66" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontSize="42" fontWeight="900" fill="#1e1b4b">MC</text>
                </g>
                <text x="50" y="64" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontSize="42" fontWeight="900" fill="url(#bootLetter)">MC</text>
              </svg>
        <h1 className="text-3xl font-bold text-white mb-2">PlanIt</h1>
        <p className="text-white/80 text-sm mb-6">Initializing your workspace...</p>

        <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-white transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 text-white/60 text-xs">{progress}%</div>
      </div>
    </div>
  );
}
