/*
  Club model for CUNY-Connect.
  This file defines the schema for a student club at a CUNY campus.
  Each club will have a name, a campus, a description, the users who are its officers,
  and an approved flag that starts as false until an admin approves the club.
  Owner: Person 2
  TODO: Add these fields to the schema, index campus for the club list filter,
  and decide whether club names must be unique per campus.
*/
const mongoose = require('mongoose');

// The schema stays empty until the fields above are added, but timestamps let the admin page sort pending clubs by age.
const clubSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('Club', clubSchema);
