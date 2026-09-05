import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function FuturisticBootLoader({ children, minDuration = 2200 }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [phase, setPhase] = useState(0);
  const audioCtxRef = useRef(null);

  const phases = [
    'BOOTING SYSTEM',
    'LOADING NEURAL NET',
    'INITIALIZING MODULES',
    'CALIBRATING INTERFACE',
    'SYSTEM READY',
  ];

  const playChime = useCallback(() => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.12, now + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.45);
      });
    } catch (e) {
      // silent
    }
  }, []);

  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const elapsed = t - start;
      const pct = Math.min(100, (elapsed / minDuration) * 100);
      setProgress(pct);
      setPhase(Math.min(phases.length - 1, Math.floor((pct / 100) * phases.length)));
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        playChime();
        setTimeout(() => setDone(true), 600);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [minDuration, playChime, phases.length]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (e) { /* noop */ }
      }
    };
  }, []);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <>
      <AnimatePresence>
        {!done && (
          <motion.div
            key="boot"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
            style={{
              background:
                'radial-gradient(ellipse at center, #0a0a1a 0%, #02020a 50%, #000000 100%)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(0,240,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.12) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                  maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
                }}
              />
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full blur-3xl"
                  style={{
                    background: i % 2 === 0
                      ? 'radial-gradient(circle, rgba(0,240,255,0.4), transparent 70%)'
                      : 'radial-gradient(circle, rgba(168,85,247,0.4), transparent 70%)',
                    width: 300 + i * 50,
                    height: 300 + i * 50,
                    left: `${10 + i * 12}%`,
                    top: `${15 + (i % 3) * 25}%`,
                  }}
                  animate={{ x: [0, 40, -30, 0], y: [0, -30, 20, 0], scale: [1, 1.2, 0.9, 1] }}
                  transition={{ duration: 8 + i, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mb-12"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_30px_rgba(0,240,255,0.6)]" />
                    <div className="absolute inset-[3px] rounded-full bg-black" />
                    <div className="absolute inset-0 flex items-center justify-center text-white font-black text-sm tracking-tight">
                      <span className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">MC</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500">
                      PLANIT
                    </div>
                    <div className="text-[10px] tracking-[0.4em] text-cyan-400/60 mt-0.5">
                      NEXT-GEN PLANNER
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="relative w-48 h-48 mb-8">
                <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-4 rounded-full border border-purple-500/20 animate-ping" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />

                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00f0ff" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                  <circle cx="64" cy="64" r={radius} stroke="rgba(0,240,255,0.1)" strokeWidth="3" fill="none" />
                  <motion.circle
                    cx="64" cy="64" r={radius}
                    stroke="url(#grad1)" strokeWidth="3" fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.1, ease: 'linear' }}
                    style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.8))' }}
                  />
                  {[...Array(8)].map((_, i) => {
                    const angle = (i / 8) * Math.PI * 2;
                    const x1 = 64 + Math.cos(angle) * 60;
                    const y1 = 64 + Math.sin(angle) * 60;
                    const x2 = 64 + Math.cos(angle) * 64;
                    const y2 = 64 + Math.sin(angle) * 64;
                    return (
                      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,240,255,0.3)" strokeWidth="1" />
                    );
                  })}
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-black tabular-nums text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-purple-400">
                      {Math.floor(progress)}
                    </div>
                    <div className="text-xs text-cyan-400/70 tracking-widest mt-1">%</div>
                  </div>
                </div>
              </div>

              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-cyan-300 text-sm tracking-[0.4em] font-mono mb-6 h-5"
              >
                {phases[phase]}
              </motion.div>

              <div className="w-72 h-1 bg-cyan-500/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"
                  style={{ width: `${progress}%`, boxShadow: '0 0 12px rgba(0,240,255,0.8)' }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              <div className="mt-4 text-[10px] text-cyan-400/40 tracking-widest font-mono">
                v2.0.0 — CYBER EDITION
              </div>
            </div>

            <motion.div
              className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              animate={{ y: ['0%', '100%', '0%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{ filter: 'drop-shadow(0 0 6px #00f0ff)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}

export default FuturisticBootLoader;
export { FuturisticBootLoader };
