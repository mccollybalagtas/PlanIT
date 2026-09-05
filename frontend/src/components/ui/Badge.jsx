export function Badge({ children, variant = 'default', className = '', dot = false }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  };

  const dotColors = {
    default: 'bg-gray-400',
    primary: 'bg-indigo-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
      ${variants[variant]} ${className}
    `}>
      {dot && <span className={`${dotColors[variant]} w-1.5 h-1.5 rounded-full`} />}
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const variants = {
    low: 'success',
    medium: 'info',
    high: 'warning',
    urgent: 'danger',
  };

  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  };

  return <Badge variant={variants[priority]} dot>{labels[priority]}</Badge>;
}

export function CategoryBadge({ category }) {
  const variants = {
    personal: 'primary',
    work: 'purple',
    shopping: 'pink',
    health: 'success',
    education: 'info',
    finance: 'warning',
    other: 'default',
  };

  const labels = {
    personal: 'Personal',
    work: 'Work',
    shopping: 'Shopping',
    health: 'Health',
    education: 'Education',
    finance: 'Finance',
    other: 'Other',
  };

  return <Badge variant={variants[category]}>{labels[category]}</Badge>;
}