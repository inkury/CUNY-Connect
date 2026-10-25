/*
  Entry point for the CUNY-Connect API server.
  This file loads the environment variables, sets up CORS and JSON parsing, connects to MongoDB,
  mounts every route file under /api, and registers the error handler.
  Owner: Person 1
  TODO: Add request logging and security middleware such as helmet and rate limiting,
  and serve the built client from client/dist when the app is deployed.
*/

// dotenv has to run before anything else so every file below can read process.env.
require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const clubRoutes = require('./routes/clubs');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Only our own client is allowed to call the API from a browser.
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// This gives the team and the hosting service a quick way to confirm the server is up.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Each router defines its paths relative to the prefix it is mounted on here.
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/admin', adminRoutes);

// Unknown API paths get a JSON 404 instead of Express's HTML page, so the client can always parse the response.
app.use('/api', (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// The error handler is registered last so it catches errors from every route above.
app.use(errorHandler);

connectDB();

const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// A clear message here saves time on macOS, where AirPlay Receiver often holds port 5000.
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Set a different PORT in server/.env.`);
    process.exit(1);
  }
  throw err;
});
