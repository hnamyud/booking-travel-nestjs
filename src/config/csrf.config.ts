import { doubleCsrf } from 'csrf-csrf';
import { Request, Response, NextFunction } from 'express';

export const CSRF_SECRET = process.env.CSRF_SECRET || 'secret-key-nen-de-trong-env';
export const COOKIE_NAME = 'x-csrf-token';

const doubleCsrfUtilities = doubleCsrf({
  getSecret: () => CSRF_SECRET,
  cookieName: COOKIE_NAME,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req: Request) => {
    return req.headers['x-csrf-token'] as string;
  },

  getSessionIdentifier: (req: Request) => {
    // Trả về định danh của session (ví dụ: cookie chứa access_token)
    // Thay 'access_token' bằng tên cookie thật mà bro đang dùng để lưu JWT
    // Nếu user chưa login (guest), trả về chuỗi rỗng "" hoặc một UUID ngẫu nhiên
    return req.cookies?.['access_token'] || ''; 
  },
});

export const generateToken = doubleCsrfUtilities.generateCsrfToken; 
export const doubleCsrfProtection = doubleCsrfUtilities.doubleCsrfProtection;

export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ignoredPaths = [
    '/api/docs', 
    '/docs', 
    '/health', 
    '/csrf-token',
    '/api/v1/csrf-token',
    '/api/v1/auth/login',  // ✅ THÊM - Login endpoint
    '/api/v1/auth/register', // ✅ THÊM - Register endpoint  
    '/api/v1/auth/refresh',  // ✅ THÊM - Refresh token
    '/api/v1/auth/forgot-password', // ✅ THÊM - Forgot password
    '/api/v1/auth/reset-password', // ✅ THÊM - Reset password
];
  if (ignoredPaths.some((path) => req.originalUrl.startsWith(path))) {
    return next();
  }
  return doubleCsrfProtection(req, res, next);
};

export const csrfErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  res.status(403).json({
    statusCode: 403,
    message: 'Invalid CSRF Token',
    error: 'Forbidden',
  });
};