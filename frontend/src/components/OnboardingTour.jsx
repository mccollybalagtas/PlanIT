import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const steps = [
  { title: 'Your command center', text: 'Start here each day. Tasks, analytics, runs, goals, and focus time are visible in one calm view.', action: 'Got it' },
  { title: 'Log your first run', text: 'Open Run lab and start a session to track distance, elapsed time, pace, and your live route.', action: 'Open Run lab', href: '#run-lab' },
  { title: 'Set a meaningful goal', text: 'Create a target date and track progress toward the habit or milestone that matters next.', action: 'Create a goal', href: '/goals' },
];

export function OnboardingTour() {
  const [step, setStep] = useState(() => Number(localStorage.getItem('plannerhub-tour-step') || 0));
  const [visible, setVisible] = useState(() => localStorage.getItem('plannerhub-tour-done') !== 'true');
  if (!visible) return null;
  const current = steps[step];

  const finish = () => {
    localStorage.setItem('plannerhub-tour-done', 'true');
    setVisible(false);
  };

  const advance = () => {
    if (step === steps.length - 1) finish();
    else {
      const next = step + 1;
      localStorage.setItem('plannerhub-tour-step', String(next));
      setStep(next);
    }
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-end justify-center bg-black/30 p-4 backdrop-blur-[2px] sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-neon-purple/30 bg-cyber-900/95 p-6 shadow-2xl shadow-purple-950/50">
        <div className="flex items-start justify-between"><div className="flex gap-1.5">{steps.map((item, index) => <span key={item.title} className={`h-1.5 w-8 rounded-full ${index <= step ? 'bg-neon-cyan' : 'bg-cyber-600'}`} />)}</div><button onClick={finish} aria-label="Close onboarding"><XMarkIcon className="h-5 w-5 text-gray-500" /></button></div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-neon-cyan">First run / 0{step + 1}</p>
        <h2 className="mt-3 text-2xl font-bold text-white">{current.title}</h2>
        <p className="mt-3 text-sm leading-6 text-gray-400">{current.text}</p>
        <div className="mt-6 flex items-center justify-between gap-3">
          <button onClick={finish} className="text-sm text-gray-500 hover:text-gray-300">Skip tour</button>
          {current.href ? <Link to={current.href} onClick={finish} className="neon-btn inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm">{current.action}<ArrowRightIcon className="h-4 w-4" /></Link> : <button onClick={advance} className="neon-btn inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm">{current.action}<CheckIcon className="h-4 w-4" /></button>}
        </div>
      </div>
    </div>
  );
}
