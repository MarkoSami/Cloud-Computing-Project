const express = require('express');
const cors = require('cors');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 8002;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'reporting-service' });
});

app.listen(PORT, () => {
  console.log(`Reporting service running on port ${PORT}`);
}); 