/*
  Club routes for CUNY-Connect.
  This file handles listing clubs, showing a club's profile, requesting a new club, and editing a club.
  Owner: Person 2
  TODO: Implement each route. The list returns approved clubs only, with an optional campus filter.
  A single club includes its officers and upcoming events, or returns 404 when it does not exist.
  A new club starts unapproved and its creator becomes an officer. Only that club's officers may edit it.
*/
const express = require('express');
const { protect, requireRole } = require('../middleware/auth');
const notImplemented = require('../utils/notImplemented');

const router = express.Router();

// Anyone can browse clubs, so the read routes do not require a login.
// These paths are relative to /api/clubs, where index.js mounts this router.
router.get('/', notImplemented);

router.get('/:id', notImplemented);

// Any logged-in student can request a club, since that is how new officers get started.
router.post('/', protect, notImplemented);

// Editing requires an officer, and the handler must also confirm the officer belongs to this club.
router.patch('/:id', protect, requireRole('officer'), notImplemented);

module.exports = router;
