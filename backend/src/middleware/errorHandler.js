import { config } from '../config/index.js';

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (config.nodeEnv !== 'test') {
    console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`);
  }

  if (err.name === 'CastError') {
    error = { message: 'Resource not found', statusCode: 404 };
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = { message: `Duplicate ${field} value entered`, statusCode: 400 };
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  if (err.name === 'JsonWebTokenError') {
    error = { message: 'Invalid token', statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    error = { message: 'Token expired', statusCode: 401 };
  }

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const message = err.errors?.map(e => e.message).join(', ') || 'Validation error';
    error = { message, statusCode: 400 };
  }

  if (err.name === 'MulterError') {
    error = { message: 'File upload error', statusCode: 400 };
  }

  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message || 'Server Error',
  };

  if (config.nodeEnv === 'development' && err.stack) {
    response.stack = err.stack.split('\n').slice(0, 5);
  }

  res.status(statusCode).json(response);
};
