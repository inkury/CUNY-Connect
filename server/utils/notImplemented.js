/*
  Placeholder route handler for CUNY-Connect.
  This file sends a 501 Not Implemented response for routes that have not been built yet.
  Swap it for a real handler when you implement your route.
  Owner: Person 1
  TODO: Delete this file once every route has a real handler and nothing imports it.
*/

/**
 * Responds with 501 Not Implemented and names the route that was called.
 *
 * @param {object} req The incoming request.
 * @param {object} res The response object.
 */
function notImplemented(req, res) {
  res.status(501).json({
    message: 'Not Implemented',
    route: `${req.method} ${req.originalUrl}`,
  });
}

module.exports = notImplemented;
