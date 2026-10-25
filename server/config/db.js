/*
  MongoDB connection for CUNY-Connect.
  This file connects mongoose to the database using MONGO_URI from server/.env.
  Owner: Person 1
  TODO: Decide whether a failed connection should stop the server in production,
  and point MONGO_URI at the shared Atlas cluster for deployment.
*/
const mongoose = require('mongoose');

/**
 * Connects mongoose to MongoDB using the MONGO_URI environment variable.
 *
 * The connection is skipped when MONGO_URI is missing or still the placeholder,
 * and a failed connection is logged instead of crashing the server.
 *
 * @returns {Promise<void>} Resolves once the connection attempt has finished.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;

  // The database is skipped when MONGO_URI is still the placeholder, so the server can boot before it is filled in.
  if (!uri || uri.includes('<')) {
    console.warn('MONGO_URI is not set in server/.env - skipping MongoDB connection.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    // Logging instead of exiting keeps the health check and stub routes usable while the database is unreachable.
    console.error(`MongoDB connection failed: ${err.message}`);
  }
}

module.exports = connectDB;
