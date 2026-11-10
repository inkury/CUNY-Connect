/*
  Club model for CUNY-Connect.
  This file defines the schema for a student club at a CUNY campus.
  Each club will have a name, a campus, a description, the users who are its officers,
  and an approved flag that starts as false until an admin approves the club.
  Owner: Person 2
*/
const mongoose = require('mongoose');
const { CAMPUSES, CATEGORIES } = require('../constants');

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  campus: { type: String, enum: CAMPUSES, index: true },
  category: { type: String, enum: CATEGORIES, index: true },
  description: String,
  // Populate officers to load User profiles; User excludes passwords by default.
  officers: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  },
  approved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Club', clubSchema);
