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
const NY_TIME_ZONE = 'America/New_York';
const nyDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: NY_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function nyMidnightUtc(year, month, day) {
  const target = Date.UTC(year, month - 1, day);
  let candidate = target;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = Object.fromEntries(
      nyDateFormatter.formatToParts(candidate)
        .filter(part => part.type !== 'literal')
        .map(part => [part.type, Number(part.value)])
    );
    const representedLocalTime = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second
    );
    const adjustment = target - representedLocalTime;

    if (adjustment === 0) return new Date(candidate);
    candidate += adjustment;
  }

  return new Date(candidate);
}

function parseDateParts(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const [year, month, day] = date.split('-').map(Number);
  const validationDate = new Date(Date.UTC(year, month - 1, day));
  if (
    validationDate.getUTCFullYear() !== year
    || validationDate.getUTCMonth() !== month - 1
    || validationDate.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

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
    const parts = parseDateParts(date);
    if (!parts) {
      return res.status(400).json({ message: 'date must be a valid YYYY-MM-DD date' });
    }

    const start = nyMidnightUtc(parts.year, parts.month, parts.day);
    const nextDay = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + 1));
    const end = nyMidnightUtc(
      nextDay.getUTCFullYear(),
      nextDay.getUTCMonth() + 1,
      nextDay.getUTCDate()
    );
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
