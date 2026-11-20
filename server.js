import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { autoSeedIfEmpty } from './seeds/seedInit.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('CORS policy does not allow access from this origin'));
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'StudentHub API',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve frontend build if present (for single-service deployment on Render / Heroku / Railway)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distCandidates = [
  path.resolve(__dirname, '../frontend/dist'),
  path.resolve(__dirname, 'frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
];
const frontendDist = distCandidates.find((d) => fs.existsSync(d));

if (frontendDist) {
  console.log(`[Static] Serving frontend static assets from: ${frontendDist}`);
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

export const startServer = async () => {
  try {
    await connectDB();
    await autoSeedIfEmpty();

    return new Promise((resolve) => {
      const server = app.listen(PORT, () => {
        console.log(`\n======================================================`);
        console.log(` StudentHub Server running on port ${PORT}`);
        console.log(` REST API URL: http://localhost:${PORT}/api`);
        console.log(` Health Check: http://localhost:${PORT}/api/health`);
        console.log(`======================================================\n`);
        resolve(server);
      });
    });
  } catch (error) {
    console.error('[Server] Fatal startup error:', error.message);
    process.exit(1);
  }
};

// Auto start if executed directly
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  startServer();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[UnhandledRejection] Error: ${err.message}`);
});

export default app;
