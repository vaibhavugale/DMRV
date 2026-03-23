import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { seed } from './seed/seed';
import { auditTrailMiddleware, getAuditLog } from './middleware/audit-trail';
import authRoutes from './routes/auth';
import farmerRoutes from './routes/farmers';
import plotRoutes from './routes/plots';
import treeRoutes from './routes/trees';
import activityRoutes from './routes/activities';
import syncRoutes from './routes/sync';
import reportRoutes from './routes/reports';
import projectRoutes from './routes/projects';
import saplingDemandRoutes from './routes/sapling-demands';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

// Core Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(auditTrailMiddleware);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'agroforestry-dmrv-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/plots', plotRoutes);
app.use('/api/trees', treeRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sapling-demands', saplingDemandRoutes);

// Audit log endpoint (admin only)
app.get('/api/audit-log', (_req, res) => {
  res.json({ data: getAuditLog() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

// Start server
async function start() {
  await connectDatabase();
  try {
    console.log('Initiating auto-seed on startup...');
    await seed();
  } catch (e) {
    console.error('Auto-seed failed:', e);
  }
  app.listen(PORT, () => {
    console.log(`🌿 Agroforestry DMRV API running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
}

start().catch(console.error);

export default app;
