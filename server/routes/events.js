/*
  Event routes for CUNY-Connect.
  This file handles listing, viewing, creating, editing, and deleting events,
  including filtering the feed by campus, date, and category.
  Owner: Person 2
  TODO: Implement each route. The list returns upcoming events sorted by date with the host club's name,
  and a single event returns 404 when it does not exist. Validate required fields, dates, and ids.
  Only officers of the host club may create, edit, or delete its events.
*/
const express = require('express');
const { protect, requireRole } = require('../middleware/auth');
const notImplemented = require('../utils/notImplemented');

const router = express.Router();

// Anyone can browse events, so the read routes do not require a login.
// These paths are relative to /api/events, where index.js mounts this router.
router.get('/', notImplemented);

router.get('/:id', notImplemented);

// Changing an event requires an officer, and each handler must also confirm the officer belongs to the host club.
router.post('/', protect, requireRole('officer'), notImplemented);

router.patch('/:id', protect, requireRole('officer'), notImplemented);

router.delete('/:id', protect, requireRole('officer'), notImplemented);

module.exports = router;
