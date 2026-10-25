/*
  Auth routes for CUNY-Connect.
  This file handles creating an account, logging in, and returning the logged-in user.
  Owner: Person 1
  TODO: Implement each route. Register validates the input, hashes the password with bcrypt,
  creates the user, and returns a token and the user. Login checks the password with bcrypt
  and returns a token and the user, with a generic 401 message on bad credentials.
  Me returns req.user. The password hash must never be sent to the client.
*/
const express = require('express');
const { protect } = require('../middleware/auth');
const notImplemented = require('../utils/notImplemented');

const router = express.Router();

// These paths are relative to /api/auth, where index.js mounts this router.
router.post('/register', notImplemented);

router.post('/login', notImplemented);

// Only this route needs a token, because register and login are how a user gets one.
router.get('/me', protect, notImplemented);

module.exports = router;
