/*
  Event routes for CUNY-Connect.
  This file handles listing, viewing, creating, editing, and deleting events,
  including filtering the feed by campus, date, and category.
  Owner: Person 2
  TODO: Implement the write routes. Validate required fields, dates, and ids.
  Only officers of the host club may create, edit, or delete its events.
*/
const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');
// Register Club so populate also works when this router is loaded on its own.
require('../models/Club');
const { protect, requireRole } = require('../middleware/auth');
const notImplemented = require('../utils/notImplemented');

const router = express.Router();

// Anyone can browse events, so the read routes do not require a login.
// These paths are relative to /api/events, where index.js mounts this router.
router.get('/', async (req, res) => {
  const now = new Date();
  const filter = { dateTime: { $gte: now } };

  for (const field of ['campus', 'category']) {
    if (req.query[field] !== undefined) {
      if (typeof req.query[field] !== 'string') {
        return res.status(400).json({ message: `${field} must be a string` });
      }
      filter[field] = req.query[field];
    }
  }

  if (req.query.date !== undefined) {
    const date = req.query.date;
    // Regex ensures that it stays in this format: 'YYYY-MM-DD'
    const start = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? new Date(`${date}T00:00:00.000Z`)
      : new Date(NaN);

    if (Number.isNaN(start.getTime()) || start.toISOString().slice(0, 10) !== date) {
      return res.status(400).json({ message: 'date must be a valid YYYY-MM-DD date' });
    }
    // Creating an end boundary fo exactly one day.
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    filter.dateTime = { $gte: new Date(Math.max(now.getTime(), start.getTime())), $lt: end };
  }

  const events = await Event.find(filter)
    .sort({ dateTime: 1 })
    .populate('hostClub', '_id name campus');

  res.json(events);
});

router.get('/:id', async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const event = await Event.findById(req.params.id)
    .populate('hostClub', '_id name campus');

  if (!event) return res.status(404).json({ message: 'Event not found' });

  res.json(event);
});

// Changing an event requires an officer, and each handler must also confirm the officer belongs to the host club.
router.post('/', protect, requireRole('officer'), notImplemented);

router.patch('/:id', protect, requireRole('officer'), notImplemented);

router.delete('/:id', protect, requireRole('officer'), notImplemented);

module.exports = router;
