import app from '../server/src/index.js';

export default function handler(req: any, res: any) {
  // 1. Root /api ping and health check
  if (req.url === '/api' || req.url === '/api/' || req.url === '/' || req.url === '') {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      status: 'UP',
      service: 'DeepAstro Cosmic Intelligence API',
      version: '6.4.0',
      environment: process.env.NODE_ENV || 'production',
      timestamp: new Date().toISOString()
    }));
  }

  // 2. Ensure /api prefix is preserved if stripped by proxy or serverless gateway
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  // 3. Delegate to Express app
  return app(req, res);
}
