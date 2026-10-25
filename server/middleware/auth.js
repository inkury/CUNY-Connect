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

/**
 * Checks the JWT on the request and attaches the user to req.user.
 *
 * @param {object} req The incoming request.
 * @param {object} res The response object.
 * @param {function} next Passes control to the next middleware.
 */
function protect(req, res, next) {
  // Every request is let through for now so the routes behind it can still return their 501 placeholders.
  next();
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
    next();
  };
}

module.exports = { protect, requireRole };
