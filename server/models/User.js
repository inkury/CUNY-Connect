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
const bcrpyt = require('bcrypt');

// The schema stays empty until the fields above are added, but timestamps give every user createdAt and updatedAt for free.
const userSchema = new mongoose.Schema({
  name: {type: String, require: true, trim: true }, 
  email: {
    type: String,
    require: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  campus: { type: String, index: true},
  // Password: stored as a bcrypt hash as said in the comments above. 
  password: {type: String, required: true, select: false },
  role: {
    type: String,
    enum: ['student', 'officer', 'adimin'],
    default: 'student',
  }, 
  savedEvents: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    default: [],
  }, 
  following: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club' }],
    default: [],
  },
}, { timestamps: true });

// Hashing the password before saving it for either it being set or changed
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrpyt.hash(this.password, 10);
});

//Comparing the password to the stored hash password.
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

//Ensuring the password hash never shows up in JSON API 
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
})

module.exports = mongoose.model('User', userSchema);