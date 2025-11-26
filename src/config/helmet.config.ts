// src/config/helmet.config.ts
import { HelmetOptions } from 'helmet';

export const helmetConfig: HelmetOptions = {
  // ✅ Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", // Cho Swagger UI
        "https://fonts.googleapis.com"
      ],
      scriptSrc: [
        "'self'",
        // Nếu dùng external scripts
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https://res.cloudinary.com", // Cloudinary images
        "https://*.cloudinary.com"
      ],
      connectSrc: [
        "'self'",
        "https://api.cloudinary.com" // API calls to Cloudinary
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },

  // Cross Origin Embedder Policy - Tắt cho Swagger
  crossOriginEmbedderPolicy: false,

  // DNS Prefetch Control
  dnsPrefetchControl: {
    allow: false
  },

  // ✅ Frame Guard - Chống clickjacking
  frameguard: {
    action: 'deny'
  },

  // ✅ Hide X-Powered-By header
  hidePoweredBy: true,

  // ✅ HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },

  // IE No Open - IE8+ security
  ieNoOpen: true,

  // Don't Sniff Mimetype
  noSniff: true,

  // Origin Agent Cluster
  originAgentCluster: true,

  // Permitted Cross Domain Policies
  permittedCrossDomainPolicies: false,

  // Referrer Policy
  referrerPolicy: {
    policy: ["no-referrer", "strict-origin-when-cross-origin"]
  },

  // X-XSS Protection
  xssFilter: true,
};