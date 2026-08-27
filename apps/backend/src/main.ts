import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Increase payload size limit for base64 image uploads (logos, banners)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // Restricted CORS for Secure Production Origins
  const allowedOrigins = [
    'https://techno-mania.az',
    'https://www.techno-mania.az',
    'https://erp.techno-mania.az',
    'https://api.techno-mania.az',
    'http://techno-mania.az',
    'http://www.techno-mania.az',
    'http://erp.techno-mania.az',
    'http://127.0.0.1:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3001',
    'http://localhost:3001',
    'http://169.58.132.249',
  ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, server-to-server curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.techno-mania.az')) {
        callback(null, true);
      } else {
        callback(new Error('CORS siyasəti: Bu domendən API-yə daxil olmağa icazə verilmir.'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,X-ERP-API-KEY,x-erp-api-key,Accept,Cache-Control,Pragma',
    credentials: true,
  });

  // Security Middleware for HTTP Response Headers
  app.use((req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Global prefix for all NestJS API endpoints
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 TechnoMania Central API Server is running on http://0.0.0.0:${port}/api`);
}
bootstrap();
