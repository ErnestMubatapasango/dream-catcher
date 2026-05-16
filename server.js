import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import helmet from 'helmet'
import { initDatabase } from './config/database-init.js';
import dreamsRouter from './routes/dreams.js';
import { uptime } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Add securiy headers
if (process.env.NODE_ENV === 'production') {
  app.use(helmet()); 
}

const PORT = process.env.PORT || 3001;
 
// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// API Routes
app.use('/api/dreams', dreamsRouter);

//Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1'); // Simple query to check DB connection
    res.status(200).json({ 
      status: 'OK', 
      message: 'Server is running and database is connected',
      uptime: uptime(),
      db: 'Connected'
     });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'Error', 
      message: error.message,
      uptime: uptime(),
      db: 'Connection failed'
     });
  }
})

// Initialize database then start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
});
