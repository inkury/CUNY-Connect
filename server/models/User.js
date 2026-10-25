/*
  User model for CUNY-Connect.
  This file defines the schema for every account, whether the person is a student,
  a club officer, or an admin.
  Each user will have a name, an email that is required, unique, and lowercase, a campus,
  a bcrypt password hash, a role of student, officer, or admin that defaults to student,
  the events they saved, and the clubs they follow.
  Owner: Person 1
  TODO: Add these fields to the schema, keep the password hash out of API responses,
  and optionally add a comparePassword method that uses bcrypt.
*/
const mongoose = require('mongoose');

// The schema stays empty until the fields above are added, but timestamps give every user createdAt and updatedAt for free.
const userSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
