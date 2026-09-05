import dotenv from 'dotenv';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const loadOrCreateSecret = (filename) => {
  const secretFile = path.join(process.cwd(), filename);
  try {
    if (fs.existsSync(secretFile)) {
      return fs.readFileSync(secretFile, 'utf8').trim();
    }
    const secret = crypto.randomBytes(48).toString('hex');
    fs.writeFileSync(secretFile, secret, { mode: 0o600 });
    return secret;
  } catch {
    return crypto.randomBytes(48).toString('hex');
  }
};

const loadSecret = (envName, filename) => {
  const configured = process.env[envName];
  if (configured && configured.length >= 32) return configured;
  if (isProduction) {
    throw new Error(`${envName} must be configured with at least 32 characters in production`);
  }
  return loadOrCreateSecret(filename);
};

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/plannerhub',
  postgresUrl: process.env.DATABASE_URL || process.env.POSTGRES_URL || '',
  postgresCa: process.env.POSTGRES_CA || '',
  sqlPath: process.env.SQL_PATH || './data/plannerhub.sqlite',
  jwtSecret: loadSecret('JWT_SECRET', '.jwt-secret'),
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  cookieExpire: parseInt(process.env.COOKIE_EXPIRE) || 7,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  sessionSecret: loadSecret('SESSION_SECRET', '.session-secret'),
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
  lockoutDuration: parseInt(process.env.LOCKOUT_DURATION) || 15,
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
};