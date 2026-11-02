/*
  Event model for CUNY-Connect.
  This file defines the schema for an event hosted by a club.
  Each event will have a title, a date and time, a location, a campus, a category
  such as academic, social, or career, the club hosting it, and a description.
  Owner: Person 2
*/
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  dateTime: { type: Date, required: true, index: true },
  location: String,
  campus: { type: String, index: true },
  category: { type: String, index: true },
  hostClub: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
