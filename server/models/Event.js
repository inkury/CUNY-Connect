/*
  Event model for CUNY-Connect.
  This file defines the schema for an event hosted by a club.
  Each event will have a title, a date and time, a location, a campus, a category
  such as academic, social, or career, the club hosting it, and a description.
  Owner: Person 2
  TODO: Add these fields to the schema, and index campus, dateTime, and category
  so the feed filters stay fast.
*/
const mongoose = require('mongoose');

// The schema stays empty until the fields above are added, but timestamps record when each event was posted.
const eventSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
