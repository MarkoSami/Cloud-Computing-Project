const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const config = require('./config');
const app = express();
const PORT = config.server.port;

// Middleware
app.use(cors({
  origin: config.cors.origin
}));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    service: 'user-service',
    environment: config.env
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message,
    stack: config.env === 'production' ? '🥞' : err.stack
  });
});

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT} in ${config.env} mode`);
}); 