import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/authRoutes.js';
import driveRoutes from './routes/driveRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';
import { googleDriveService } from './services/googleDriveService.js';
import prisma from './prisma.js';
import { seedDatabase } from './prisma/seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: true, // Allow same origin and dev ports in production
    credentials: true,
  })
);
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    system: 'JADE Office Management System',
    timestamp: new Date().toISOString(),
    driveStatus: googleDriveService.getStatus(),
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/drive', driveRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/metrics', metricsRoutes);

// Unified Production Hosting: Serve compiled React SPA
const possibleDistPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), 'public'),
];

let frontendDist: string | null = null;
for (const p of possibleDistPaths) {
  if (fs.existsSync(path.join(p, 'index.html'))) {
    frontendDist = p;
    break;
  }
}

if (frontendDist) {
  console.log(`[Hosting] Serving unified production frontend from: ${frontendDist}`);
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist!, 'index.html'));
  });
}

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(Number(PORT), '0.0.0.0', async () => {
  console.log(`====================================================`);
  console.log(`  JADE Office Management System Production Active`);
  console.log(`  Local Access:      http://localhost:${PORT}`);
  console.log(`  Network Access:    http://0.0.0.0:${PORT}`);
  console.log(`  API Health:        http://localhost:${PORT}/api/health`);
  console.log(`  Target Drive User: umeshmabatuwana@gmail.com`);
  console.log(`====================================================`);

  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('[Bootstrap] Fresh database detected. Auto-seeding initial personnel and catalog...');
      await seedDatabase();
      console.log('[Bootstrap] Initial database seeding completed.');
    }
  } catch (err) {
    console.warn('[Bootstrap] Database check notice:', err);
  }
});

export default app;
