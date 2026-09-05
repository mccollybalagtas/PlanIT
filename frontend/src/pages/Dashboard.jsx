import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { goalApi, taskApi } from '../services/api';
import {
  PriorityBadge, CategoryBadge, RadialProgress
} from '../components/ui';
import { motion } from 'framer-motion';
import {
  PlusIcon, CheckCircleIcon, CalendarDaysIcon,
  ArrowRightIcon, ChartBarIcon, ExclamationTriangleIcon,
  BoltIcon, FireIcon, RocketLaunchIcon, TrashIcon, MapPinIcon,
  PlayIcon, StopIcon, TrophyIcon, FlagIcon, SparklesIcon
} from '@heroicons/react/24/outline';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [goals, setGoals] = useState([]);
  const [weeklyData, setWeeklyData] = useState([
    { day: 'Sun', value: 0 },
    { day: 'Mon', value: 0 },
    { day: 'Tue', value: 0 },
    { day: 'Wed', value: 0 },
    { day: 'Thu', value: 0 },
    { day: 'Fri', value: 0 },
    { day: 'Sat', value: 0 },
  ]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const [runActive, setRunActive] = useState(false);
  const [runStartedAt, setRunStartedAt] = useState(null);
  const [runElapsed, setRunElapsed] = useState(0);
  const [runDistance, setRunDistance] = useState(() => Number(localStorage.getItem('plannerhub-run-distance') || 0));
  const [runSessions, setRunSessions] = useState(() => Number(localStorage.getItem('plannerhub-run-sessions') || 0));
  const [elevationGain, setElevationGain] = useState(0);
  const [routePoints, setRoutePoints] = useState([]);
  const runWatchRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  useEffect(() => {
    if (!runActive || !runStartedAt) return undefined;
    const interval = setInterval(() => setRunElapsed(Math.floor((Date.now() - runStartedAt) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [runActive, runStartedAt]);

  useEffect(() => () => {
    if (runWatchRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(runWatchRef.current);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, tasksRes, allTasksRes, goalsRes] = await Promise.all([
        taskApi.getStats(),
        taskApi.getAll({ completed: 'false', sort: 'dueDate', limit: 10 }),
        taskApi.getAll({ limit: 100 }),
        goalApi.getAll(),
      ]);
      setStats(statsRes.data.stats);
      setUpcomingTasks(tasksRes.data.tasks);
      setGoals(goalsRes.data.goals || []);

      // Compute weekly analytics from actual task data
      const allTasks = allTasksRes.data.tasks;
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyCounts = days.map((day, idx) => {
        const dayStart = new Date(startOfWeek);
        dayStart.setDate(startOfWeek.getDate() + idx);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayStart.getDate() + 1);

        const count = allTasks.filter(t => {
          const taskDate = t.completedAt ? new Date(t.completedAt) : (t.dueDate ? new Date(t.dueDate) : (t.createdAt ? new Date(t.createdAt) : null));
          return taskDate && taskDate >= dayStart && taskDate < dayEnd;
        }).length;

        return { day, value: count };
      });

      setWeeklyData(weeklyCounts);

      // Build reminders from tasks and events due today or tomorrow
      const taskReminders = tasksRes.data.tasks
        .filter(t => t.dueDate && (isToday(parseISO(t.dueDate)) || isTomorrow(parseISO(t.dueDate))))
        .map(t => ({
          id: t._id,
          title: t.title,
          time: t.dueDate ? format(parseISO(t.dueDate), 'MMM d, h:mm a') : 'No date',
          type: 'task',
          priority: t.priority,
          dueDate: t.dueDate,
        }));

      const allReminders = taskReminders
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

      setReminders(allReminders);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskApi.delete(taskId);
      toast.success('Task deleted');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleCreateTask = () => navigate('/tasks?new=true');
  const handleCreateEvent = () => navigate('/calendar?new=true');

  const getDueDateLabel = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isToday(d)) return { label: 'Today', variant: 'danger' };
    if (isTomorrow(d)) return { label: 'Tomorrow', variant: 'warning' };
    if (isPast(d)) return { label: 'Overdue', variant: 'danger' };
    return { label: format(d, 'MMM d'), variant: 'default' };
  };

  const formatTimer = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTimerToggle = () => {
    setTimerRunning(!timerRunning);
  };

  const handleTimerReset = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
  };

  const distanceBetween = (first, second) => {
    const radius = 6371;
    const latDelta = (second.latitude - first.latitude) * Math.PI / 180;
    const lonDelta = (second.longitude - first.longitude) * Math.PI / 180;
    const a = Math.sin(latDelta / 2) ** 2 + Math.cos(first.latitude * Math.PI / 180) * Math.cos(second.latitude * Math.PI / 180) * Math.sin(lonDelta / 2) ** 2;
    return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleRunToggle = () => {
    if (runActive) {
      setRunActive(false);
      if (runWatchRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(runWatchRef.current);
      const completedSessions = runSessions + 1;
      setRunSessions(completedSessions);
      localStorage.setItem('plannerhub-run-sessions', String(completedSessions));
      toast.success(`Run paused at ${runDistance.toFixed(2)} km`);
      return;
    }
    if (!navigator.geolocation) {
      toast.error('Location tracking is not supported in this browser');
      return;
    }
    const startedAt = Date.now();
    setRunStartedAt(startedAt);
    setRunElapsed(0);
    setRunDistance(0);
    setElevationGain(0);
    setRoutePoints([]);
    setRunActive(true);
    runWatchRef.current = navigator.geolocation.watchPosition((position) => {
      const nextPoint = { latitude: position.coords.latitude, longitude: position.coords.longitude, altitude: position.coords.altitude || 0 };
      setRoutePoints((current) => {
        if (current.length > 0) {
          const previous = current[current.length - 1];
          setRunDistance((distance) => {
            const nextDistance = distance + distanceBetween(previous, nextPoint);
            localStorage.setItem('plannerhub-run-distance', String(nextDistance));
            return nextDistance;
          });
          setElevationGain((elevation) => elevation + Math.max(0, nextPoint.altitude - previous.altitude));
        }
        return [...current.slice(-39), nextPoint];
      });
    }, () => toast.error('Location permission is needed for live route tracking'), { enableHighAccuracy: true, maximumAge: 5000 });
  };

  const formatRunTime = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  const runPace = runDistance > 0 ? runElapsed / 60 / runDistance : 0;
  const weeklyGoal = goals.find((goal) => goal.category === 'fitness') || goals[0];
  const goalProgress = weeklyGoal?.progress || 0;
  const goalLabel = weeklyGoal?.title || 'Create your first goal';
  const goalDetail = weeklyGoal?.targetDate ? `${goalProgress}% by ${format(new Date(weeklyGoal.targetDate), 'MMM d')}` : '0% progress';
  const routePath = routePoints.length > 1
    ? routePoints.map((point, index) => {
      const lats = routePoints.map((item) => item.latitude);
      const lons = routePoints.map((item) => item.longitude);
      const x = 12 + ((point.longitude - Math.min(...lons)) / Math.max(Math.max(...lons) - Math.min(...lons), 0.00001)) * 176;
      const y = 108 - ((point.latitude - Math.min(...lats)) / Math.max(Math.max(...lats) - Math.min(...lats), 0.00001)) * 96;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ')
    : 'M12,108 C48,70 70,92 102,56 S160,28 188,18';

  const statCards = [
    { label: 'Total Tasks', value: stats?.total || 0, icon: RocketLaunchIcon, trend: stats?.total > 0 ? `+${stats.total}` : '0', up: true, type: 'purple' },
    { label: 'Completed', value: stats?.completed || 0, icon: CheckCircleIcon, trend: stats?.completed > 0 ? `+${stats.completed}` : '0', up: true, type: 'blue' },
    { label: 'In Progress', value: stats?.pending || 0, icon: FireIcon, trend: stats?.pending > 0 ? `${stats.pending}` : '0', up: stats?.pending > 0, type: 'cyan' },
    { label: 'Overdue', value: stats?.overdue || 0, icon: ExclamationTriangleIcon, trend: stats?.overdue > 0 ? `-${stats.overdue}` : '0', up: false, type: 'pink' },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="neon-card h-32">
              <div className="h-4 bg-cyber-600 rounded w-3/4 mb-3"/>
              <div className="h-8 bg-cyber-600 rounded w-1/2"/>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="neon-card h-64"/><div className="neon-card h-64"/><div className="neon-card h-64"/>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 animate-fade-in"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, <span className="gradient-text">{user?.name?.split(' ')[0] || 'there'}</span>!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening across your projects</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCreateTask}
            className="neon-btn text-sm"
          >
            <PlusIcon className="w-4 h-4 mr-2" />New Task
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCreateEvent}
            className="neon-btn-blue text-sm"
          >
            <PlusIcon className="w-4 h-4 mr-2" />New Event
          </motion.button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div key={stat.label} className={`neon-card ${stat.type === 'blue' ? 'neon-card-blue' : ''} group cursor-pointer`} style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-50 mt-2 font-mono font-bold tracking-wider">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-xs font-semibold ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.trend}
                  </span>
                  <span className="text-xs text-gray-500">total</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.type === 'purple' ? 'bg-neon-purple/15' : stat.type === 'blue' ? 'bg-neon-blue/15' : stat.type === 'cyan' ? 'bg-neon-cyan/15' : 'bg-neon-pink/15'}`} style={{ boxShadow: stat.type === 'purple' ? '0 0 15px rgba(168,85,247,0.3)' : stat.type === 'blue' ? '0 0 15px rgba(59,130,246,0.3)' : stat.type === 'cyan' ? '0 0 15px rgba(6,182,212,0.3)' : '0 0 15px rgba(236,72,153,0.3)' }}>
                <stat.icon className={`w-6 h-6 ${stat.type === 'purple' ? 'text-neon-purple-bright' : stat.type === 'blue' ? 'text-neon-blue-bright' : stat.type === 'cyan' ? 'text-neon-cyan' : 'text-neon-pink'}`} />
              </div>
            </div>
            <div className="mt-3 h-1 rounded-full bg-cyber-600 overflow-hidden">
              <div className={`h-full rounded-full ${stat.type === 'purple' ? 'bg-neon-purple' : stat.type === 'blue' ? 'bg-neon-blue' : stat.type === 'cyan' ? 'bg-neon-cyan' : 'bg-neon-pink'}`} style={{ width: `${Math.min(100, (stat.value / (stats?.total || 1)) * 100)}%`, boxShadow: `0 0 10px ${stat.type === 'purple' ? 'rgba(168,85,247,0.5)' : stat.type === 'blue' ? 'rgba(59,130,246,0.5)' : stat.type === 'cyan' ? 'rgba(6,182,212,0.5)' : 'rgba(236,72,153,0.5)'}` }} />
            </div>
          </div>
        ))}
      </div>

      <section id="run-lab" className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="neon-card overflow-hidden border border-neon-cyan/20 bg-gradient-to-br from-cyan-950/30 via-cyber-900 to-purple-950/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-neon-cyan"><MapPinIcon className="h-4 w-4" /> Run lab</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Move with momentum.</h2>
              <p className="mt-1 text-sm text-gray-400">Live route, pace, and personal progress in one view.</p>
            </div>
            <button onClick={handleRunToggle} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${runActive ? 'border border-red-400/30 bg-red-400/10 text-red-300' : 'neon-btn-blue'}`}>
              {runActive ? <StopIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}{runActive ? 'Pause run' : 'Start run'}
            </button>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative min-h-56 overflow-hidden rounded-2xl border border-white/10 bg-[#07131b]">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(34,211,238,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.16) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
              <svg viewBox="0 0 200 120" className="relative h-full min-h-56 w-full" role="img" aria-label="Run trajectory">
                <path d={routePath} fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 4" className="drop-shadow-[0_0_5px_rgba(34,211,238,.9)]" />
                {routePoints.length > 0 && <circle cx="188" cy="18" r="4" fill="#f0abfc" className="animate-pulse" />}
              </svg>
              <div className="absolute bottom-3 left-3 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[10px] uppercase tracking-widest text-gray-400">{runActive ? 'GPS live' : 'Ready to track'}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['Distance', `${runDistance.toFixed(2)} km`, 'text-neon-cyan'], ['Elapsed', formatRunTime(runElapsed), 'text-neon-purple-bright'], ['Avg pace', runPace ? `${runPace.toFixed(1)} min/km` : '--', 'text-neon-blue-bright'], ['Elevation', '--', 'text-amber-300']].map(([label, value, color]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs text-gray-500">{label}</p><p className={`mt-3 font-mono text-xl font-bold ${color}`}>{value}</p></div>)}
            </div>
          </div>
        </div>
        <div className="neon-card border border-neon-purple/20">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-neon-purple-bright"><FlagIcon className="h-4 w-4" /> Goal control</p>
          <div className="mt-4 space-y-5">
            {[['Weekly mileage', Math.min(100, Math.round((runDistance / 20) * 100)), `${runDistance.toFixed(1)} / 20 km`], ['Run frequency', Math.min(100, runSessions * 20), `${runSessions} / 5 sessions`], ['Focus streak', 0, '0 day streak']].map(([label, value, detail]) => <div key={label}><div className="flex items-center justify-between text-sm"><span className="text-gray-300">{label}</span><span className="font-mono text-neon-cyan">{detail}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-cyber-600"><div className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan transition-all duration-700" style={{ width: `${value}%` }} /></div></div>)}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-xl bg-amber-400/10 p-3"><TrophyIcon className="h-5 w-5 text-amber-300" /><p className="mt-2 text-lg font-bold text-white">{runSessions * 100} XP</p><p className="text-xs text-gray-500">Run rewards</p></div><div className="rounded-xl bg-fuchsia-400/10 p-3"><SparklesIcon className="h-5 w-5 text-fuchsia-300" /><p className="mt-2 text-lg font-bold text-white">0 days</p><p className="text-xs text-gray-500">Current streak</p></div></div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Analytics Bar Chart */}
        <div className="lg:col-span-2 neon-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-50 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-neon-purple-bright" />
                Weekly Analytics
              </h3>
                <p className="text-sm text-gray-400 mt-1">Tasks per day this week</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-neon">This Week</span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-3 h-48 px-2">
            {(() => {
              const maxVal = Math.max(...weeklyData.map(d => d.value), 1);
              const colors = ['#a855f7', '#c084fc', '#3b82f6', '#60a5fa', '#06b6d4', '#a855f7', '#3b82f6'];
              return weeklyData.map((bar, idx) => (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative group">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">{bar.value}</div>
                    <div
                      className="w-full rounded-t-lg transition-all duration-500 group-hover:scale-105 cursor-pointer"
                      style={{
                        height: `${Math.max((bar.value / maxVal) * 160, 4)}px`,
                        background: `linear-gradient(180deg, ${colors[idx]} 0%, ${colors[idx]}88 100%)`,
                        boxShadow: `0 0 15px ${colors[idx]}40, 0 4px 15px ${colors[idx]}20`,
                        animationDelay: `${idx * 100}ms`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-400">{bar.day}</span>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Project Status Circular Progress */}
        <div className="neon-card-blue">
          <h3 className="text-lg font-semibold text-gray-50 mb-4 flex items-center gap-2">
            <BoltIcon className="w-5 h-5 text-neon-blue-bright" />
            Project Status
          </h3>
          <div className="flex flex-col items-center gap-4">
            <RadialProgress value={stats?.completed || 0} max={stats?.total || 1} color="purple" size={120} strokeWidth={10} glow label="%" />
            <div className="grid grid-cols-2 gap-3 w-full mt-2">
              <div className="text-center p-2 rounded-lg bg-cyber-700/50">
                <p className="text-lg font-bold text-neon-purple-bright font-mono font-bold tracking-wider">{stats?.completed || 0}</p>
                <p className="text-xs text-gray-400">Done</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-cyber-700/50">
                <p className="text-lg font-bold text-neon-blue-bright font-mono font-bold tracking-wider">{stats?.pending || 0}</p>
                <p className="text-xs text-gray-400">Active</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-cyber-700/50">
                <p className="text-lg font-bold text-neon-cyan font-mono font-bold tracking-wider">{stats?.overdue || 0}</p>
                <p className="text-xs text-gray-400">Overdue</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-cyber-700/50">
                <p className="text-lg font-bold text-neon-pink font-mono font-bold tracking-wider">{stats?.total || 0}</p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task List & Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2 neon-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-50 flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-neon-cyan" />
              Upcoming Tasks
            </h3>
            <Link to="/tasks" className="text-sm text-neon-purple-bright hover:text-neon-blue-bright transition-colors flex items-center gap-1">
              View all <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircleIcon className="w-14 h-14 text-neon-purple/30 mx-auto mb-3" />
              <p className="text-gray-400">No upcoming tasks. Enjoy your free time!</p>
              <button onClick={handleCreateTask} className="neon-btn text-sm mt-4">Add Task</button>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.map((task) => (
                <div key={task._id} className="flex items-center gap-3 p-3 rounded-xl bg-cyber-700/30 hover:bg-cyber-700/60 border border-transparent hover:border-neon-purple/20 transition-all group">
                  <div className="flex-shrink-0 w-5 h-5 rounded border-2 border-neon-purple/30 hover:border-neon-purple transition-colors" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/tasks/${task._id}`} className="font-medium text-gray-100 truncate group-hover:text-neon-purple-bright transition-colors">{task.title}</Link>
                    <div className="flex items-center gap-2 mt-1">
                      <PriorityBadge priority={task.priority} />
                      <CategoryBadge category={task.category} />
                      {task.dueDate && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getDueDateLabel(task.dueDate).variant === 'danger' ? 'bg-red-500/15 text-red-400' : getDueDateLabel(task.dueDate).variant === 'warning' ? 'bg-amber-500/15 text-amber-400' : 'bg-cyber-600 text-gray-400'}`}>
                          {getDueDateLabel(task.dueDate).label}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteTask(task._id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    aria-label="Delete task"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reminders Panel */}
        <div className="neon-card-blue">
          <h3 className="text-lg font-semibold text-gray-50 mb-4 flex items-center gap-2">
            <CalendarDaysIcon className="w-5 h-5 text-neon-blue-bright" />
            Reminders
          </h3>
          {reminders.length === 0 ? (
            <div className="text-center py-6">
              <CalendarDaysIcon className="w-12 h-12 text-neon-blue/30 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No upcoming reminders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="flex items-start gap-3 p-3 rounded-xl bg-cyber-700/30 border border-neon-blue/10 hover:border-neon-blue/30 transition-all">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neon-blue/15 flex items-center justify-center">
                    {reminder.type === 'task' ? <CheckCircleIcon className="w-5 h-5 text-neon-cyan" /> : <CalendarDaysIcon className="w-5 h-5 text-neon-blue-bright" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-100 truncate">{reminder.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{reminder.time}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${reminder.type === 'task' ? (reminder.priority === 'high' ? 'bg-red-500/15 text-red-400' : reminder.priority === 'medium' ? 'bg-amber-500/15 text-amber-400' : 'bg-neon-cyan/15 text-neon-cyan') : 'bg-neon-blue/15 text-neon-blue-bright'}`}>
                    {reminder.type === 'task' ? reminder.priority || 'task' : 'event'}
                  </span>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => navigate('/calendar')} className="w-full mt-4 neon-btn-blue text-sm py-3">
            <BoltIcon className="w-4 h-4 mr-2" />Check all reminders
          </button>
        </div>
      </div>

      {/* Time Tracker Widget */}
      <div className="neon-card-blue flex flex-col items-center justify-center text-center">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Current Time</h3>
        <p className="text-4xl font-bold font-mono font-bold tracking-wider text-neon-blue-bright tracking-widest">
          {format(currentTime, 'HH:mm:ss')}
        </p>
        <p className="text-sm text-gray-400 mt-2">{format(currentTime, 'EEEE, MMM d')}</p>
        <div className="mt-4 w-full h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
        <div className="mt-4 w-full">
          <p className="text-xs text-gray-400 mb-2">Focus Timer</p>
          <p className="text-3xl font-bold font-mono font-bold tracking-wider text-neon-purple-bright tracking-wider">
            {formatTimer(timerSeconds)}
          </p>
          <div className="flex gap-2 mt-3">
            <button onClick={handleTimerToggle} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${timerRunning ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'neon-btn'}`}>
              {timerRunning ? 'Pause' : 'Start'}
            </button>
            <button onClick={handleTimerReset} className="px-4 py-2 rounded-lg text-sm font-medium bg-cyber-700/50 text-gray-300 border border-cyber-600 hover:border-neon-purple/30 transition-all">
              Reset
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
