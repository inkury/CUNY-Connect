/*
  Authentication middleware for CUNY-Connect.
  This file provides protect, which checks the JWT on a request and attaches the user to req.user,
  and requireRole, which blocks users whose role is not allowed on a route.
  Owner: Person 1
  TODO: Make protect read the Bearer token from the Authorization header, verify it with JWT_SECRET,
  load the user without the password hash, and respond 401 when the token is missing or invalid.
  Make requireRole respond 403 when the user's role is not in the allowed list.
  Add a helper that checks whether the user is an officer of a given club, since Person 2 needs it.
*/

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Club = require('../models/Club');

/**
 * Checks the JWT on the request and attaches the user to req.user.
 *
 * @param {object} req The incoming request.
 * @param {object} res The response object.
 * @param {function} next Passes control to the next middleware.
 */
async function protect(req, res, next) {
  try {
    
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // password has select: false in the model, so it is not loaded here.
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user no longer exists' });
    }

    req.user = user;
    return next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
    return next(err);
  }
}

/**
 * Builds middleware that only lets users with one of the given roles continue.
 *
 * @param {...string} roles The roles allowed on the route, such as 'officer' or 'admin'.
 * @returns {function} Middleware that checks req.user.role before calling next.
 */
function requireRole(...roles) {
  // The role check is skipped for now because there is no logged-in user to read a role from yet.
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized'});
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to do this'});
    }
    return next();
  };
}

/**
 * Checks whether a user is one of the officers of a club. Person 2 needs this
 * on the event and club routes that are limited to the host club's officers.
 *
 * @param {object} user The logged-in user (req.user).
 * @param {string} clubId The id of the club to check.
 * @returns {Promise<boolean>} True if the user is an officer of that club.
 */

async function isClubOfficer(user, clubId) {
  if (!user || !mongoose.isValidObjectId(cludID)) {
    return false;
  }
  const club = await club.findByID(clubID).select('officers');
  if (!club) {
    return false;
  }
  return club.officers.some((officerID) => officerID.equals(user._id));
}

module.exports = { protect, requireRole };
