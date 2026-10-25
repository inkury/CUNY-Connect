/*
  User routes for CUNY-Connect.
  This file handles the logged-in user's own account, saved events, followed clubs, and dashboard data.
  Owner: Person 1 (PATCH /me) and Person 4 (saved, following, and dashboard routes)
  TODO: Person 1 makes PATCH /me update only the name and campus, never the email, role, or password.
  Person 4 makes the saved and following routes add or remove an id with $addToSet and $pull,
  and makes the dashboard route return saved events plus upcoming events from followed clubs.
*/
const express = require('express');
const { protect } = require('../middleware/auth');
const notImplemented = require('../utils/notImplemented');

const router = express.Router();

// Every route here is about the logged-in user, so protect runs once for the whole router.
router.use(protect);

// Person 1 owns profile updates because they are part of the account system.
// This path is relative to /api/users, where index.js mounts this router.
router.patch('/me', notImplemented);

// Person 4 owns saving, following, and the dashboard because they feed the Dashboard page.
router.post('/me/saved/:eventId', notImplemented);

router.delete('/me/saved/:eventId', notImplemented);

router.post('/me/following/:clubId', notImplemented);

router.delete('/me/following/:clubId', notImplemented);

router.get('/me/dashboard', notImplemented);

module.exports = router;
