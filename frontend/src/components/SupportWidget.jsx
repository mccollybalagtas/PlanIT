import { useState } from 'react';
import { ChatBubbleLeftRightIcon, ChevronDownIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';

const answers = {
  'How do I start a run?': 'Open Run lab on your dashboard, allow location access, then press Start run. Your route and pace update as you move.',
  'Where are my goals?': 'Open the workspace menu and choose Goals. You can set target dates, progress, and priorities there.',
  'Can I use PlanIt offline?': 'Yes. Enable Offline mode from the workspace menu. Your local preferences remain available until cloud sync is restored.',
};

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setSent(true);
    setMessage('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70]">
      {open && (
        <div className="mb-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-neon-purple/30 bg-cyber-900/95 shadow-2xl shadow-purple-950/40 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-neon-purple/20 to-neon-blue/10 px-4 py-3">
            <div><p className="text-sm font-semibold text-white">PlanIt support</p><p className="text-xs text-gray-400">Quick answers, right here</p></div>
            <button onClick={() => setOpen(false)} aria-label="Close support"><XMarkIcon className="h-5 w-5 text-gray-400" /></button>
          </div>
          <div className="space-y-2 p-3">
            {Object.entries(answers).map(([question, answer]) => (
              <button key={question} onClick={() => { setMessage(answer); setSent(false); }} className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left text-xs text-gray-300 transition hover:border-neon-purple/40 hover:bg-white/[0.08]">{question}</button>
            ))}
            {sent && <p className="rounded-xl bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300">Thanks. Your inquiry is queued for support.</p>}
            <form onSubmit={submit} className="flex gap-2 pt-1">
              <input value={message} onChange={(event) => { setMessage(event.target.value); setSent(false); }} placeholder="Ask or contact support..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white outline-none placeholder:text-gray-600 focus:border-neon-purple/60" aria-label="Support message" />
              <button type="submit" aria-label="Send support message" className="rounded-xl bg-neon-purple/80 px-3 text-white transition hover:bg-neon-purple"><PaperAirplaneIcon className="h-4 w-4" /></button>
            </form>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)} aria-label={open ? 'Close support chat' : 'Open support chat'} className="group flex items-center gap-2 rounded-full border border-neon-purple/40 bg-cyber-900/90 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-purple-950/40 backdrop-blur-xl transition hover:-translate-y-1 hover:border-neon-cyan/60">
        {open ? <ChevronDownIcon className="h-5 w-5" /> : <ChatBubbleLeftRightIcon className="h-5 w-5 text-neon-cyan" />}
        <span className="hidden sm:inline">Need help?</span>
      </button>
    </div>
  );
}
