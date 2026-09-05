import { forwardRef } from 'react';

export const Card = forwardRef(({
  children,
  className = '',
  hover = false,
  padding = 'p-6',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`
        glass-card
        ${hover ? 'hover:shadow-glass-hover dark:hover:shadow-glass-hover hover:-translate-y-1' : ''}
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader = forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div ref={ref} className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <h3 ref={ref} className={`text-lg font-semibold text-gray-900 dark:text-gray-50 ${className}`} {...props}>
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <p ref={ref} className={`mt-1 text-sm text-gray-500 dark:text-gray-400 ${className}`} {...props}>
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div ref={ref} className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center ${className}`} {...props}>
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';