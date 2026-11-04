/*
  Auth routes for CUNY-Connect.
  This file handles creating an account, logging in, and returning the logged-in user.
  Owner: Person 1
  TODO: Implement each route. Register validates the input and creates the user (the User
  model hashes the password on save), then returns a token and the user. Login selects
  the password explicitly with select('+password') and calls user.comparePassword()
  and returns a token and the user, with a generic 401 message on bad credentials.
  Me returns req.user. The password hash must never be sent to the client.
*/
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// These paths are relative to /api/auth, where index.js mounts this router.
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, campus } = req.body;

    if ([name, email, password].some((v) => typeof v !== 'string')) {
      return res.status(400).json({ message: 'Name, email, and password must be text' });
    }
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists' });
    }

    //Meant to serve as restriction so nobody can sign up as an admin, by only being ready from the body
    const user = await User.create({ name, email, password, campus });

    return res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    return next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email and password must be text' });
    }
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    const matches = user && (await user.comparePassword(password));
    if (!matches) {
      // Same message for a wrong email and a wrong password. Necessary precaution message.
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({ token: signToken(user), user });
  } catch (err) {
    return next(err);
  }
});

// Only this route needs a token, because register and login are how a user gets one.
router.get('/me', protect, (req, res) => {
  res,json({ user: req.user });
});

module.exports = router;