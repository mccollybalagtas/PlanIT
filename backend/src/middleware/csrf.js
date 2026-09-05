const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const configuredOrigins = (process.env.CORS_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean);
const CSRF_EXEMPT_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/health',
];

export const csrfProtection = (req, res, next) => {
  if (SAFE_METHODS.includes(req.method)) return next();
  if (CSRF_EXEMPT_PATHS.some(p => req.path.startsWith(p))) return next();

  const origin = req.headers.origin || req.headers.referer;
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const developmentOrigins = process.env.NODE_ENV === 'production'
        ? []
        : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174', 'http://192.168.5.101:5174'];
      const isAllowed = [
        process.env.CLIENT_URL || 'http://localhost:5173',
        ...developmentOrigins,
        ...configuredOrigins,
      ].includes(originUrl.origin);
      if (!isAllowed) {
        return res.status(403).json({ success: false, message: 'Invalid origin' });
      }
    } catch (e) {
      return res.status(403).json({ success: false, message: 'Invalid origin' });
    }
  }

  const tokenFromHeader = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
  const tokenFromBody = req.body?._csrf;
  const providedToken = tokenFromHeader || tokenFromBody;
  const cookieToken = req.cookies?.['XSRF-TOKEN'];

  if (providedToken && cookieToken && providedToken === cookieToken && /^[a-f0-9]{64}$/i.test(providedToken)) {
    return next();
  }

  return res.status(403).json({ success: false, message: 'Invalid or missing CSRF token' });
};
