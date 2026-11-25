/*
  Event routes for CUNY-Connect.
  This file handles listing, viewing, creating, editing, and deleting events,
  including filtering the feed by campus, date, and category.
  Owner: Person 2
  Only officers of the host club may create, edit, or delete its events.
*/
const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');
// Register Club so populate also works when this router is loaded on its own.
require('../models/Club');
const { CAMPUSES, CATEGORIES } = require('../constants');
const { protect, requireRole, isClubOfficer } = require('../middleware/auth');

const router = express.Router();
const eventFields = ['title', 'description', 'dateTime', 'location', 'campus', 'category'];
const populatedHostClub = '_id name campus';
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

function validateEventFields(body, { partial = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be an object' };
  }

  if (partial && Object.hasOwn(body, 'hostClub')) {
    return { error: 'hostClub cannot be changed' };
  }

  const allowedFields = partial ? eventFields : [...eventFields, 'hostClub'];
  const unknownField = Object.keys(body).find(field => !allowedFields.includes(field));
  if (unknownField) return { error: `Unknown event field: ${unknownField}` };

  const values = {};
  for (const field of eventFields) {
    if (!Object.hasOwn(body, field)) continue;
    const value = body[field];

    if (field === 'dateTime') {
      if (typeof value !== 'string' || value.trim() === '') {
        return { error: 'dateTime must be a valid future date' };
      }
      const dateTime = new Date(value);
      if (Number.isNaN(dateTime.getTime()) || dateTime.getTime() <= Date.now()) {
        return { error: 'dateTime must be a valid future date' };
      }
      values.dateTime = dateTime;
      continue;
    }

    if (typeof value !== 'string') {
      return { error: `${field} must be a string` };
    }
    if (field === 'title' && value.trim() === '') {
      return { error: 'title is required' };
    }
    if (field === 'campus' && !CAMPUSES.includes(value)) {
      return { error: 'campus must be a valid campus' };
    }
    if (field === 'category' && !CATEGORIES.includes(value)) {
      return { error: 'category must be a valid category' };
    }
    values[field] = field === 'title' ? value.trim() : value;
  }

  if (!partial && (!values.title || !values.dateTime)) {
    return { error: 'title and dateTime are required' };
  }
  if (partial && Object.keys(values).length === 0) {
    return { error: 'At least one event field is required' };
  }

  return { values };
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
router.post('/', protect, requireRole('officer'), async (req, res) => {
  const { values, error } = validateEventFields(req.body);
  if (error) return res.status(400).json({ message: error });

  if (!mongoose.isObjectIdOrHexString(req.body.hostClub)) {
    return res.status(400).json({ message: 'hostClub must be a valid club id' });
  }
  if (!await isClubOfficer(req.user, req.body.hostClub)) {
    return res.status(403).json({ message: 'Only a host club officer can manage its events' });
  }

  const event = await Event.create({ ...values, hostClub: req.body.hostClub });
  await event.populate('hostClub', populatedHostClub);
  return res.status(201).json(event);
});

router.patch('/:id', protect, requireRole('officer'), async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const { values, error } = validateEventFields(req.body, { partial: true });
  if (error) return res.status(400).json({ message: error });

  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  const hostClubId = event.hostClub?._id || event.hostClub;
  if (!await isClubOfficer(req.user, hostClubId)) {
    return res.status(403).json({ message: 'Only a host club officer can manage its events' });
  }

  event.set(values);
  await event.save();
  await event.populate('hostClub', populatedHostClub);
  return res.json(event);
});

router.delete('/:id', protect, requireRole('officer'), async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  const hostClubId = event.hostClub?._id || event.hostClub;
  if (!await isClubOfficer(req.user, hostClubId)) {
    return res.status(403).json({ message: 'Only a host club officer can manage its events' });
  }

  await event.deleteOne();
  return res.status(204).end();
});

module.exports = router;
