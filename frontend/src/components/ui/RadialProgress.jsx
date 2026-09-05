const radius = 42;
const circumference = 2 * Math.PI * radius;

export function RadialProgress({
  value = 0,
  max = 100,
  size = 104,
  strokeWidth = 8,
  label,
  sublabel,
  color = 'indigo',
  className = '',
  glow = false,
}) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const offset = circumference - (percentage / 100) * circumference;
  const center = size / 2;

  const colorMap = {
    indigo: { stroke: '#6366f1', glow: 'rgba(99,102,241,0.4)' },
    green: { stroke: '#22c55e', glow: 'rgba(34,197,94,0.4)' },
    yellow: { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
    red: { stroke: '#ef4444', glow: 'rgba(239,68,68,0.4)' },
    blue: { stroke: '#3b82f6', glow: 'rgba(59,130,246,0.4)' },
    purple: { stroke: '#a855f7', glow: 'rgba(168,85,247,0.4)' },
    cyan: { stroke: '#06b6d4', glow: 'rgba(6,182,212,0.4)' },
  };

  const { stroke, glow: glowColor } = colorMap[color] || colorMap.indigo;

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          strokeWidth={strokeWidth}
          className="stroke-gray-200 dark:stroke-dark-600"
          strokeLinecap="round"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={stroke}
          className="transition-all duration-700 ease-out"
          strokeLinecap="round"
          style={glow ? { filter: `drop-shadow(0 0 6px ${glowColor}) drop-shadow(0 0 12px ${glowColor})` } : undefined}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${glow ? 'neon-text' : 'text-gray-900 dark:text-gray-50'}`}>
          {Math.round(percentage)}
        </span>
        {label && <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</span>}
      </div>
      {sublabel && (
        <div className="mt-1 text-center">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{sublabel}</p>
        </div>
      )}
    </div>
  );
}
