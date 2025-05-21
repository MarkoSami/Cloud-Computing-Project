const config = {
  server: {
    port: process.env.PORT || 8000
  },
  env: process.env.NODE_ENV || 'development',
  cors: {
    origin: '*' // Allow all origins in development mode
  }
};

module.exports = config; 