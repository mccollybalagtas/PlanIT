import { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRightIcon, CheckIcon, ChevronDownIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';
import { Logo3D } from '../components/ui/Logo3D';

const features = [
  { label: 'Focus', title: 'Turn intention into momentum.', text: 'A calm command center for the work that matters today.', color: 'from-fuchsia-400 to-violet-500', metric: '04:32', detail: 'focus session remaining' },
  { label: 'Plan', title: 'See the shape of your week.', text: 'Move from scattered commitments to a plan you can actually trust.', color: 'from-cyan-300 to-blue-500', metric: '86%', detail: 'weekly clarity score' },
  { label: 'Grow', title: 'Make progress visible.', text: 'Small wins become a signal. Track goals without turning life into a spreadsheet.', color: 'from-amber-300 to-orange-500', metric: '12', detail: 'streak days' },
];

const faqs = [
  ['Is PlanIt free to try?', 'Yes. Create an account and start organizing your tasks, calendar, goals, and study sessions immediately.'],
  ['Does it work on mobile?', 'PlanIt is responsive by design, so your daily view feels just as focused on a phone as it does on a large screen.'],
  ['Can I use it for study and work?', 'Absolutely. Separate task flows, goals, notes, and study sets let you keep every kind of momentum in one place.'],
];

export function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-500, 500], [7, -7]), { stiffness: 120, damping: 20 });
  const rotateY = useSpring(useTransform(pointerX, [-700, 700], [-8, 8]), { stiffness: 120, damping: 20 });

  const handlePointerMove = (event) => {
    pointerX.set(event.clientX - window.innerWidth / 2);
    pointerY.set(event.clientY - window.innerHeight / 2);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05050a] text-white" onPointerMove={handlePointerMove}>
      <AnimatedBackground />
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-8">
        <Link to="/" aria-label="PlanIt home"><Logo3D size="sm" showName /></Link>
        <div className="hidden items-center gap-8 text-sm text-gray-400 md:flex"><a href="#experience" className="transition hover:text-white">Experience</a><a href="#principles" className="transition hover:text-white">Why PlanIt</a><a href="#faq" className="transition hover:text-white">FAQ</a></div>
        <Link to="/login" className="rounded-full border border-white/15 px-4 py-2 text-sm text-gray-200 transition hover:border-cyan-300/60 hover:text-white">Sign in</Link>
      </nav>

      <main className="relative z-10">
        <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-12 px-5 pb-24 pt-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-cyan-200"><SparklesIcon className="h-4 w-4" /> Your day, in focus</div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-tight sm:text-7xl lg:text-8xl">Make space for your <span className="gradient-text">next move.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-gray-400">PlanIt is a beautifully focused workspace for turning ambitious days into clear, calm progress.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link to="/register" className="neon-btn group gap-2 rounded-full px-6 py-3.5">Start planning free <ArrowRightIcon className="h-5 w-5 transition group-hover:translate-x-1" /></Link><a href="#experience" className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3.5 text-gray-300 transition hover:border-white/35 hover:text-white">Explore the system</a></div>
            <div className="mt-10 flex items-center gap-5 text-xs text-gray-500"><span className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-cyan-300" /> No credit card</span><span className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-cyan-300" /> Setup in 60 seconds</span></div>
          </motion.div>

          <motion.div className="relative mx-auto w-full max-w-2xl" style={{ rotateX, rotateY, transformPerspective: 1200 }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }}>
            <div className="absolute -inset-10 rounded-full bg-fuchsia-500/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#0c0c15]/85 p-3 shadow-2xl shadow-fuchsia-950/50 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div className="flex gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-rose-400/80" /><i className="h-2.5 w-2.5 rounded-full bg-amber-300/80" /><i className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" /></div><span className="font-mono text-[10px] tracking-[0.3em] text-gray-500">TODAY / 09:41</span></div>
              <div className="grid gap-3 p-3 sm:grid-cols-[1.1fr_0.9fr]"><div className="rounded-2xl bg-white/[0.04] p-5"><div className="mb-8 flex items-start justify-between"><div><p className="text-xs text-gray-500">Tuesday, September 05</p><h2 className="mt-2 text-2xl font-medium">Good morning, Alex.</h2></div><span className="rounded-lg bg-cyan-300/10 px-2 py-1 text-xs text-cyan-200">72%</span></div><div className="space-y-3">{['Ship the new welcome flow', 'Review product signals', 'Walk + clear the mind'].map((task, index) => <div key={task} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3"><span className={`h-4 w-4 rounded-full border ${index === 0 ? 'border-cyan-300 bg-cyan-300/20' : 'border-white/20'}`} /><span className={`text-sm ${index === 0 ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{task}</span><span className="ml-auto text-[10px] text-gray-600">{index === 0 ? 'DONE' : 'TODAY'}</span></div>)}</div></div><div className="space-y-3"><div className="rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-violet-600/10 p-5"><p className="text-xs uppercase tracking-widest text-fuchsia-200/70">Deep work</p><p className="mt-8 font-mono text-4xl">04:32</p><p className="mt-1 text-xs text-gray-500">session remaining</p><div className="mt-5 h-1 rounded-full bg-white/10"><div className="h-full w-3/5 rounded-full bg-fuchsia-300" /></div></div><div className="rounded-2xl bg-white/[0.04] p-5"><p className="text-xs text-gray-500">Weekly rhythm</p><div className="mt-5 flex h-16 items-end gap-2">{[40, 68, 55, 84, 62, 92, 48].map((height, index) => <div key={index} className={`flex-1 rounded-t-md ${index === 5 ? 'bg-cyan-300' : 'bg-white/15'}`} style={{ height: `${height}%` }} />)}</div><p className="mt-3 text-xs text-cyan-200">+18% from last week</p></div></div></div>
            </div>
          </motion.div>
        </section>

        <section id="experience" className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><div className="mb-12 max-w-2xl"><p className="text-xs uppercase tracking-[0.25em] text-cyan-300">One system, three modes</p><h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">Built around how progress actually feels.</h2></div><div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]"><div className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-3">{features.map((feature, index) => <button key={feature.label} onClick={() => setActiveFeature(index)} className={`min-w-[140px] rounded-2xl border p-4 text-left transition lg:w-full ${activeFeature === index ? 'border-white/25 bg-white/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}><span className="text-xs text-gray-500">0{index + 1}</span><p className="mt-6 font-medium">{feature.label}</p></button>)}</div><motion.div key={activeFeature} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 sm:p-12"><div className={`absolute right-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br ${features[activeFeature].color} opacity-20 blur-3xl`} /><div className="relative max-w-xl"><p className="font-mono text-sm text-gray-500">0{activeFeature + 1} / {features[activeFeature].label.toUpperCase()}</p><h3 className="mt-12 text-4xl font-medium sm:text-5xl">{features[activeFeature].title}</h3><p className="mt-5 text-lg leading-8 text-gray-400">{features[activeFeature].text}</p><div className="mt-12 flex items-end gap-4"><span className="font-mono text-5xl text-white">{features[activeFeature].metric}</span><span className="mb-1 text-sm text-gray-500">{features[activeFeature].detail}</span></div></div></motion.div></div></section>

        <section id="principles" className="border-y border-white/10 bg-white/[0.025] px-5 py-24 lg:px-8"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="text-xs uppercase tracking-[0.25em] text-fuchsia-300">A quieter productivity tool</p><h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Less noise. More signal.</h2></div><div className="grid gap-8 sm:grid-cols-3">{[['01', 'Clarity', 'See what deserves your attention now.'], ['02', 'Cadence', 'Build a rhythm that survives busy weeks.'], ['03', 'Agency', 'Shape the system around your life.']].map(([number, title, text]) => <div key={number} className="border-t border-white/15 pt-4"><span className="font-mono text-xs text-cyan-300">{number}</span><h3 className="mt-8 text-xl">{title}</h3><p className="mt-3 leading-7 text-gray-500">{text}</p></div>)}</div></div></section>

        <section id="faq" className="mx-auto max-w-4xl px-5 py-24 lg:px-8"><p className="text-center text-xs uppercase tracking-[0.25em] text-cyan-300">Questions, answered</p><h2 className="mt-4 text-center text-4xl font-semibold tracking-tight">Make it yours.</h2><div className="mt-12 space-y-3">{faqs.map(([question, answer], index) => <div key={question} className="rounded-2xl border border-white/10 bg-white/[0.03]"><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} className="flex w-full items-center justify-between gap-4 p-5 text-left font-medium"><span>{question}</span><ChevronDownIcon className={`h-5 w-5 shrink-0 text-gray-500 transition ${openFaq === index ? 'rotate-180 text-cyan-300' : ''}`} /></button>{openFaq === index && <p className="max-w-2xl px-5 pb-5 leading-7 text-gray-400">{answer}</p>}</div>)}</div></section>

        <section className="mx-auto max-w-7xl px-5 pb-28 lg:px-8"><div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-300/10 via-white/[0.04] to-fuchsia-400/10 px-6 py-16 text-center sm:px-12"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(103,232,249,0.18),transparent_55%)]" /><div className="relative"><p className="text-xs uppercase tracking-[0.25em] text-cyan-200">The next clear day starts here</p><h2 className="mx-auto mt-5 max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">Your attention is worth designing for.</h2><Link to="/register" className="neon-btn mt-9 inline-flex gap-2 rounded-full px-7 py-3.5">Create your workspace <ArrowRightIcon className="h-5 w-5" /></Link></div></div></section>
      </main>
      <footer className="relative z-10 flex flex-col justify-between gap-4 border-t border-white/10 px-5 py-8 text-xs text-gray-600 sm:flex-row lg:px-8"><span className="tracking-[0.2em]">PLANIT / MAKE SPACE</span><span>Designed for focused days.</span></footer>
    </div>
  );
}
