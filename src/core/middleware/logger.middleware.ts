// src/core/middleware/logger.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface LoggedRequest extends Request {
  requestId: string;
  startTime: number;
  user?: {
    _id: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const loggedReq = req as LoggedRequest;
    
    // Setup request metadata
    loggedReq.requestId = this.generateRequestId();
    loggedReq.startTime = Date.now();

    // Extract request information
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const userId = loggedReq.user?._id || 'anonymous';

    // Log incoming request
    this.logger.log(
      `📥 [${loggedReq.requestId}] ${method} ${originalUrl} - IP: ${ip} - User: ${userId}`
    );

    // Log user agent if available
    if (userAgent) {
      this.logger.debug(
        `[${loggedReq.requestId}] User-Agent: ${userAgent.slice(0, 200)}`,
        'HTTP'
      );
    }

    // Use response finish event (cleaner approach)
    res.on('finish', () => {
      this.logResponse(loggedReq, res);
    });

    // Handle response close event (for aborted requests)
    res.on('close', () => {
      if (!res.finished) {
        this.logger.warn(
          `🔌 [${loggedReq.requestId}] Connection closed: ${method} ${originalUrl}`,
          'HTTP'
        );
      }
    });

    next();
  }

  private logResponse(req: LoggedRequest, res: Response): void {
    const duration = Date.now() - req.startTime;
    const { statusCode } = res;
    const contentLength = res.get('content-length') || '0';
    const { method, originalUrl } = req;

    // Create structured log message
    const logData = {
      requestId: req.requestId,
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
      size: `${contentLength}b`,
      ip: req.ip,
      userId: req.user?._id || 'anonymous',
    };

    // Determine appropriate log level
    let logLevel: 'log' | 'warn' | 'error' = 'log';
    if (statusCode >= 500) logLevel = 'error';
    else if (statusCode >= 400) logLevel = 'warn';

    const statusEmoji = this.getStatusEmoji(statusCode);
    
    // Log with structured data
    this.logger[logLevel](
      `📤 [${req.requestId}] ${statusEmoji} ${method} ${originalUrl} ${statusCode} - ${duration}ms - ${contentLength}b`
    );

    // Additional context for errors and slow requests
    if (statusCode >= 400) {
      this.logger.error(`Request failed with status ${statusCode}`, JSON.stringify(logData, null, 2));
    }

    if (duration > 2000) { // > 2 seconds
      this.logger.warn(`Slow request detected: ${duration}ms`, JSON.stringify(logData, null, 2));
    }

    // Debug log for development
    this.logger.debug(`Request completed: ${JSON.stringify(logData)}`, 'HTTP');
  }

  private generateRequestId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 9);
    return `${timestamp}-${randomStr}`;
  }

  private getStatusEmoji(statusCode: number): string {
    if (statusCode >= 500) return '🔥'; // Server error
    if (statusCode >= 400) return '❌'; // Client error  
    if (statusCode >= 300) return '🔄'; // Redirect
    if (statusCode >= 200) return '✅'; // Success
    return 'ℹ️'; // Info
  }
}